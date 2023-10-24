<template>
  <div>
    <a-table
      :columns="state.cardPayWayColumns"
      :data="renderData"
      :loading="loading"
      :pagination="false"
      :scroll="{ y: 300 }"
    >
      <template #templateContent="{ record }">
        {{ record.templateContent }}
      </template>
      <template #sendStatus="{ record }">
        <div class="flex-center-start">
          <div
            class="b-dot"
            :class="{
              'b-dot-orange': record.sendStatus === '2',
              'b-dot-green': record.sendStatus === '1',
              'b-dot-gray': record.sendStatus === '0',
            }"
          ></div>
          <div>
            {{ record.sendStatusDesc }}
          </div>
        </div>
      </template>
      <template #action="{ record }">
        <a-button type="outline" @click="previewMsg(record)">预览</a-button>
        <!--成功、待发送-->
        <a-button
          v-if="record.sendStatus === '2'"
          type="primary"
          @click="sendSms(record)"
          >发送</a-button
        >
        <!--成功-->
        <a-button
          v-if="record.sendStatus === '1'"
          type="primary"
          @click="sendSms(record)"
          >重新发送</a-button
        >
      </template>
    </a-table>
    <a-modal
      v-model:visible="state.previewDialog.state"
      title="短信预览"
      :mask-closable="false"
      :footer="false"
    >
      <div class="preview">
        {{ state.previewDialog.data?.fullContent }}
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted, ref } from 'vue';
  import { Message, TableColumnData } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import {
    appointmentSmsList,
    appointmentNotifySend,
    appointmentDetail,
  } from '@/api/member';
  import { useRoute } from 'vue-router';
  import { confirm } from '@/utils/dialog';
  import { onActivated } from 'vue';

  const props = withDefaults(
    defineProps<{
      data: Record<string, any>;
    }>(),
    {
      data() {
        return {};
      },
    }
  );

  const route = useRoute();
  const { loading, setLoading } = useLoading(true);
  const renderData = ref<any[]>([]);
  const state = reactive({
    previewDialog: {
      state: false,

      data: null as Record<string, any> | null,
    },
    cardPayWayColumns: [
      {
        title: '短信模版',
        dataIndex: 'templateContent',
        slotName: 'templateContent',
        ellipsis: true,
        tooltip: true,
        width: 500,
      },
      {
        title: '发送状态',
        dataIndex: 'sendStatus',
        slotName: 'sendStatus',
        width: 100,
      },
      {
        title: '发送时间',
        dataIndex: 'sendTime',
        slotName: 'sendTime',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'action',
        slotName: 'action',
        width: 200,
      },
    ] as TableColumnData[],
    appointmentNo: '',
    appointmentInitData: null as Record<string, any> | null,
  });

  // 见卡直付表单查询
  async function search() {
    setLoading(true);
    const directPaymentMethod = state.appointmentInitData?.directPaymentMethod;
    const processingStatus = state.appointmentInitData?.processingStatus;
    console.log('directPaymentMethod', directPaymentMethod);

    let bizType = '';
    if (directPaymentMethod === '0') {
      bizType = processingStatus === '1' ? 'APPO_CN_SMS' : 'APPO_CANCEL_CN_SMS';
    } else if (directPaymentMethod === '1') {
      bizType = processingStatus === '1' ? 'PZDF_CN_SMS' : 'PZDF_CANCEL_CN_SMS';
    } else if (directPaymentMethod === '2') {
      bizType = processingStatus === '1' ? 'GOF_CN_SMS' : 'GOF_CANCEL_CN_SMS';
    }
    const params: Record<string, any> = {
      appointmentNo: state.appointmentNo,
      bizType,
    };
    const json = await appointmentSmsList(params);
    setLoading(false);
    if (!json) {
      return;
    }
    renderData.value = json.data || [];
  }

  function previewMsg(data: Record<string, any>) {
    state.previewDialog.data = data;
    state.previewDialog.state = true;
  }

  async function sendSms(data: Record<string, any>) {
    const rs = await confirm({
      content: '确认发送?',
      async remote() {
        const params: Record<string, any> = {
          recordId: data.recordId,
          // appointmentNo: state.appointmentNo,
        };
        const json = await appointmentNotifySend(params).catch(() => false);
        return !!json;
      },
    });
    if (!rs) {
      return;
    }
    Message.success('发送成功');
    search();
  }

  async function getAppointmentInitData() {
    const json: any = await appointmentDetail({
      appointmentNo: state.appointmentNo,
    }).catch(() => false);
    return json ? json.data : null;
  }

  async function init() {
    state.appointmentNo = route.query.appointmentNo as string;
    state.appointmentInitData = await getAppointmentInitData();
    search();
  }

  onMounted(async () => {
    init();
  });
  onActivated(async () => {
    init();
  });
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>

<style scoped lang="less">
  .preview {
    white-space: pre-line;
  }
</style>
