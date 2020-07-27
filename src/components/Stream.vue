<template>
  <div class="stream">
    <h1>{{msg}}</h1>
    <button id="start" @click="start()">Start</button>
    <button id="stop" @click="stop()">Stop</button>
    <button id="share" @click="share()">Share</button>
    <button id="share" @click="show()">Show connection</button>
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
    this.msg = "Hello";
    const config = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    };
    this.peerConnections=[];
    this.socket = io("http://localhost:3000");
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
    const tracks = this.video.getTracks();
    tracks.forEach((track: any) => track.stop());
    this.video = null;
  }
  share() {
    this.socket.emit("broadcaster");
  }

  show(){
    console.log(this.peerConnections)
  }
}
</script>

<style lang="scss" scoped>
</style>