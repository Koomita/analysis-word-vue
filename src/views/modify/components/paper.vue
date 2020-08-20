<template>
  <editor :value.sync="value" />
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import editor from './editor.vue'

export default {
  components: {
    editor,
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
    ...mapMutations(['updateState']),
    setValue() {
      // 初始化数据
      const itemIds = []
      let detail = ''
      if (this.content.length) {
        this.content.forEach((el) => {
          const paraIndex = this.itemContents.findIndex((item) => item === el.itemId)
          if (paraIndex > -1) {
            if (!itemIds.includes(el.itemId)) {
              const prefix = itemIds.length ? '</div>' : ''
              itemIds.push(el.itemId)
              detail += `${prefix}<div class="question-block" data-itemid="${el.itemId}">`
            }
            detail += el.content
            if (paraIndex === this.itemContents.length - 1) {
              detail += '</div>'
            }
          } else {
            detail += el.content
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
          const itemIndex = this.itemIds.find((item) => item === el.itemId)
          if (itemIndex > -1) {
            const prefix = itemIndex > 0 ? '</div>' : ''
            detail += `${prefix}<div class="question-block" data-itemid="${el.itemId}">`
            if (itemIndex === this.itemIds.length - 1) {
              detail += '</div>'
            }
          } else {
            detail += el.content
          }
        })
      }
      this.value = detail
    },
  },
}
</script>
