<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="getSpeakers()">Show who's stream</button>
    <ul av-if="socketsWithStream" id="stream-list">
      <li v-for="item in socketsWithStream" :key="item" @click="connectToSocket(item)">{{ item }}</li>
    </ul>
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
import io, { connect } from "socket.io-client";

@Component
export default class Watcher extends Vue {
  private msg: string;
  @Prop() public video?: any;
  private socket: any;
  private peerConnection: RTCPeerConnection;
  @Prop() private socketsWithStream: Array<any>;
  private currentStreamer?: string;

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
    this.socketsWithStream = [];

    this.socket = io("https://stream.mgrabiec.pl/");
    //this.socket = io("http://localhost:3000");
    //socket listeners
    this.peerConnection = new RTCPeerConnection(config);
    this.socket.on("offer", (id: string, description: any) => {
      this.peerConnection = new RTCPeerConnection(config);
      if (this.peerConnection) {
        this.peerConnection
          .setRemoteDescription(description)
          .then(() => this.peerConnection.createAnswer())
          .then((sdp) => this.peerConnection.setLocalDescription(sdp))
          .then(() => {
            this.currentStreamer = id;
            this.socket.emit("answer",id,this.peerConnection.localDescription);
          });
      }
      this.peerConnection.ontrack = (event) => {
        this.video = event.streams[0];
      };

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit("candidate", id, event.candidate);
        }
      };
    });

    this.socket.on("candidate", (id: string, candidate: any) => {
      if (this.peerConnection) {
        this.peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.error(e));
      }
    });

    this.socket.on("broadcast", () => {
      this.socket.emit("watcher");
    });

    this.socket.on("disconnectPeer", () => {
      if (this.peerConnection) this.peerConnection.close();
    });

    this.socket.on("speakersList", (list: any) => {
      this.socketsWithStream = list;
    });

    this.socket.on("endOfstream", (id: string) => {
      if (this.currentStreamer == id) alert("End of Stream");
      this.socketsWithStream = this.socketsWithStream.filter((s) => s != id);
    });
  }

  connectToSocket(id: any): void {
    this.socket.emit("watcher", id);
  }

  getSpeakers() {
    this.socket.emit("getSpeakers");
  }

  created() {
    window.onunload = window.onbeforeunload = () => {
      this.socket.close();
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
video {
  border: 3px solid black;
  width: 80vw;
  height: 60vw;
  padding: 3px;
}
</style>
