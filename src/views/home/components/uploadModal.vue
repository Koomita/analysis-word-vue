<template>
  <a-modal
    :visible.sync="show"
    :get-container="getContainer"
    :mask-closable="false"
    :destroy-on-close="true"
    title="上传试卷"
    ok-text="下一步"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <form-field ref="form" :form-options="options" @change="formChange">
      <template slot="upper-slot">
        <div v-if="showInfo" class="info">
          注意：仅支持上传 doc 或 docx 格式文件，且无法解析加密的 word 文档，请勿上传此类文件！
          <a-icon type="close" @click="toggleInfo" />
        </div>
      </template>
    </form-field>
  </a-modal>
</template>
<script>
import { mapMutations, mapActions, mapState } from 'vuex'
import FormField from '@/components/formField.vue'

export default {
  components: {
    FormField,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      subjects: [],
      fileList: [],
      showInfo: true,
    }
  },
  computed: {
    ...mapState(['questionClasses', 'sources']),
    show: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      },
    },
    options() {
      return [{
        label: '文件上传',
        type: 'upload',
        decorator: ['file', {
          valuePropName: 'fileList',
          getValueFromEvent: this.normFile,
          rules: [{
            required: true,
            message: '请上传文件',
          }],
          initialValue: this.fileList,
        }],
        customRequest: this.customRequest,
        accept: '.doc',
      }, {
        label: '学科',
        type: 'select',
        decorator: ['subjectId', {
          rules: [{
            required: true,
            message: '请选择学科',
          }],
        }],
        placeholder: '请选择学科',
        options: this.subjects,
        props: {
          value: 'subjectId',
          label: 'fullName',
        },
      }, {
        label: '选择题类',
        type: 'radio',
        decorator: ['queClass', {
          rules: [{
            required: true,
            message: '请选择题类',
          }],
        }],
        options: this.questionClasses,
        props: {
          label: 'questionClassName',
          value: 'id',
        },
      }, {
        label: '选择来源',
        type: 'radio',
        decorator: ['source', {
          rules: [{
            required: true,
            message: '请选择来源',
          }],
        }],
        options: this.sources,
        props: {
          label: 'sourceName',
          value: 'sourceId',
        },
      }]
    },
  },
  watch: {
    visible(nv) {
      if (nv) {
        this.getSubjects()
        this.getQuestionClasses()
      }
    },
  },
  methods: {
    ...mapMutations(['updateState']),
    ...mapActions(['getQuestionClasses', 'getSources']),
    handleSubmit() {
      this.$refs.form.form.validateFields((err, values) => {
        if (!err) {
          this.$emit('submit', values)
        }
      })
    },
    async customRequest(options) {
      const {
        onSuccess, onError, file, onProgress,
      } = options
      const formData = new FormData()
      formData.append('file', file)
      onProgress()
      try {
        const res = await this.$upload('/self/analysis/word/uploadFile', formData)
        onSuccess('Ok')
        this.fileList = [{ ...this.fileList[0], status: 'done' }]
        this.updateState({ name: 'fileInfo', value: res.data || {} })
      } catch (err) {
        console.log('error: ', err)
        onError({ err })
      }
    },
    normFile(e) {
      if (Array.isArray(e)) {
        return e
      }
      return e && e.fileList
    },
    toggleInfo() {
      this.showInfo = !this.showInfo
    },
    getContainer() {
      return document.querySelector('.home')
    },
    async getSubjects() {
      const res = await this.$post('/api/paperupload/list/subject.do', {
        teacherId: 1,
      })
      this.subjects = res.dataInfo.data || []
    },
    formChange(props, values, value) {
      if (values.subjectId) {
        // 修改学科，重新获取来源
        this.updateState({ name: 'subjectId', value: value.subjectId })
        this.getSources()
      }
    },
  },
}
</script>
<style lang="less" scoped>
.modal-radio-group {
  text-align: center;
}
.info {
  color:rgba(94,147,252,1);
  background:rgba(94,147,252,0.1);
  border-radius:4px;
  padding: 10px 30px 10px 12px;
  position: relative;
  margin-bottom: 10px;
  .anticon {
    position: absolute;
    right: 10px;
    top: 8px;
    cursor: pointer;
    color: #A2A6AD;
  }
}
</style>
