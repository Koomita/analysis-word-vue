<template>
  <a-modal
    :visible="visible"
    :get-container="getContainer"
    title="题型设置"
    @cancel="$emit('cancel')"
    @ok="submit"
  >
    <form-field ref="formField" :form-options="formOptions" layout="inline" />
  </a-modal>
</template>
<script>
import formField from '@/components/formField.vue'
import { mapState } from 'vuex'

export default {
  components: {
    formField,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(['questionTypes']),
    formOptions() {
      return [{
        label: '题型',
        type: 'select',
        decorator: ['id', {
          rules: [{ required: true, message: '请选择题型' }],
        }],
        style: { width: '200px' },
        options: this.questionTypes,
        props: {
          label: 'name',
          value: 'id',
        },
      }]
    },
  },
  methods: {
    getContainer() {
      return document.querySelector('.modify')
    },
    submit() {
      this.$refs.formField.form.validateFields((err, values) => {
        if (!err) {
          const item = this.questionTypes.find((el) => el.id === values.id)
          Object.assign(values, {
            questionTypeId: item.questionTypeId,
          })
          this.$emit('submit', values)
        }
      })
    },
  },
}
</script>
