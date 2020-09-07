<template>
  <a-affix v-if="step === 2" :offset-top="84" class="sticker">
    <a-row type="flex" justify="center">
      <a-col>
        <form-field ref="form" :form-options="formOptions" layout="inline">
          <a-button slot="total" type="link" @click="setScore">设置分值</a-button>
          <a-button slot="default" type="primary" @click="save">保存试卷</a-button>
        </form-field>
      </a-col>
    </a-row>
    <a-modal
      :visible="showModal"
      :get-container="getContainer"
      ok-text="保存"
      cancel-text="取消"
      @cancel="showModal = false"
      @ok="saveScore"
    >
      <h3 slot="title" class="modal-title">设置分值 <span>共{{ num }}题，总计{{ score || 0 }}分</span></h3>
      <div class="modal-body">
        <div v-for="(item, i) in scores" :key="item.quesTypeNameId" class="set">
          <h4>{{ item.paragraphName }} <span>共{{ item.questionList.length || 0 }}题，共{{ item.totalScore }}分</span></h4>
          <h4 v-if="!item.customScore">每题 <a-input-number :min="0" :default-value="item.score" @change="updateScore($event, i, false)"></a-input-number>分</h4>
          <template v-else>
            <h4 v-for="(el, elIndex) in item.questionList" :key="el.questionId">
              题号{{el.questionNo}} <a-input-number :min="0" :default-value="el.score" @change="updateScore($event, i, true, elIndex)"></a-input-number>分
            </h4>
          </template>
          <a-button class="custom-btn" @click="changeArr(i)">{{ item.customScore ? '取消自定义' : '自定义分值' }}</a-button>
        </div>
      </div>
    </a-modal>
  </a-affix>
</template>
<script>
import { mapMutations, mapState } from 'vuex'
import FormField from './formField.vue'

export default {
  components: {
    FormField,
  },
  data() {
    return {
      showModal: false,
      scores: [],
    }
  },
  computed: {
    ...mapState(['step', 'paperInfo', 'subjectId', 'teacherId']),
    formOptions() {
      return [{
        label: '试卷名称',
        type: 'input',
        decorator: ['paperName', {
          rules: [{ required: true, message: '请填写试卷名称' }],
        }],
        style: { width: '430px' },
        placeholder: '请输入25个字符以内的试卷名称，不能包含特殊字符，如空格',
      }, {
        label: '试卷总分',
        type: 'slot',
        decorator: ['total'],
      }, {
        label: '科目',
        type: 'text',
        value: this.subjectName,
      }, {
        type: 'slot',
        decorator: ['default'],
      }]
    },
    num() {
      if (!this.paperInfo.length) return 0
      let num = 0
      this.paperInfo.forEach((el) => {
        num += el.questionList.length
      })
      return num
    },
    score() {
      if (!this.scores.length) return 0
      let score = 0
      this.scores.forEach((el) => {
        if (el.customScore) {
          for (let i = 0; i < el.questionList.length; i += 1) {
            score += el.questionList[i].score
          }
        } else {
          score += el.score * el.questionList.length
        }
      })
      return score
    },
  },
  watch: {
    paperInfo: {
      handler(nv) {
        this.scores = nv.map((el) => ({
          ...el,
          customScore: Boolean(el.customScore),
          totalScore: 0,
          questionList: el.questionList.map((item) => ({
            ...item,
            score: item.score || 0,
          })),
        }))
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    ...mapMutations(['updateState']),
    updateScore(value, index, customScore, quesIndex) {
      if (!customScore) {
        this.$set(this.scores, index, { ...this.scores[index], score: value, totalScore: value * this.scores[index].questionList.length })
      } else {
        const list = this.scores[index].questionList
        list.splice(quesIndex, 1, { ...list[quesIndex], score: value })
        const scores = list.map((el) => el.score || 0)
        let totalScore = 0
        for (let j = 0; j < scores.length; j += 1) {
          totalScore += scores[j]
        }
        this.$set(this.scores, index, {
          ...this.scores[index],
          questionList: list,
          totalScore,
        })
      }
    },
    setScore() {
      this.showModal = true
      // console.log(this.paperInfo)
    },
    getContainer() {
      return document.querySelector('#app')
    },
    saveScore() {
      for (let j = 0; j < this.scores.length; j += 1) {
        if (!this.scores[j].customScore) {
          for (let i = 0; i < this.scores[j].questionList.length; i += 1) {
            this.scores[j].questionList[i].score = this.scores[j].score
          }
        }
      }
      this.updateState({ name: 'paperInfo', value: this.scores })
      this.showModal = false
    },
    changeArr(index) {
      let totalScore = 0
      if (!this.scores[index].customScore) {
        for (let j = 0; j < this.scores[index].questionList.length; j += 1) {
          totalScore += this.scores[index].questionList[j].score || 0
        }
      } else {
        totalScore = (this.scores[index].score || 0) * this.scores[index].questionList.length
      }
      this.$set(this.scores, index, { ...this.scores[index], customScore: !this.scores[index].customScore, totalScore })
    },
    save() {
      this.$refs.form.form.validateFields(async (err, values) => {
        if (!err) {
          await this.$post('/api/paperupload/create/paper.do', {
            ...values,
            teacherId: this.teacherId,
            subjectId: this.subjectId,
            paragraphList: this.paperInfo.map((el) => {
              const { paragraphName, paragraphNo, questionList } = el
              return {
                paragraphName: `${paragraphNo}、${paragraphName}`,
                questionList: questionList.map((item) => ({
                  questionId: item.id,
                  questionNo: item.questionNo,
                  score: item.score,
                })),
              }
            }),
          })
          this.$message.success('生成试卷成功')
          this.$router.replace('/')
        }
      })
    },
  },
}
</script>
<style lang="less" scoped>
.sticker {
  background:rgba(255,255,255,1);
  box-shadow:0px 1px 3px 0px rgba(0,0,0,0.1);
  padding: 33px 20px 0 20px;
}
.modal-title {
  font-size: 18px;
  margin-bottom: 0;
  span {
    color: #A2A6AD;
    margin-left: 15px;
  }
}
.modal-body {
  .h4 {
    span {
      margin-left: 10px;
      color: #A2A6AD;
    }
  }
  .set {
    position: relative;
    .custom-btn {
      position: absolute;
      right: 20px;
      top: 0px;
    }
  }
}
</style>
