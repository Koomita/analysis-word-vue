<template>
  <editor :value="value" :height="editorHeight" @del="del" @change="change" />
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import editor from '@/components/tinymce.vue'

export default {
  components: {
    editor,
  },
  data() {
    return {
      value: '',
      init: false,
      editorHeight: document.body.offsetHeight - 150,
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
          const { content, itemId } = el
          const paraIndex = this.itemContents.findIndex((item) => item === itemId)
          if (paraIndex > -1) {
            if (!itemIds.includes(itemId)) {
              itemIds.push(itemId)
              detail += `<p class="question-block mt8" data-itemid="${itemId}"><span class="del-icon" data-itemid="${itemId}">&nbsp;</span>${content}</p>`
            } else {
              detail += `<p class="question-block data-itemid="${itemId}"">${content}</p>`
            }
          } else {
            detail += `<p>${content}</p>`
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
        const itemIds = []
        this.content.forEach((el) => {
          const { itemId, content } = el
          const itemIndex = this.itemIds.findIndex((item) => item === itemId)
          if (itemIndex > -1) {
            if (!itemIds.includes(itemId)) {
              itemIds.push(itemId)
              detail += `<p class="question-block mt8" data-itemid="${itemId}"><span class="del-icon" data-itemid="${itemId}">&nbsp;</span>${content}</p>`
            } else {
              detail += `<p class="question-block" data-itemid="${itemId}">${content}</p>`
            }
          } else {
            detail += `<p>${content}</p>`
          }
        })
      }
      this.value = detail
    },
    change(val) {
      this.value = val
    },
  },
}
</script>
