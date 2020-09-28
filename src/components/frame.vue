<template>
  <section class="frame">
    <div class="content">
      <slot name="content" />
    </div>
    <div class="action">
      <slot name="action" />
    </div>
  </section>
</template>
<style lang="less" scoped>
.frame {
  width: 1184px;
  min-height: 100%;
  display: flex;
  justify-content: space-between;
  .content, .action {
    border-radius: 2px;
    box-sizing: border-box;
    height: fit-content;
  }
  .content {
    width: 784px;
  }
  .action {
    width: 384px;
  }
}
</style>
