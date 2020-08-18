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
  computed: {
    ...mapState(['content']),
    value() {
      const itemIds = []
      let detail = ''
      if (this.content.length) {
        const list = this.content
          .filter((el) => Boolean(el.itemId))
          .map((el) => el.itemId)
        this.content.forEach((el) => {
          const paraIndex = list.findIndex((item) => item === el.itemId)
          if (paraIndex > -1) {
            if (!itemIds.includes(el.itemId)) {
              const prefix = itemIds.length ? '</div>' : ''
              itemIds.push(el.itemId)
              detail += `${prefix}<div class="question-block widget" data-itemid="${el.itemId}">`
            }
            detail += el.content
            if (paraIndex === list.length - 1) {
              detail += '</div>'
            }
          } else {
            detail += el.content
          }
        })
      }
      this.updateState({ name: 'itemIds', value: itemIds })
      return detail
    },
  },
  methods: {
    ...mapMutations(['updateState']),
  },
}
</script>
