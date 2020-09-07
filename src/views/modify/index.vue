<template>
  <div class="modify">
    <main-frame>
      <div slot="content" class="modify-content">
        <a-skeleton :loading="loading" active>
          <h1>源文件内容</h1>
          <editor :value="value" :height="editorHeight" @del="del" @change="change" @saveblock="saveblock" />
        </a-skeleton>
        <question-modal :visible="showModal" @cancel="showModal = false" @submit="addQuestion" />
      </div>
      <div slot="action" class="modify-action">
        <actions v-if="!loading" />
      </div>
    </main-frame>
  </div>
</template>
<script>
import { v4 } from 'uuid'
import { mapMutations, mapState } from 'vuex'
import frame from '@/components/frame.vue'
import editor from '@/components/tinymce.vue'
import actions from './components/actions.vue'
import questionModal from './components/questionModal.vue'

export default {
  components: {
    'main-frame': frame,
    editor,
    actions,
    questionModal,
  },
  data() {
    return {
      style: '',
      loading: false,
      value: '',
      init: false,
      editorHeight: document.body.offsetHeight - 150,
      items: [], // 保存的新题块
      showModal: false,
    }
  },
  computed: {
    ...mapState(['step', 'fileInfo', 'subjectId', 'content', 'itemIds', 'subjects', 'questionTypes']),
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
  created() {
    this.init = false
    this.updateState({ name: 'step', value: 0 })
    this.getContent()
  },
  methods: {
    ...mapMutations(['updateState', 'delItem', 'updateSubjects']),
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
      this.updateState({ name: 'content', value: content.filter((el) => el.content) })
      this.updateState({ name: 'items', value: [] })
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
    del(itemId, id) {
      // 删除题块
      this.delItem({ itemId, id })
    },
    formatContent() {
      const itemIds = []
      let detail = ''
      if (this.content.length) {
        this.content.forEach((el) => {
          const {
            itemId, id, contentId,
          } = el
          let { content } = el
          const arr = this.init ? this.itemIds : this.itemContents
          const paraIndex = arr.findIndex((item) => item === itemId)
          content = content.indexOf('<table') > -1 ? `${content.replace('<table', `<table data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}"`)}` : content
          if (paraIndex > -1) {
            if (!itemIds.includes(itemId)) {
              itemIds.push(itemId)
              detail += `<p class="question-block mt8" data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}"><span class="del-icon" data-itemid="${itemId}" data-id="${id}">&nbsp;</span>${content}</p>`
            } else {
              detail += `<p class="question-block data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}">${content}</p>`
            }
          } else {
            detail += `<p data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}">${content}</p>`
          }
        })
      }
      return { detail, itemIds }
    },
    setValue() {
      // 初始化数据
      const { detail, itemIds } = this.formatContent()
      this.updateState({ name: 'itemIds', value: itemIds })
      this.value = detail
      this.init = true
    },
    updateValue() {
      // 更新数据
      const { detail } = this.formatContent()
      this.value = detail
    },
    change(val) {
      this.value = val
    },
    saveblock(content, nodes) {
      // 保存题块
      const parser = new DOMParser()
      const currentDom = parser.parseFromString(content, 'text/html')
      const currentContent = Array.from(currentDom.getElementsByTagName('body')[0].childNodes)
      const contents = currentContent.filter((el) => el.nodeName !== '#text').filter((el) => !['u', 'img'].includes(el.localName)).map((el) => ({
        content: el.localName === 'table' ? `<table>${el.innerHTML}</table>` : el.innerHTML,
        contentId: el.dataset.contentid,
      }))
      if (!contents.length) {
        contents.push({
          content: nodes.innerHTML,
          contentId: nodes.dataset.contentid,
        })
      }
      this.items = contents
      // 显示弹窗选择题型
      this.showModal = true
    },
    addQuestion({ questionTypeId, id }) {
      // 更新题块
      const index = this.content.findIndex((el) => el.contentId === this.items[0].contentId)
      // 生成新的itemId
      const itemId = v4()
      const newItems = this.items.map((el, i) => ({
        ...this.content[index + i],
        ...el,
        itemId,
        id,
        questionTypeId,
      }))
      this.updateState({
        name: 'content',
        value: [...this.content.slice(0, index), ...newItems, ...this.content.slice(index + newItems.length)],
      })
      // 更新itemId
      this.updateState({
        name: 'itemIds',
        value: this.itemIds.concat(itemId),
      })
      const { subjects } = this
      const subjectIndex = subjects.findIndex((el) => el.id === id)
      if (subjectIndex > -1) {
        // 更新现有题量
        this.updateSubjects({ item: { ...subjects[subjectIndex], count: subjects[subjectIndex].count + 1 }, index: subjectIndex > -1 ? subjectIndex : subjects.length })
      } else {
        const item = this.questionTypes.find((el) => el.id === id)
        this.updateSubjects({
          item: {
            subjectTitle: item.name, count: 1, id, questionTypeId,
          },
          index: subjects.length,
        })
      }
      this.showModal = false
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
