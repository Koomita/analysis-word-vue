<template>
  <div class="modify">
    <main-frame>
      <div slot="content" class="modify-content">
        <a-skeleton :loading="loading" active>
          <h1>{{ step ? '' : '源文件内容' }}</h1>
          <component :is="currentComponent" :value="detail" />
        </a-skeleton>
      </div>
      <div slot="action" class="modify-action">
        <actions v-if="!loading" />
      </div>
    </main-frame>
  </div>
</template>
<script>
import frame from '@/components/frame.vue'
import { mapMutations, mapState } from 'vuex'
import paper from './components/paper.vue'
import actions from './components/actions.vue'
import questionDetail from './components/questionDetail.vue'

export default {
  components: {
    'main-frame': frame,
    paper,
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
      const components = ['paper', 'questionDetail']
      return components[this.step]
    },
  },
  created() {
    const { teacherId } = this.$route.query
    if (teacherId) {
      this.updateState({ name: 'teacherId', value: teacherId })
    }
    this.updateState({ name: 'step', value: 0 })
    this.getContent()
  },
  methods: {
    ...mapMutations(['updateState']),
    async getContent() {
      this.loading = true
      const { fileInfo, subjectId } = this
      const res = (await this.$post('/self/analysis/word/parseWord', {
        ...fileInfo,
        subjectId,
      })) || { data: {} }
      const { content, style, subjects } = res.data || {
        content: '',
        style: '',
      }
      this.updateState({ name: 'subjects', value: subjects })
      this.updateState({ name: 'content', value: content })
      this.appendStyleTag(style)
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
