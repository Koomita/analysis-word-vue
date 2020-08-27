export default {
  computed: {
    formOptions() {
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
          type: this.questionTypeId === 1 ? 'radio' : 'editor',
          options: this.options.map((el) => ({ label: el, value: el })),
          props: {
            label: 'label',
            value: 'value',
          },
          decorator: [
            'answers',
            {
              rules: [{ required: true, message: '请选择答案' }],
              initialValue: '',
            },
          ],
          placeholder: '请填写…（格式：ABCD）',
        },
        {
          label: '难度',
          type: 'radio',
          decorator: [
            'difficultyCoefficient',
            {
              rule: [
                {
                  required: true,
                  message: '请选择难度',
                },
              ],
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
          type: 'select',
          options: this.points,
          mode: 'multiple',
          props: {
            label: 'pointName',
            value: 'id',
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
            },
          ],
        },
        {
          label: '解析',
          type: 'editor',
          decorator: [
            'analysis',
            {
              rules: [{ required: true, message: '请输入解析' }],
              initialValue: '',
            },
          ],
        },
      ]
      if (this.option.length) {
        // 选择题
        const { option } = this
        const list = []
        if (this.isFillup) {
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
        } else if (this.questionTypeId !== 5) {
          option.forEach((el) => {
            list.push({
              label: `${el.option}`,
              type: 'slot',
              decorator: [el.option],
            })
          })
        }
        formOptions = [formOptions[0], ...list, ...formOptions.slice(1)]
      }
      if (this.expend) {
        formOptions = formOptions.concat([
          {
            label: '题类',
            type: 'radio',
            options: this.questionClasses,
            props: {
              label: 'questionClassName',
              value: 'id',
            },
            decorator: ['questionClassId'],
          },
          {
            label: '来源',
            type: 'radio',
            options: this.sources,
            props: {
              label: 'sourceName',
              value: 'sourceId',
            },
            decorator: ['sourceId'],
          },
          {
            label: '章节信息',
            type: 'slot',
            decorator: ['para'],
          },
          {
            label: '必备知识',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionPoints,
            decorator: ['dimensionPointIds'],
            props: {
              label: 'text',
              value: 'id',
            },
          },
          {
            label: '关键能力',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionCapabilities,
            decorator: ['dimensionCapabilityIds'],
            props: {
              label: 'text',
              value: 'id',
            },
          },
          {
            label: '学科素养',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionAttainments,
            decorator: ['dimensionAttainmentIds'],
            props: {
              label: 'text',
              value: 'id',
            },
          },
          {
            label: '核心价值',
            type: 'select',
            mode: 'multiple',
            options: this.dimensionCoreValues,
            decorator: ['dimensionCoreValueIds'],
            props: {
              label: 'text',
              value: 'id',
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
