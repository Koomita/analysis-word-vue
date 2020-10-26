import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['currentQueClass', 'currentSource']),
    formOptions() {
      const getAnswerType = (type) => {
        switch (type) {
          case 2:
          case 9:
            return 'text'
          case 1:
            return this.chooseType
          case 3:
            return 'radio'
          default:
            return 'editor'
        }
      }
      let formOptions = [
        {
          label: '题干',
          decorator: [
            'content',
            {
              rules: [
                {
                  required: true,
                  message: '请填写题干',
                },
              ],
              initialValue: this.question,
            },
          ],
          type: 'editor',
        },
        {
          label: '答案',
          type: getAnswerType(this.questionTypeId),
          options: this.questionTypeId === 3 ? [
            {
              label: '对',
              value: 'true',
            },
            {
              label: '错',
              value: 'false',
            },
          ] : this.optionLabel.slice(0, this.option.length).map((el) => ({ label: el, value: el })),
          props: {
            label: 'label',
            value: 'value',
          },
          className: 'ant-radio-customed',
          decorator: [
            'answers',
            {
              rules: [{
                required: ![3, 9].includes(this.questionTypeId),
                validator: (rule, value, cb) => {
                  if ([3, 9].includes(this.questionTypeId)) {
                    cb()
                  } else if (!value) {
                    cb(new Error(`请${this.questionTypeId !== 1 ? '填写' : '选择'}答案`))
                  } else if (this.isFillup) {
                    const val = value.replace('<p>', '').replace('</p>', '').split('')
                    if (val.length !== this.option.length) {
                      cb(new Error('请填写完整答案'))
                    } else {
                      cb()
                    }
                  } else {
                    cb()
                  }
                },
              }],
              initialValue: this.editingItem?.answers,
            },
          ],
          placeholder: '请填写…',
          value: '主观题无需录入答案。',
        },
        {
          label: '难度',
          type: 'radio',
          className: 'ant-radio-customed',
          decorator: [
            'difficultyCoefficient',
            {
              rules: [
                {
                  required: true,
                  message: '请选择难度',
                },
              ],
              initialValue: this.editingItem?.difficultyCoefficient,
            },
          ],
          options: [
            {
              label: '基础题',
              value: '0.7',
            },
            {
              label: '中档题',
              value: '0.5',
            },
            {
              label: '难题',
              value: '0.3',
            },
          ], // 难度（越小越难） 基础题：0.7 中档题：0.5 难题：0.3
        },
        {
          label: '知识点',
          type: 'tree-select',
          options: this.points,
          mode: 'multiple',
          replaceFields: {
            label: 'pointName',
            value: 'id',
            children: 'children',
          },
          decorator: [
            'pointIds',
            {
              rules: [
                {
                  required: true,
                  message: '请选择知识点',
                },
              ],
              initialValue: this.editingItem?.pointIds,
            },
          ],
        },
        {
          label: '解析',
          type: 'slot',
          decorator: [
            'analysis',
            {
              rules: [{ required: true, message: '请输入解析' }],
              initialValue: this.editingItem?.analysis,
            },
          ],
        },
      ]
      if (this.option.length) {
        // 选择题
        const { option } = this
        const list = []
        if (this.isOptionGroup) {
          option.forEach((el) => {
            el.options.forEach((item, index) => {
              list.push({
                label: index === 0 ? `${el.answerNo}   ${item.option}` : item.option,
                type: 'slot',
                decorator: [`${el.answerNo}-${item.option}`],
              })
            })
          })
          list.unshift({ label: '每空选项数', type: 'input-number', decorator: ['optionNum', { initialValue: this.optionLen }] })
        } else {
          option.forEach((el) => {
            list.push({
              label: `${el.option}`,
              type: 'slot',
              decorator: [el.option],
            })
          })
        }
        formOptions = [formOptions[0], ...list, ...formOptions.slice(1)]
      } else if (this.questionTypeId === 1) {
        // 没有选项的选择题
        formOptions = [formOptions[0], { type: 'slot', decorator: ['addBtn'] }, ...formOptions.slice(1)]
      }
      formOptions = formOptions.concat([{
        label: '题类',
        type: 'radio',
        options: this.questionClasses,
        props: {
          label: 'questionClassName',
          value: 'id',
        },
        decorator: ['questionClassId', {
          rules: [{ required: true, message: '请选择题类' }],
          initialValue: this.editingItem?.questionClassId || this.currentQueClass,
        }],
        className: 'ant-radio-customed',
      },
      {
        label: '来源',
        type: 'radio',
        options: this.sources,
        className: 'ant-radio-customed',
        props: {
          label: 'sourceName',
          value: 'sourceId',
        },
        decorator: ['sourceId', {
          rules: [{ required: true, message: '请选择来源' }],
          initialValue: this.editingItem?.sourceId || this.currentSource,
        }],
      }])
      if (this.expend) {
        formOptions = formOptions.concat([
          {
            label: '章节信息',
            type: 'slot',
            decorator: ['para'],
          },
          {
            label: '必备知识',
            type: 'tree-select',
            mode: 'multiple',
            options: this.dimensionPoints,
            decorator: ['dimensionPointIds', {
              initialValue: this.editingItem?.dimensionPointIds,
            }],
            replaceFields: {
              label: 'text',
              value: 'id',
              children: 'children',
            },
          },
          {
            label: '关键能力',
            type: 'tree-select',
            mode: 'multiple',
            options: this.dimensionCapabilities,
            decorator: ['dimensionCapabilityIds', {
              initialValue: this.editingItem?.dimensionCapabilityIds,
            }],
            replaceFields: {
              label: 'text',
              value: 'id',
              children: 'children',
            },
          },
          {
            label: '学科素养',
            type: 'tree-select',
            mode: 'multiple',
            options: this.dimensionAttainments,
            decorator: ['dimensionAttainmentIds', {
              initialValue: this.editingItem?.dimensionAttainmentIds,
            }],
            replaceFields: {
              label: 'text',
              value: 'id',
              children: 'children',
            },
          },
          {
            label: '核心价值',
            type: 'tree-select',
            mode: 'multiple',
            options: this.dimensionCoreValues,
            decorator: ['dimensionCoreValueIds', {
              initialValue: this.editingItem?.dimensionCoreValueIds,
            }],
            replaceFields: {
              label: 'text',
              value: 'id',
              children: 'children',
            },
          },
          {
            label: '解析视频',
            type: 'upload',
            accept: '.mp4',
            decorator: [
              'videoUrl',
              {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
                initialValue: this.fileList,
              },
            ],
            placeholder: '上传视频',
            customRequest: this.uploadVideo,
          },
        ])
      }
      return formOptions
    },
  },
}
