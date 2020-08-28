import {
  Layout,
  Icon,
  Upload,
  Form,
  Radio,
  Modal,
  message,
  Select,
  Input,
  DatePicker,
  Button,
  Table,
  Checkbox,
  Steps,
  Row,
  Col,
  Affix,
  Spin,
  Skeleton,
  InputNumber,
  TreeSelect,
} from 'ant-design-vue'

export default {
  install(Vue) {
    Vue.use(Layout)
    Vue.use(Icon)
    Vue.use(Upload)
    Vue.use(Form)
    Vue.use(Radio)
    Vue.use(Modal)
    Vue.use(Select)
    Vue.use(Input)
    Vue.use(DatePicker)
    Vue.use(Button)
    Vue.use(Table)
    Vue.use(Checkbox)
    Vue.use(Steps)
    Vue.use(Row)
    Vue.use(Col)
    Vue.use(Affix)
    Vue.use(Spin)
    Vue.use(Skeleton)
    Vue.use(InputNumber)
    Vue.use(TreeSelect)

    Vue.prototype.$confirm = Modal.confirm
    Vue.prototype.$warning = Modal.warning
    Vue.prototype.$error = Modal.error
    Vue.prototype.$info = Modal.info
    Vue.prototype.$success = Modal.success
    Vue.prototype.$message = message
  },
}
