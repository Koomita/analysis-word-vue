<template>
  <editor :value.sync="value" @del="del" />
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import editor from './editor.vue'

export default {
  components: {
    editor,
    // TinyEditor,
  },
  data() {
    return {
      value: '',
      init: false,
    }
  },
  computed: {
    ...mapState(['content', 'itemIds']),
    itemContents() {
      return this.content
        .filter((el) => Boolean(el.itemId))
        .map((el) => el.itemId)
    },
  },
  watch: {
    content: {
      handler() {
        if (!this.init) {
          this.setValue()
        }
      },
      immediate: true,
      deep: true,
    },
    itemIds: {
      handler() {
        if (this.init) {
          this.updateValue()
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapMutations(['updateState', 'delItem']),
    del(itemId) {
      // 删除题块
      this.delItem(itemId)
    },
    setValue() {
      // 初始化数据
      const itemIds = []
      let detail = ''
      if (this.content.length) {
        this.content.forEach((el) => {
          const paraIndex = this.itemContents.findIndex((item) => item === el.itemId)
          if (paraIndex > -1) {
            if (!itemIds.includes(el.itemId)) {
              itemIds.push(el.itemId)
              detail += `<p class="question-block mt8" data-itemid="${el.itemId}"><span class="del-icon" data-itemid="${el.itemId}"></span>${el.content}</p>`
            } else {
              detail += `<p class="question-block">${el.content}</p>`
            }
          } else {
            detail += `<p>${el.content}</p>`
          }
        })
      }
      this.updateState({ name: 'itemIds', value: itemIds })
      this.value = detail
      this.init = true
    },
    updateValue() {
      // 更新数据
      let detail = ''
      if (this.content.length) {
        this.content.forEach((el) => {
          const { itemId } = el
          const currentIndex = this.itemContents.findIndex((item) => item === itemId)
          const firstIndex = this.itemContents.indexOf(itemId)
          if (currentIndex > -1) {
            if (this.itemIds.includes(itemId)) {
              if (currentIndex === firstIndex) {
                detail += `<p class="question-block mt8" data-itemid="${el.itemId}"><sapn class="del-icon" data-itemid="${el.itemId}"></sapn>${el.content}</p>`
              } else {
                detail += `<p class="question-block">${el.content}</p>`
              }
            } else {
              detail += `<p>${el.content}</p>`
            }
          } else {
            detail += `<p>${el.content}</p>`
          }
        })
      }
      this.value = detail
    },
  },
}
</script>
