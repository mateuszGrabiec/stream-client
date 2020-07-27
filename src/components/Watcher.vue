<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <!-- autoplay="autoplay" -->
    <video av-if="video" id="myVideoEl" ref="streamWindow" :srcObject.prop="video" autoplay="autoplay"></video>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import io from "socket.io-client";

@Component
export default class Watcher extends Vue {
  private msg: string;
  @Prop() public video?: any;
  private socket: any;
  private peerConnection: RTCPeerConnection;

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
   this.peerConnection = new RTCPeerConnection(config);
    //this.socket = io("https://stream.mgrabiec.pl/");
    this.socket = io("http://localhost:3000");
    //socket listeners
    this.socket.on("offer", (id: string, description: any) => {
       
      this.peerConnection
        .setRemoteDescription(description)
        .then(() => this.peerConnection.createAnswer())
        .then((sdp) => this.peerConnection.setLocalDescription(sdp))
        .then(() => {
          this.socket.emit("answer", id, this.peerConnection.localDescription);
        });

      this.peerConnection.ontrack = (event) => {
        this.video = event.streams[0];
        console.log(this.video);
      };

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit("candidate", id, event.candidate);
        }
      };
    });

    this.socket.on("candidate", (id: string, candidate: any) => {
      this.peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((e) => console.error(e));
    });

    this.socket.on("connect", () => {
      this.socket.emit("watcher");
    });

    this.socket.on("broadcaster", () => {
      this.socket.emit("watcher");
    });

    this.socket.on("disconnectPeer", () => {
      this.peerConnection.close();
    });

    window.onunload = window.onbeforeunload = () => {
      this.socket.close();
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
