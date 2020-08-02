<template>
  <div class="watcher">
    <h1>{{ msg }}</h1>
    <h2>Click id below to join strem</h2>
    <p>If the list is empty is sign, that no one is streaming</p>
    <button @click="getSpeakers()">Show who's stream</button>
    <ul av-if="socketsWithStream" id="stream-list">
      <li v-for="item in socketsWithStream" :key="item" @click="connectToSocket(item)">{{ item }}</li>
    </ul>
    <video
      av-if="video"
      id="myVideoEl"
      ref="streamWindow"
      controls
      :srcObject.prop="video"
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
    this.msg = "Watcher component";
    const config = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    };

    this.socketsWithStream = [];
    this.socket = io("https://presentation.mgrabiec.usermd.net/");
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
<style scoped lang="scss">
video {
  width: 80vw;
  height: 60vw;
  padding: 3px;
}
.watcher{
  text-align: center;
}
</style>
