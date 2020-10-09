<template>
  <div class="step-flow step-two">
    <a-row type="flex" justify="space-between" class="action-title">
      <a-col>
        <h1>题号列表</h1>
      </a-col>
      <a-col>
        <span class="flex-item"> <i class="small-block" /> 已设置</span>
        <span class="flex-item"> <i class="small-block error" /> 未设置</span>
      </a-col>
    </a-row>
    <div class="test-block">
      <h3>题型</h3>
      <div v-for="(que, queIndex) in currentQuestions" :key="`que-${que.itemId}`">
        <h4>{{queIndex + 1}}、{{ que.questionTypeName }}</h4>
        <p class="flex-item">
          <span
           v-for="(num, numIndex) in que.number"
           :key="`${que.id}-${num}`"
           :class="['block', !que.answer[numIndex] ? 'error': '', checkActive(que, numIndex) ? 'active' : '']"
           @click="changeCurrentQuestion(que.itemId[numIndex])"
          >
            {{ num }}
          </span>
        </p>
      </div>
    </div>
    <p class="btn-box">
      <a-button :disabled="btnDisabled" type="primary" @click="upload">上传题目</a-button>
      <complete-modal :visible="showCompleteModal" @next="nextStep" @cancel="cancel" />
    </p>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import completeModal from './completeModal.vue'

export default {
  components: {
    completeModal,
  },
  data() {
    return {
      showCompleteModal: false,
    }
  },
  computed: {
    ...mapState(['questionTypes', 'itemIds', 'content', 'currentItemId', 'items', 'subjectId', 'teacherId', 'subjects']),
    questions() {
      if (!this.content || !this.content.length || !this.itemIds || !this.itemIds.length) return []
      return this.content.filter((el) => this.itemIds.includes(el.itemId))
    },
    currentQuestions() {
      const list = []
      if (this.subjects.length && this.itemIds.length && this.content.length) {
        this.itemIds.forEach((el, i) => {
          const target = this.questions.filter((item) => item.itemId === el)
          if (target.length) {
            const {
              id, anser, classifyId, questionTypeId,
            } = target[0]
            const index = list.findIndex((item) => `${item.classifyId}` === `${classifyId}`)
            if (index < 0) {
              const questionType = this.subjects.find((obj) => `${obj.questionTypeId}` === `${questionTypeId}`)
              const subjectType = this.questionTypes.find((obj) => `${obj.id}` === `${id}`)
              list.push({
                itemId: [el],
                number: [`${i + 1}`],
                questions: [target],
                answer: [anser],
                id,
                classifyId,
                questionTypeName: questionType?.subjectTitle || subjectType?.name,
              })
            } else {
              list[index].number.push(`${i + 1}`)
              list[index].itemId.push(el)
              list[index].questions.push(target)
              list[index].answer.push(anser)
            }
          }
        })
      }
      return list
    },
    btnDisabled() {
      return this.items.length !== this.itemIds.length
    },
  },
  methods: {
    ...mapMutations(['updateState']),
    checkActive(que, i) {
      const { itemId } = que
      const index = itemId.findIndex((el) => el === this.currentItemId)
      return index === i
    },
    changeCurrentQuestion(itemId) {
      this.updateState({ name: 'currentItemId', value: itemId })
    },
    async upload() {
      this.updateState({ name: 'loading', value: true })
      const { items, subjectId, teacherId } = this
      await items.forEach(async (el) => {
        const answer = {}
        const {
          answers, questionTypeId, videoUrl,
        } = el
        /**
         * 选择题（含单选/多选）: 1
          {"0":"A", "1": "C"}

          判断题：3
          {"0": "true"}

          信息匹配/完形填空/阅读理解：5
          按题号顺序{"0": "B", "1", "B", "2": "A"}
          */
        if (typeof answers === 'object') {
          // 多选
          await answers.forEach((item, index) => {
            Object.assign(answer, {
              [index]: item.toUpperCase(),
            })
          })
        } else if ([1, 3, 5].includes(questionTypeId)) {
          let ans = []
          if (answers.indexOf('<p') > -1) {
            // 需要构造答案的类型，编辑器为富文本编辑器，内容有p标签
            const parser = new DOMParser()
            const currentDom = parser.parseFromString(answers, 'text/html')
            const list = Array.from(currentDom.getElementsByTagName('body')[0].childNodes).filter((item) => item.textContent)
            ans = list[0] ? list[0].textContent.split('') : []
          } else if (questionTypeId === 3) {
            // 判断题
            ans = [answers]
          } else {
            ans = answers.split('')
          }
          await ans.forEach((item, index) => {
            Object.assign(answer, {
              [index]: ![1, 5].includes(questionTypeId) ? item : item.toUpperCase(),
            })
          })
        }
        el.answers = JSON.stringify(answer)
        if (videoUrl && videoUrl.length) {
          el.videoUrl = videoUrl[0].url
        }
        // console.log(el.videoUrl)
        delete el.itemId
      })
      try {
        const res = await this.$post('/api/paperupload/upload/ques.do', {
          subjectId,
          teacherId,
          items,
        })
        this.updateState({ name: 'loading', value: false })
        const { data } = res.dataInfo || { data: [] } // 试题id列表
        if (data.length) {
          this.updateState({ name: 'testIds', value: data })
          this.showCompleteModal = true
        }
      } catch {
        this.updateState({ name: 'loading', value: false })
      }
    },
    nextStep() {
      this.showCompleteModal = false
      this.$router.push('/paper')
    },
    cancel() {
      this.showCompleteModal = false
      this.$router.replace('/')
    },
  },
}
</script>
<style lang="less" scoped>
.step-two {
  .flex-item {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
  .small-block {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    margin-right: 4px;
    border: 1px solid rgba(94,147,252,1);
    &.error {
      border-color: #FF5953;
    }
  }
  .block {
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius:4px;
    border:1px solid rgba(94,147,252,0.4);
    color: rgba(94,147,252,1);
    line-height: 32px;
    text-align: center;
    margin-bottom: 10px;
    cursor: pointer;
    &:not(:last-child) {
      margin-right: 10px;
    }
    &.error {
      border-color: #FF5953;
      color: #FF5953;
    }
    &.active {
      border-color: rgba(94,147,252,1);
      background: rgba(94,147,252,1);
      color: #fff;
    }
  }
}
</style>
