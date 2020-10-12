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
      editorHeight: document.body.offsetHeight - 150,
      items: [], // 保存的新题块
      showModal: false,
      clearItems: false,
    }
  },
  computed: {
    ...mapState([
      'step',
      'fileInfo',
      'subjectId',
      'content',
      'itemIds',
      'subjects',
      'questionTypes',
      'subjectName',
    ]),
    itemContents() {
      return this.content
        .filter((el) => Boolean(el.itemId))
        .map((el) => el.itemId)
    },
    savedItems() {
      return this.$store.state.items
    },
    init() {
      return this.savedItems.length > 0 || this.itemIds.length > 0
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
      handler(nv, ov) {
        if (this.init) {
          this.clearItems = false
          this.updateValue()
        } else if (!nv.length && ov.length) {
          // 清空题目
          this.clearItems = true
          this.updateValue()
        }
      },
      deep: true,
    },
  },
  created() {
    this.updateState({ name: 'step', value: 0 })
    if (!this.init) {
      this.getContent()
    } else {
      this.updateValue()
    }
  },
  methods: {
    ...mapMutations(['updateState', 'delItem', 'updateSubjects', 'updateContent']),
    async getContent() {
      this.loading = true
      const { fileInfo, subjectId, subjectName } = this
      const res = (await this.$post('/self/analysis/word/parseWord', {
        ...fileInfo,
        subjectId,
        subjectName,
      })) || { data: {} }
      const { content, style, subjects } = res.data || {
        content: '',
        style: '',
      }
      this.updateState({ name: 'subjects', value: subjects })
      this.updateState({ name: 'content', value: content ? content.filter((el) => el.content) : [] })
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
      const contentIds = []
      let detail = ''
      if (this.content.length) {
        this.content.forEach((el) => {
          const {
            itemId, id, contentId,
          } = el
          let { content } = el
          const arr = this.init || this.clearItems ? this.itemIds : this.itemContents
          const paraIndex = arr.findIndex((item) => item === itemId)
          const tags = ['<table', '<img', '<svg']
          // 给table、img这些标签加上contentId、itemId
          for (let i = 0; i < tags.length; i += 1) {
            if (content.indexOf(tags[i]) > -1) {
              content = `${content.replace(tags[i], `${tags[i]} data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}"`)}`
            }
          }
          if (!contentIds.includes(contentId)) {
            contentIds.push(contentId)
            if (paraIndex > -1) {
              if (!itemIds.includes(itemId)) {
                itemIds.push(itemId)
                detail += `<p class="question-block mt8" data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}"><span class="del-icon" data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}">&nbsp;</span>${content}</p>`
              } else {
                detail += `<p class="question-block" data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}">${content}</p>`
              }
            } else {
              detail += `<p data-itemid="${itemId}" data-id="${id}" data-contentid="${contentId}">${content}</p>`
            }
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
    },
    updateValue() {
      // 更新数据
      const { detail } = this.formatContent()
      this.value = detail
    },
    revertContent(val) {
      // 把字符串变为数组
      const parser = new DOMParser()
      const currentDom = parser.parseFromString(val, 'text/html')
      // 把回车符过滤掉
      const currentContent = Array.from(currentDom.getElementsByTagName('body')[0].childNodes).filter((el) => el.nodeName !== '#text')
      const contents = currentContent.map((el) => {
        const { childNodes } = el
        let { innerHTML } = el
        const childs = Array.from(childNodes || [])
        if (childs.length && childs[0].nodeName === 'SPAN' && childs[0].className === 'del-icon') {
          // 把删除样式的span去掉
          const cons = childs.filter((item) => item.className !== 'del-icon')
          innerHTML = cons.map((item) => item.data).join('')
        } else if (childs.length && childs[0].nodeName === 'IMG') {
          console.log(childs)
        }
        return {
          content: el.localName === 'table' ? `<table>${innerHTML}</table>` : innerHTML,
          contentId: el.dataset.contentid,
        }
      })
      let hasContentId = true
      contents.every((el) => {
        hasContentId = Boolean(el.contentId)
        return hasContentId
      })
      return hasContentId ? contents : []
    },
    change(val) {
      const itemIds = []
      const contentIds = []
      const contents = this.revertContent(val).map((el) => {
        const itemIndex = this.content.findIndex((item) => item.contentId === el.contentId)
        const item = this.content[itemIndex] || {}
        let { contentId, itemId } = item
        if (itemIds.includes(itemId) && contentIds.includes(contentId)) {
          // 拆分原来已分好的题目，重新赋值
          contentId = v4()
          itemId = v4()
        }
        !itemIds.includes(itemId) && itemIds.push(itemId)
        !contentIds.includes(contentId) && contentIds.push(contentId)
        return {
          ...item,
          ...el,
          contentId,
          itemId,
        }
      })
      this.updateState({
        name: 'content',
        value: contents,
      })
      this.updateValue()
    },
    saveblock(content, nodes) {
      // 保存题块
      const contents = this.revertContent(content)
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
    async addQuestion({ questionTypeId, id }) {
      const { items, itemIds, content } = this
      // 更新题块
      const index = content.findIndex((el) => el.contentId === this.items[0].contentId)
      // 生成新的itemId
      const itemId = v4()
      const newItems = items.map((el, i) => ({
        ...content[index + i],
        ...el,
        itemId,
        id,
        questionTypeId,
        classifyId: id, // 更新题块，classifyId更新为id
      }))
      /**
       * 更新itemIds
       * 先找出当前题目的前一题itemId
       * 再找出前一题itemId在itemIds数组里的位置
       */
      const prevItemId = content[index - 1].itemId
      const prevIndex = itemIds.findIndex((el) => el === prevItemId)
      this.updateState({
        name: 'itemIds',
        value: [
          ...itemIds.slice(0, prevIndex + 1), // 截取当前itemId前部分
          itemId, // 塞入当前itemId
          ...itemIds.slice(prevIndex + 1), // 截取当前itemId后部分
        ],
      })
      // 更新内容
      this.updateContent({
        content: [...content.slice(0, index), ...newItems, ...content.slice(index + newItems.length)],
        newItemId: itemId,
      })
      // 更新现有题量
      const { subjects } = this
      let subjectIndex = subjects.findIndex((el) => el.id === id)
      let item = subjects[subjectIndex] || this.questionTypes.find((el) => el.id === id)
      if (subjectIndex > -1) {
        item = {
          ...item,
          count: subjects[subjectIndex].count + 1,
        }
      } else {
        subjectIndex = subjects.length
        // 多了个classifyId，新增的就把id当作classifyId
        item = {
          subjectTitle: item.name,
          count: 1,
          id,
          questionTypeId,
          classifyId: id,
        }
      }
      console.log(item)
      this.updateSubjects({ item, index: subjectIndex })
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
