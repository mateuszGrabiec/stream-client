<template>
  <div class="ShareUI">
    <h1>Stream / Share</h1>
    <div class="links">
    <router-link to="/share-ui/stream">Stream</router-link> |
    <router-link to="/share-ui/watch">Watcher</router-link>
    </div>
    <router-view />
  </div>
</template>

<script>

export default {
  name: "ShareUI",
};
</script>
<style lang="scss" scoped>
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
.links{
  font-size: 1.5rem;
}
</style>