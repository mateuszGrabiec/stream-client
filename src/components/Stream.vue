<template>
  <div class="stream">
    <h1>{{msg}}</h1>
    <h2>Your stream id:</h2>
    <h3 av-if="socket.id">{{socket.id}}</h3>
    <div class="button-wraapper">
    <button id="start" @click="start()">Start</button>
    <button id="stop" @click="stop()">Stop</button>
    </div>
    <video
      av-if="video"
      id="myVideoEl"
      ref="streamWindow"
      :srcObject.prop="video"
      autoplay="autoplay"
    ></video>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import io from "socket.io-client";

@Component
export default class Stream extends Vue {
  private msg: string;
  @Prop() public video?: any;
  private socket: any;
  private peerConnections: Array<RTCPeerConnection>

  constructor() {
    super();
    this.msg = "Stream component";
    const config = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    };
    this.peerConnections=[];
    this.socket = io("https://presentation.mgrabiec.usermd.net/");
    //socket listeners
    
    this.socket.on("watcher", (id: number) => {
      const peerConnection = new RTCPeerConnection(config);
      this.peerConnections[id] = peerConnection;

      this.video
        .getTracks()
        .forEach((track: any) => peerConnection.addTrack(track, this.video));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit("candidate", id, event.candidate);
        }
      };

      peerConnection
        .createOffer()
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
          this.socket.emit("offer", id, peerConnection.localDescription);
        });
    });

    this.socket.on("answer", (id: number, description: any) => {
      this.peerConnections[id].setRemoteDescription(description);
    });

    this.socket.on("candidate", (id: number, candidate: any) => {
      this.peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    this.socket.on("disconnectPeer", (id: number) => {
      this.peerConnections[id].close();
      delete this.peerConnections[id];
    });

    window.onunload = window.onbeforeunload = () => {
      this.socket.close();
    };
  }

  async start() {
    const constraints = {
      video: {
        cursor: "always",
      },
      audio: false,
    };
    const mediaDevices = navigator.mediaDevices as any;
    this.video = await mediaDevices
      .getDisplayMedia(constraints)
      .then((stream: any) => {
        this.socket.emit("broadcaster");
        return stream;
      })
      .catch((error: any) => {
        console.log(error);
        return null;
      });
  }

  stop() {
    this.socket.emit("end",this.socket.id)
    const tracks = this.video.getTracks();
    tracks.forEach((track: any) => track.stop());
    this.video = null;
  }

  created(){
    window.onunload = window.onbeforeunload = () => {
      this.socket.close();
    };
  }
}
</script>

<style lang="scss" scoped>
video {
  width: 80vw;
  height: 60vw;
  padding: 3px;
}
.stream{
  text-align: center;
}
.button-wraapper button{
  margin: 0px 5px;
  font-size: 20px;
  font-weight: 300;
  padding: 5px 5px 5px 5px;
  height: 50px;
  width: 70px;
  border-radius: 5px;
  display: inline-block;
  background-color: #fff;
}
.button-wraapper button:hover{
  font-weight: bold;
  color: #fff;
}

#start{
  border: 2px solid #4CAF50;
}

#stop{
  border: 2px solid #fab;
}

#start:hover{
  background-color: #4CAF50;
}
#stop:hover{
  background-color: #fab;
}
button {
  transition-duration: 0.4s;
}
</style>