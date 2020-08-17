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
  },
  mutations: {
    // 修改state万金油
    updateState(state, { name, value }) {
      state[name] = value
    },
    // 修改当前题目信息
    updateCurrentQuestion(state, itemId) {
      state.currentItemId = itemId
      state.currentQuestion = state.content.filter((el) => el.itemId === itemId)
    },
  },
  actions: {
    // 获取全部题型
    async getQuestionClasses({ commit }) {
      const res = await Vue.prototype.$post('/api/paperupload/list/quesclass.do') || { dataInfo: {} }
      commit('updateState', { name: 'questionClasses', value: res.dataInfo.data || [] })
    },
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
      commit('updatestate', { name: 'dimensionCapabilities', value: res.dataInfo.data || [] })
    },
    // 学科素养列表
    async getDimensionAttainments({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/dimensionAttainment.do', { subjectId }) || { dataInfo: {} }
      commit('updatestate', { name: 'dimensionAttainments', value: res.dataInfo.data || [] })
    },
    // 核心价值列表
    async getDimensionCoreValues({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/dimensionCoreValue.do', { subjectId }) || { dataInfo: {} }
      commit('updatestate', { name: 'dimensionCoreValues', value: res.dataInfo.data || [] })
    },
    // 章节列表
    async getCategories({ commit, state }) {
      const { subjectId } = state
      const res = await Vue.prototype.$post('/api/paperupload/list/category.do', { subjectId }) || { dataInfo: {} }
      commit('updatestate', { name: 'categories', value: res.dataInfo.data || [] })
    },
  },
  modules: {
  },
})
