<template>
  <div class="main">
    <h1>Welcome to main page of stream app</h1>
    <h2>{{msg}}</h2>
    <div class="continer">
        Describe
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Main extends Vue {
  @Prop() private msg!: string;
}
</script>

<style lang="scss" scoped>

</style>