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
      <h3 slot="title" class="modal-title">设置分值 <span>共{{ num }}题，总计{{ score }}分</span></h3>
      <div class="modal-body">
        <div v-for="item in paperInfo" :key="item.quesTypeNameId">
          <h4>{{ item.paragraphName }} <span>共{{ item.questionList.length || 0 }}题，共{{ item.score * item.questionList.length }}分</span></h4>
          <h4>每题 <a-input-number :min="0" v-model="item.score"></a-input-number>分</h4>
        </div>
      </div>
    </a-modal>
  </a-affix>
</template>
<script>
import { mapState } from 'vuex'
import FormField from './formField.vue'

export default {
  components: {
    FormField,
  },
  data() {
    return {
      showModal: false,
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
      if (!this.paperInfo.length) return 0
      let score = 0
      this.paperInfo.forEach((el) => {
        score += el.score * el.questionList.length
      })
      return score
    },
  },
  methods: {
    setScore() {
      this.showModal = true
      // console.log(this.paperInfo)
    },
    getContainer() {
      return document.querySelector('#app')
    },
    saveScore() {},
    save() {
      this.$refs.form.form.validateFields(async (err, values) => {
        if (!err) {
          await this.$post('/api/paperupload/create/paper.do', {
            ...values,
            teacherId: this.teacherId,
            subjectId: this.subjectId,
            paragraphList: this.paperInfo.map((el) => {
              const { id, questionNo, score } = el
              return {
                questionId: id,
                questionNo,
                score,
              }
            }),
          })
          this.$message.success('生成试卷成功')
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
}
</style>
