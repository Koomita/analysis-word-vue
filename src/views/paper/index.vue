<template>
  <div class="paper">
    <div v-for="(test, tIndex) in paperInfo" :key="test.quesTypeNameId">
      <div class="paper-item">
        <div class="paper-block mb16">
          <h3>{{ test.paragraphName }}</h3>
        </div>
        <div class="action-bar">
          <img
            v-for="(icon, i) in actionBar(tIndex, paperInfo)"
            :key="`paper-${tIndex}-${i}`"
            :src="icon.src"
            @click="icon.func(tIndex, 0, 'test')"
          />
        </div>
      </div>
      <template v-for="(sub, sIndex) in test.questionList">
        <div :key="sub.id" class="paper-item">
          <div class="paper-block mb8">
            <span>{{ sub.questionNo }}.</span>
            <div v-html="sub.content" />
          </div>
          <div class="action-bar">
            <img
              v-for="(icon, i) in actionBar(sIndex, test.questionList)"
              :key="`test-${sIndex}-${i}`"
              :src="icon.src"
              @click="icon.func(tIndex, sIndex, 'sub')"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import icon1 from '@/assets/trash.png'
import icon2 from '@/assets/down.png'
import icon3 from '@/assets/up.png'

export default {
  computed: {
    ...mapState(['paperInfo']),
  },
  mounted() {
    this.getPaper()
  },
  methods: {
    ...mapActions(['getPaper']),
    ...mapMutations(['updateState']),
    actionBar(index, list) {
      const icons = [
        {
          src: icon1,
          func: this.del,
        },
        {
          src: icon2,
          func: this.moveDown,
        },
        {
          src: icon3,
          func: this.moveUp,
        },
      ]
      if (index === 0) {
        return icons.slice(0, 2)
      }
      if (index === list.length - 1) {
        return [icons[0], icons[2]]
      }
      return icons
    },
    moveUp(tIndex, sIndex, type) {
      type === 'test' && this.hanldeTestData(tIndex, 'up')
      type === 'sub' && this.handleSubData(sIndex, tIndex, 'up')
    },
    moveDown(tIndex, sIndex, type) {
      type === 'test' && this.hanldeTestData(tIndex, 'down')
      type === 'sub' && this.handleSubData(sIndex, tIndex, 'down')
    },
    del(tIndex, sIndex, type) {
      type === 'test' && this.hanldeTestData(tIndex)
      type === 'sub' && this.handleSubData(sIndex, tIndex)
    },
    // 第一大题
    hanldeTestData(index, action) {
      const list = this.paperInfo
      const prev = this.paperInfo[index - 1]
      const current = this.paperInfo[index]
      const next = this.paperInfo[index + 1]
      switch (action) {
        case 'up':
          list.splice(index, 1, prev)
          list.splice(index - 1, 1, current)
          break
        case 'down':
          list.splice(index, 1, next)
          list.splice(index + 1, 1, current)
          break
        default:
          list.splice(index, 1)
          break
      }
      this.handleData(list)
    },
    // 小题
    handleSubData(index, pIndex, action) {
      const list = this.paperInfo
      const currentParent = this.paperInfo[pIndex].questionList
      const prev = currentParent[index - 1]
      const current = currentParent[index]
      const next = currentParent[index + 1]
      switch (action) {
        case 'up':
          currentParent.splice(index, 1, { ...prev, questionNo: current.questionNo })
          currentParent.splice(index - 1, 1, { ...current, questionNo: prev.questionNo })
          break
        case 'down':
          currentParent.splice(index, 1, { ...next, questionNo: current.questionNo })
          currentParent.splice(index + 1, 1, { ...current, questionNo: next.questionNo })
          break
        default:
          currentParent.splice(index, 1)
          break
      }
      list.splice(pIndex, 1, { ...list[pIndex], questionList: currentParent })
      this.handleData(list)
    },
    handleData(futureList) {
      this.updateState({ name: 'paperInfo', value: futureList })
    },
  },
}
</script>
<style lang="less" scoped>
.paper {
  padding: 20px;
  background: #fff;
  color: #485465;
  height: 100%;
  overflow-y: scroll;
  .paper-item {
    display: flex;
    align-items: center;
    .action-bar {
      width: 100px;
      margin-left: 20px;
      img {
        cursor: pointer;
      }
    }
  }
  .paper-block {
    padding: 20px;
    background: rgba(245, 246, 250, 1);
    border-radius: 4px;
    border: 1px solid rgba(231, 235, 239, 1);
    display: flex;
    flex: 1;
    h3 {
      margin-bottom: 0;
      font-size: 18px;
      font-weight: 600;
      color: #485465;
    }
    div {
      flex: 1;
      margin-left: 15px;
    }
  }
  .mb16 {
    margin-bottom: 16px;
  }
  .mb8 {
    margin-bottom: 8px;
  }
}
</style>
