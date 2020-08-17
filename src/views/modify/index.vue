<template>
  <div class="modify">
    <a-spin :spinning="loading">
      <main-frame>
        <div slot="content" class="modify-content">
          <h1>{{ step ? '' : '源文件内容' }}</h1>
          <component :is="currentComponent" :default-content="detail" />
        </div>
        <div slot="action" class="modify-action">
          <actions />
        </div>
      </main-frame>
    </a-spin>
  </div>
</template>
<script>
import frame from '@/components/frame.vue'
import { mapMutations, mapState } from 'vuex'
import editor from './components/editor.vue'
import actions from './components/actions.vue'
import questionDetail from './components/questionDetail.vue'

export default {
  components: {
    'main-frame': frame,
    editor,
    actions,
    questionDetail,
  },
  data() {
    return {
      style: '',
      content: '',
      loading: false,
      detail: '<p>解析中……</p>',
      subjects: [],
    }
  },
  computed: {
    ...mapState(['step', 'fileInfo', 'subjectId']),
    currentComponent() {
      const components = ['editor', 'questionDetail']
      return components[this.step]
    },
  },
  created() {
    this.getContent()
  },
  methods: {
    ...mapMutations(['updateState']),
    async getContent() {
      this.loading = true
      const { fileInfo, subjectId } = this
      const res = await this.$post('/self/analysis/word/parseWord', {
        ...fileInfo,
        subjectId,
      }) || { data: {} }
      const { content, style, subjects } = res.data || { content: '', style: '' }
      this.updateState({ name: 'subjects', value: subjects })
      this.updateState({ name: 'content', value: content })
      this.appendStyleTag(style)
      const itemIds = []
      this.detail = ''
      if (content.length) {
        const list = content.filter((el) => Boolean(el.itemId)).map((el) => el.itemId)
        await content.forEach((el) => {
          if (list.includes(el.itemId)) {
            if (!itemIds.includes(el.itemId)) {
              itemIds.push(el.itemId)
            }
            this.detail += el.content.replace('<p class="', '<p class="quesion-block ')
          } else {
            this.detail += el.content
          }
        })
      }
      this.updateState({ name: 'itemIds', value: itemIds })
      this.loading = false
    },
    appendStyleTag(style) {
    // 增加样式
      const head = document.head || document.getElementsByTagName('head')[0]
      const styleTag = document.createElement('style')
      head.appendChild(styleTag)
      styleTag.type = 'text/css'
      if (styleTag.styleSheet) {
      // This is required for IE8 and below.
        styleTag.styleSheet.cssText = style
      } else {
        styleTag.appendChild(document.createTextNode(style))
      }
    },
  },
}
</script>
<style lang="less" scoped>
.modify {
  height: 100%;
  overflow-y: scroll;
  h1 {
    color: #485465;
  }
  .modify-content {
    background: #fff;
    padding: 16px 24px;
  }
  .modify-action {
    background: #fff;
  }
}
</style>
<style>
.question-block {
  background:rgba(94,147,252,0.1);
  border-radius:4px;
}
</style>
