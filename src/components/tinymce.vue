<template>
   <!--
      给editor加key是因为给tinymce keep-alive以后组件切换时tinymce编辑器会显示异常，
      在activated钩子里改变key的值可以让编辑器重新创建
    -->
  <editor :id="id" :init="tinymceInit" :inline="inline" v-model="content" class="editor" @onClick="handleClick" />
</template>
<script>
import tinymce from 'tinymce'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/table'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/paste'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/image'

export default {
  components: {
    Editor,
  },
  props: {
    value: {
      type: String,
    },
    height: {
      type: [Number, String],
      default: 32,
    },
    inline: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: 'tinymce',
    },
  },
  data() {
    return {
      tinymceInit: {},
      content: '',
    }
  },
  watch: {
    value: {
      handler(val) {
        this.content = val
      },
      immediate: true,
    },
    content(val) {
      if (val && val !== this.value) {
        // 编辑器内容发生变化时，告知外部，实现 v-model 双向监听效果
        this.$emit('change', val)
      }
    },
  },
  created() {
    const that = this
    this.tinymceInit = {
      selector: '.editor',
      skin_url: '/tinymce/skins/ui/oxide',
      content_css: that.inline ? '' : '/tinymce/content.css',
      language_url: '/tinymce/zh_CN.js',
      // fixed_toolbar_container: `#${that.id}-toolbar`,
      // toolbar_mode: 'scroll',
      language: 'zh_CN',
      height: that.height,
      browser_spellcheck: true, // 拼写检查
      branding: false, // 去水印
      // elementpath: false,  //禁用编辑器底部的状态栏
      statusbar: false, // 隐藏编辑器底部的状态栏
      paste_data_images: true, // 允许粘贴图像
      menubar: false, // 隐藏最上方menu
      plugins: 'image advlist table lists paste preview fullscreen',
      toolbar: 'bold italic underline strikethrough subscript superscript | alignleft aligncenter alignright alignjustify | blockquote image table numlist bullist preview fullscreen',
      // automatic_uploads: false,
      images_upload_handler: async (blobInfo, success, failure, progress) => {
        try {
          const res = await that.$post('/api/upload/upload/many/base64.do', [{ type: `.${blobInfo.blob().type.split('/')[1]}`, data: blobInfo.base64() }], {
            onUploadProgress: (progressEvent) => {
              progress((progressEvent.loaded / progressEvent.total) * 100)
            },
          })
          if (!res.extend) {
            failure(res.msg)
          } else {
            success(res.extend[0])
          }
        } catch (err) {
          console.log(err)
        }
      },
    }
  },
  methods: {
    handleClick(e) {
      const { srcElement } = e
      if (this.id === 'tinymce' && srcElement.className === 'del-icon') {
        // 删除该题块
        const { itemid } = srcElement.dataset
        console.log(itemid)
        this.$emit('del', itemid)
      }
    },
  },
}
</script>
<style>
.editor {
  border: 1px solid #c9c9c9;
  border-radius: 4px;
  padding: 6px;
}
.editor p {
  margin-bottom: 0;
}
</style>
