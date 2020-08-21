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
    subjects: [], // 当前试卷题型列表
    content: [], // 当前试卷内容
    questionTypes: [], // 所有题型
    points: [], // 知识点列表
    itemIds: [], // 当前试卷有的题目id列表
    currentItemId: '', // 当前编辑题目id
    currentQuestion: [], // 当前题目
    fileInfo: {}, // 试卷文件信息
    currentQueClass: '', // 当前题类id
    currentSource: '', // 当前来源id
    editions: [], // 教材列表
    items: [], // 最后提交的数据格式
    testIds: [], // 试题id列表
    paperInfo: [], // 试卷内容
  },
  mutations: {
    // 修改state万金油
    updateState(state, { name, value }) {
      state[name] = value
    },
    // 删除题块
    delItem(state, id) {
      const index = state.itemIds.findIndex((el) => el === id)
      state.itemIds.splice(index, 1)
    },
    // 修改当前题目信息
    updateCurrentQuestion(state, itemId) {
      state.currentItemId = itemId
      state.currentQuestion = state.content.filter((el) => el.itemId === itemId)
    },
    // 保存题目
    updateItems(state, item) {
      if (item) {
        const { currentItemId, items } = state
        const index = items.findIndex((el) => el.itemId === currentItemId)
        if (index > -1) {
          state.items.splice(index, 1, { itemId: currentItemId, ...item })
        } else {
          state.items.push({ itemId: currentItemId, ...item })
        }
        // 再把content里面的anser字段改为true
        state.content.forEach((el) => {
          el.anser = items.findIndex((obj) => obj.itemId === el.itemId) > -1
        })
        Vue.prototype.$message.success('保存成功')
      }
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
      const { testIds } = state
      const res = await Vue.prototype.$post('/api/paperupload/view/paper.do', testIds) || { dataInfo: {} }
      commit('updateState', {
        name: 'paperInfo',
        value: res.dataInfo.data || [],
      })
    },
  },
  modules: {
  },
})
