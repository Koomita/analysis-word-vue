import Vue from 'vue'
import Vuex from 'vuex'
// 持久化存储vuex
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    storage: window.sessionStorage,
  })],
  state: {
    step: 0, // 当前步骤
    sources: [], // 来源列表
    dimensionPoints: [], // 必备知识列表
    dimensionCapabilities: [], // 关键能力列表
    dimensionAttainments: [], // 学科素养列表
    dimensionCoreValues: [], // 核心价值列表
    categories: [], // 章节列表
    questionClasses: [], // 题类列表
    subjectId: '', // 当前试卷学科id
    subjectName: '', // 当前试卷学科名称
    subjects: [], // 当前试卷题型列表
    content: [], // 当前试卷内容
    questionTypes: [], // 所有题型
    points: [], // 知识点列表
    itemIds: [], // 当前试卷有的题目id列表
    currentItemId: '', // 当前编辑题目id
    fileInfo: {}, // 试卷文件信息
    currentQueClass: '', // 当前题类id
    currentSource: '', // 当前来源id
    editions: [], // 教材列表
    items: [], // 最后提交的数据格式
    testIds: [], // 试题id列表
    paperInfo: [], // 试卷内容
    loading: false, // 全局loading
  },
  mutations: {
    // 修改state万金油
    updateState(state, { name, value }) {
      state[name] = value
    },
    // 删除题块
    delItem(state, { itemId, id }) {
      // console.log(itemId, state.itemIds.findIndex((el) => el === itemId))
      const index = state.itemIds.findIndex((el) => el === itemId)
      state.itemIds.splice(index, 1)
      // 同时subjects对应题量-1
      const i = state.subjects.findIndex((el) => `${el.id}` === `${id}`)
      const subject = state.subjects[i]
      const count = subject.count - 1
      if (count > 0) {
        state.subjects.splice(i, 1, { ...subject, count })
      } else {
        // === 0的时候删除全部题型
        state.subjects.splice(i, 1)
      }
    },
    // 更新普通选择题的选项
    updateOptions(state, { content, type }) {
      const types = {
        save: true,
        del: false,
      }
      const currentQuestion = state.content.filter((el) => el.itemId === state.currentItemId).map((el) => ({
        ...el,
        anser: types[type] || el.anser || false,
      }))
      const index = state.content.findIndex((el) => el.itemId === state.currentItemId)
      const endIndex = currentQuestion.length + index
      const former = state.content.slice(0, index)
      const latter = state.content.slice(endIndex)
      state.content = [...former, ...content, ...latter]
    },
    // 更新题量题型
    updateSubjects(state, { item, index }) {
      state.subjects.splice(index, 1, item)
    },
    // 保存题目
    updateItems(state, item) {
      if (item) {
        const { currentItemId } = state
        const index = state.items.findIndex((el) => el.itemId === currentItemId)
        if (index > -1) {
          state.items.splice(index, 1, { ...state.items[index], ...item })
        } else {
          state.items.push({ itemId: currentItemId, ...item })
        }
        // 再把content里面的anser字段改为true
        console.log(state.items)
        state.content.forEach((el) => {
          if (el.itemId) {
            el.anser = state.items.findIndex((obj) => obj.itemId === el.itemId) > -1
          }
        })
        Vue.prototype.$message.success('保存成功')
      }
    },
    // 删除题型
    delQuestionType(state, id) {
      console.log(id)
      const tmp = new Map()
      const contents = state.content.filter((el) => state.itemIds.includes(el.itemId)).filter((el) => `${el.id}` === `${id}`).map((el) => el.itemId).filter((item) => !tmp.has(item) && tmp.set(item, 1))
      contents.forEach((el) => {
        const index = state.itemIds.findIndex((item) => item === el)
        if (index > -1) {
          state.itemIds.splice(index, 1)
        }
      })
      const subIndex = state.subjects.findIndex((el) => `${el.id}` === `${id}`)
      state.subjects.splice(subIndex, 1)
    },
    // 更新题块后更新itemId顺序
    updateContent(state, { content, newItemId }) {
      state.content = content
      const itemIds = []
      for (let i = 0; i < content.length; i += 1) {
        const el = content[i]
        const { itemId } = el
        if (itemId && state.itemIds.includes(itemId) && !itemIds.includes(itemId)) {
          // console.log('...dwefweg', itemId)
          itemIds.push(itemId)
        } else if (itemId && newItemId === itemId && !itemIds.includes(itemId)) {
          // console.log('新的', itemId)
          itemIds.push(itemId)
        }
      }
      state.itemIds = itemIds
    },
  },
  actions: {
    // 获取全部题类
    async getQuestionClasses({ commit }) {
      const res = await Vue.prototype.$post('/api/paperupload/list/quesclass.do') || { dataInfo: {} }
      commit('updateState', { name: 'questionClasses', value: res.dataInfo.data || [] })
    },
    // 获取全部题型
    async getQuestionTypes({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/questype.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'questionTypes', value: res.dataInfo.data || [] })
    },
    // 知识点列表
    async getPoints({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/point.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'points', value: res.dataInfo.data || [] })
    },
    // 来源列表
    async getSources({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/source.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'sources', value: res.dataInfo.data || [] })
    },
    // 必备知识列表
    async getDimensionPoints({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/dimensionPoint.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'dimensionPoints', value: res.dataInfo.data || [] })
    },
    // 关键能力列表
    async getDimensionCapabilities({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/dimensionCapability.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'dimensionCapabilities', value: res.dataInfo.data || [] })
    },
    // 学科素养列表
    async getDimensionAttainments({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/dimensionAttainment.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'dimensionAttainments', value: res.dataInfo.data || [] })
    },
    // 核心价值列表
    async getDimensionCoreValues({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/dimensionCoreValue.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'dimensionCoreValues', value: res.dataInfo.data || [] })
    },
    // 教材列表
    async getEditions({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/edition.do', { subjectId }) || { dataInfo: {} }
      commit('updateState', { name: 'editions', value: res.dataInfo.data || [] })
    },
    // 获取详情页所需所有列表
    getAllLists({ dispatch }) {
      dispatch('getQuestionTypes')
      dispatch('getPoints')
      dispatch('getSources')
      dispatch('getDimensionPoints')
      dispatch('getDimensionCapabilities')
      dispatch('getDimensionAttainments')
      dispatch('getDimensionCoreValues')
      dispatch('getEditions')
    },
    async getPaper({ state, commit }) {
      const { testIds, items, subjects } = state
      const types = []
      await items.forEach((el, i) => {
        const { classifyId } = el
        const index = types.findIndex((item) => item.classifyId === classifyId)
        if (index < 0) {
          types.push({
            classifyId,
            paragraphName: subjects.find((item) => item.classifyId === classifyId)?.subjectTitle,
            questionIds: [testIds[i]],
          })
        } else {
          types.splice(index, 1, {
            ...types[index],
            questionIds: types[index].questionIds.concat([testIds[i]]),
          })
        }
      })
      const arr = types.map((el) => ({
        paragraphName: el.paragraphName,
        questionIds: el.questionIds,
      }))
      const res = await Vue.prototype.$post('/api/paperupload/view/paper.do', arr) || { dataInfo: {} }
      const nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
      const getRealNums = (i) => {
        const num = `${i}`.split('')
        const no = '十'
        if (num.startsWith('1')) {
          return `${no}${nums[num[1]]}`
        }
        return `${nums[num[0]]}${no}${nums[num[1]]}`
      }
      commit('updateState', {
        name: 'paperInfo',
        value: res.dataInfo.data.map((el, i) => ({
          ...el,
          paragraphNo: i < 10 ? nums[i] : getRealNums(i),
        })) || [],
      })
    },
  },
  modules: {
  },
})
