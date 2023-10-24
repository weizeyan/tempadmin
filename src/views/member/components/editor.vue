<template>
  <div class="b-editor">
    <QuillEditor
      v-model:content="state.content"
      content-type="html"
      :options="state.editorOptions"
      style="height: 300px"
      :toolbar="'#custorm-toolbar-' + id"
    >
      <template #toolbar>
        <div :id="'custorm-toolbar-' + id">
          <button class="btn-upload" title="上传附件">
            <input
              class="input"
              type="file"
              multiple
              @change="handleFileChange"
            />
            <icon-attachment />
          </button>
          <select class="ql-header">
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
            <option value="4"></option>
            <option value="5"></option>
            <option value="6"></option>
            <option></option>
          </select>

          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
          <button class="ql-strike"></button>
          <select class="ql-color"> </select>
          <select class="ql-background"> </select>

          <select class="ql-align">
            <option></option>
            <option value="center"></option>
            <option value="right"></option>
            <option value="justify"></option>
            <option></option>
          </select>
          <!-- <select class="ql-font"></select>
          <button class="ql-link"></button>
          <button class="ql-image"></button>
           -->
        </div>
      </template>
    </QuillEditor>
    <div v-if="state.fileList.length" class="b-file-list flex-center-start">
      <div
        v-for="(item, index) in state.fileList"
        :key="index"
        class="file-item"
      >
        <div class="con flex-center-between">
          <a :href="item.url" :title="item.name" target="_blank">{{
            item.name
          }}</a>
          <icon-delete @click="delAttachment(item)"></icon-delete>
          <div v-if="item.uploading" class="uploading-status flex-center">
            <icon-loading />
            <div>正在上传</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    reactive,
    ref,
    onMounted,
    onActivated,
    onBeforeUnmount,
    shallowRef,
    nextTick,
    watch,
  } from 'vue';
  import { useRoute } from 'vue-router';
  import { uuid } from '@/utils';

  export type AttachmentFile = {
    name: string;
    url: string;
    uploading?: boolean;
    [name: string]: any;
  };
  const id = uuid();
  const props = withDefaults(
    defineProps<{
      content: string;
      fileList?: AttachmentFile[];
      upload?: (attachmentFile: AttachmentFile) => Promise<boolean>;
    }>(),
    {
      content: '',
      fileList() {
        return [];
      },
      upload: (attachmentFile: AttachmentFile) => {
        return Promise.resolve(true);
      },
    }
  );
  const emit = defineEmits<{
    (e: 'update:content', v: string): void;
    (e: 'update:file-list', v: AttachmentFile[]): void;
  }>();

  const route = useRoute();

  async function handleFileChange(e: any) {
    const el: Record<string, any> = e.target;
    const fileList = Array.prototype.slice.call(el.files) || [];
    await Promise.all(
      fileList.map(async (file: File) => {
        const url = URL.createObjectURL(file);
        const item: AttachmentFile = reactive({
          name: file.name,
          url,
          file,
          uploading: true,
        });
        state.fileList.push(item);
        await props.upload(item);
        item.uploading = false;
      })
    );

    console.log(fileList);
    el.value = '';
  }

  function delAttachment(file: AttachmentFile) {
    const index = state.fileList.indexOf(file);
    state.fileList.splice(index, 1);
  }

  const state = reactive({
    initData: null as Record<string, any> | null,
    content: props.content,
    fileList: props.fileList,
    editorOptions: {
      theme: 'snow',
    },
  });

  watch(
    () => {
      return props.content;
    },
    (v) => {
      state.content = v;
    }
  );
  watch(
    () => {
      return state.content;
    },
    (v) => {
      emit('update:content', v);
    }
  );

  watch(
    () => {
      return props.fileList;
    },
    (v) => {
      state.fileList = v;
    }
  );

  watch(
    () => {
      return state.fileList;
    },
    (v) => {
      emit('update:file-list', v);
    }
  );

  onMounted(async () => {});
  onActivated(() => {});
</script>

<style lang="less" scoped>
  .b-editor {
    // border: 1px solid #ccc;
    :deep(p) {
      margin: 0;
    }
    .b-file-list {
      margin-top: 10px;
      padding: 0;
    }
    .btn-upload {
      position: relative;
      .input {
        width: 100%;
        height: 100%;
        position: absolute;
        cursor: pointer;
        opacity: 0;
        left: 0;
        top: 0;
      }
    }
  }
</style>
