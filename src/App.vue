<template>
  <div id="app">
    <a-layout>
      <a-layout-header>
        <ex-header />
      </a-layout-header>
      <sticker />
      <a-layout-content>
        <router-view />
      </a-layout-content>
    </a-layout>
  </div>
</template>
<script>
import header from '@/components/header.vue'
import sticker from '@/components/sticker.vue'

export default {
  components: {
    'ex-header': header,
    sticker,
  },
}
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  .ant-layout {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    .ant-layout-header {
      background: #fff;
    }
    .ant-layout-content {
      width: 100%;
      margin: 16px auto 0;
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
