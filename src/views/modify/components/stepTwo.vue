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
           :key="`${que.questionTypeId}-${num}`"
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
    </p>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapState(['questionTypes', 'itemIds', 'content', 'currentItemId', 'items', 'subjectId', 'teacherId']),
    questions() {
      if (!this.content || !this.content.length || !this.itemIds || !this.itemIds.length) return []
      return this.content.filter((el) => this.itemIds.includes(el.itemId))
    },
    currentQuestions() {
      const list = []
      if (this.questionTypes.length && this.itemIds.length && this.content.length) {
        this.itemIds.forEach((el, i) => {
          const target = this.questions.filter((item) => item.itemId === el)
          if (target.length) {
            const { questionTypeId, anser } = target[0]
            const index = list.findIndex((item) => item.questionTypeId === questionTypeId)
            if (index < 0) {
              list.push({
                itemId: [el],
                number: [`${i + 1}`],
                questions: [target],
                answer: [anser],
                questionTypeId,
                questionTypeName: this.questionTypes.find((obj) => obj.questionTypeId === questionTypeId)?.name,
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
      const { items, subjectId, teacherId } = this
      const res = await this.$post('/api/paperupload/upload/ques.do', {
        subjectId,
        teacherId,
        items: items.map((el) => {
          delete el.itemId
          return el
        }),
      })
      if (res.status === 10001) {
        const { data } = res.dataInfo // 试题id列表
        this.updateState({ name: 'testIds', value: data })
        this.$message.success('上传成功')
        this.updateState({ name: 'step', value: 2 })
        this.$router.push('/paper')
      }
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
