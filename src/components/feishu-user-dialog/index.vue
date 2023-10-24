<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :on-before-ok="onFeishuDialogBeforeOK"
    v-bind="props.modalProps"
    @ok="onDialogConfirm"
  >
    <a-select
      :loading="loading"
      placeholder="请输入"
      allow-search
      value-key="fsUserId"
      :style="{ 'margin-bottom': '10px' }"
      @search="handleSearch"
      @change="onSelectSearchChange"
    >
      <a-option
        v-for="item in state.searchOptions"
        :value="item"
        :key="item.fsUserId"
        >{{ item.userName }}</a-option
      >
    </a-select>

    <a-tree
      ref="$feishuTree"
      :data="state.treeData"
      default-expand-selected
      @select="onFeishuDialogTreeSelect"
    />
  </a-modal>
</template>

<script setup lang="ts">
  import { reactive, computed, watch, ref, nextTick } from 'vue';
  import type { TreeNodeData } from '@arco-design/web-vue/es/tree/interface';
  import { Tree } from '@arco-design/web-vue';
  import { getDepartments, getDepartmentUsers } from '@/api/system-config/user';
  import useLoading from '@/hooks/loading';

  const { loading, setLoading } = useLoading(false);

  type TreeCtx = InstanceType<typeof Tree>;

  type SearchOptions = {
    departmentId: string;
    fsUserId: string;
    userName: string;
  };

  const $feishuTree = ref<TreeCtx>();

  const props = defineProps({
    modelValue: {
      type: Boolean,
      dafault: false,
    },

    title: {
      type: String,
      default: '绑定飞书用户',
    },

    modalProps: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['update:modelValue', 'onOk']);

  const state = reactive({
    treeData: [],
    fsIds: [] as number[] | string[],
    currentNode: {},
    searchOptions: [] as SearchOptions[],
  });

  const visible = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  watch(
    () => props.modelValue,
    async (val) => {
      if (val) {
        if (state.treeData.length === 0) {
          const results = await getDepartments();
          state.treeData = results.data || [];
        }
      }
    }
  );

  const onSelectSearchChange = (val: any) => {
    state.fsIds = [val.fsUserId];
    state.currentNode = val;
  };

  const handleSearch = (userName: any) => {
    if (userName) {
      setLoading(true);
      getDepartmentUsers({
        userName,
      })
        .then((res) => {
          state.searchOptions = res.data || [];
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const onDialogConfirm = () => {
    emit('onOk', {
      fsIds: state.fsIds,
      currentNode: state.currentNode,
    });
  };

  const onFeishuDialogBeforeOK = () => {
    return state.fsIds.length > 0;
  };

  const onFeishuDialogTreeSelect = async (
    selectedKeys: Array<string | number>,
    data: {
      selected?: boolean;
      selectedNodes: TreeNodeData[];
      node?: any;
      e?: Event;
    }
  ) => {
    $feishuTree.value?.expandNode(data.node.key);

    if (data.node?.fsUserId) {
      state.fsIds = [data.node.fsUserId];
      state.currentNode = data.node;
    }

    if (data.node?.children && data.node.children.length === 0) {
      const results = await getDepartmentUsers({
        departmentId: data.node.key,
      });

      results.data.forEach((item: any) => {
        item.title = item.userName;
      });

      data.node.children = results.data;

      nextTick(() => {
        $feishuTree.value?.expandNode(data.node.key);
      });
    }
  };
</script>

<style lang="less" scoped></style>
