<template>
  <div class="ShareUI">
    <h1>Stream / Share</h1>
    <router-link to="/share-ui/stream">Stream</router-link>|
    <router-link to="/share-ui/watch">Watcher</router-link>
    <router-view />
  </div>
</template>

<script>
// import Stream from '../components/Stream.vue'
// import Watcher from '../components/Watcher.vue'

export default {
  name: "ShareUI",
  // components: {
  //   Stream,
  //   Watcher
  // }
};
</script>