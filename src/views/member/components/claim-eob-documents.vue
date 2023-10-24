<template>
  <div>
    <a-card class="general-card" title="EOB">
      <template #extra>
        <a-button
          v-if="state.claimEobInitData"
          :disabled="!state.claimEobInitData.length"
          type="primary"
          @click="initEmailDialog()"
          >新建自付额邮件</a-button
        >
      </template>
      <a-table
        v-if="state.claimEobInitData"
        :data="state.claimEobInitData"
        :pagination="false"
        :columns="eobColumns"
        :bordered="false"
      >
        <template #fileName="{ record }">
          <a href="#" @click.prevent="previewEobFile(record)">{{
            record.fileName
          }}</a>
        </template>
        <template #action="{ record }">
          <a-button type="primary" @click="previewEobFile(record)"
            ><icon-right-circle />&nbsp;Preview</a-button
          >
          &nbsp;
          <a-button type="primary" @click="downloadEobFile(record)"
            ><icon-arrow-down />&nbsp;Download</a-button
          >
        </template>
      </a-table>
    </a-card>
    <a-card class="general-card" title="Documents">
      <a-table
        v-if="state.claimDocInitData"
        :data="state.claimDocInitData"
        :pagination="false"
        :columns="documentsColumns"
        :bordered="false"
      >
        <template #fileName="{ record }">
          <a href="#" @click.prevent="previewDocumentFile(record)">{{
            record.fileName
          }}</a>
        </template>
        <template #action="{ record }">
          <a-button type="primary" @click="previewDocumentFile(record)"
            ><icon-right-circle />&nbsp;Preview</a-button
          >
          &nbsp;
          <a-button type="primary" @click="downloadDocumentFile(record)"
            ><icon-arrow-down />&nbsp;Download</a-button
          >
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="state.emailDialog.state"
      draggable
      :width="850"
      :footer="state.emailDialog.tab === '1'"
      ok-text="发送"
      :mask-closable="false"
      :esc-to-close="false"
      :on-before-ok="
        () => {
          return $emailDialogForm.query();
        }
      "
    >
      <template #title>
        <a-tabs v-model:active-key="state.emailDialog.tab" class="b-tab">
          <a-tab-pane key="1" title="新建"></a-tab-pane>
          <a-tab-pane key="2" title="发送记录"></a-tab-pane>
        </a-tabs>
      </template>

      <div class="b-email-container">
        <template v-if="state.emailDialog.tab === '1'">
          <template v-if="state.emailInitData">
            <QueryForm
              ref="$emailDialogForm"
              v-model="state.emailFields"
              :form-type="2"
              :col-span="24"
              :label-col-props="{ span: 3 }"
              :wrapper-col-props="{ span: 21 }"
              label-align="right"
              direction="vertical"
              :show-button-bar="false"
              :save="saveEmailDialogForm"
            >
            </QueryForm>
            <a-row>
              <a-col :span="3"></a-col>
              <a-col :span="21">
                <Editor
                  ref="$editor"
                  v-model:content="state.content"
                  v-model:file-list="state.fileList"
                  :upload="upload"
                ></Editor>
              </a-col>
            </a-row>
          </template>
        </template>
        <template v-if="state.emailDialog.tab === '2'">
          <a-table
            v-if="state.emailRecordsInitData"
            :data="state.emailRecordsInitData.list"
            :columns="state.emailRecordsColumns"
            :pagination="false"
            :scroll="{ y: 500 }"
          >
            <template #type="{ record }">
              {{ record.lang === 'CN' ? '中文' : 'EN' }}
            </template>
            <template #status="{ record }">
              <span
                :class="{
                  'b-status-red': record.status == '0',
                  'b-status-green': record.status == '1',
                  'b-status-gray': record.status == '2',
                }"
                >{{ record.statusDesc }}</span
              >
            </template>
            <template #action="{ record }">
              <a-button type="outline" @click="previewEmail(record)"
                >预览</a-button
              >
              <a-button type="primary" @click="resend(record)"
                >再次发送</a-button
              >
            </template>
          </a-table>
        </template>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="state.previewDialog.state"
      draggable
      title="邮件预览"
      :width="800"
      :footer="false"
    >
      <div class="b-email-container">
        <div
          v-if="state.previewDialog.state && state.currentEmailRecord"
          class="b-preview"
        >
          <a-row :gutter="20">
            <a-col class="label" :span="3">邮件模板</a-col>
            <a-col class="desc" :span="21">
              {{ state.currentEmailRecord.lang }}
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col class="label" :span="3">发件人</a-col>
            <a-col class="desc" :span="21">
              {{ state.currentEmailRecord.emailSender }}
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col class="label" :span="3">收件人</a-col>
            <a-col class="desc" :span="21">
              {{ state.currentEmailRecord.receiver }}
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col class="label" :span="3">主题</a-col>
            <a-col class="desc" :span="21">
              {{ state.currentEmailRecord.title }}
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col class="label" :span="3"></a-col>
            <a-col class="desc" :span="21">
              <div
                style="height: 300px; overflow-x: hidden; overflow-y: auto"
                v-html="replaceContent(state.currentEmailRecord?.fullContent)"
              ></div>
            </a-col>
          </a-row>
          <a-row v-if="state.currentEmailRecord.attachs.length" :gutter="20">
            <a-col class="label" :span="3" style="padding-top: 10px"
              >附件</a-col
            >
            <a-col class="desc" :span="21">
              <div
                class="b-file-list flex-center-start"
                style="padding: 10px 0 0"
              >
                <div
                  v-for="(item, index) in state.currentEmailRecord.attachs"
                  :key="index"
                  class="file-item"
                >
                  <div class="con flex-center-between">
                    <a :href="item.value" :title="item.name" target="_blank">{{
                      item.name
                    }}</a>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    claimEob,
    claimDoc,
    downloadDocument,
    downloadEob,
    claimEmailBaseInfo,
    claimEmailSend,
    claimEmailList,
    claimEmailUploadAttach,
  } from '@/api/member';
  import { confirm } from '@/utils/dialog';
  import { Form, Message, TableColumnData } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import { downloadFile, base642Blob } from '@/utils';
  import { Field } from '@/components/query-form/index.vue';
  import Editor, { AttachmentFile } from './editor.vue';

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
  const fromLabel = ref('发件人');
  const toLabel = ref('收件人');
  const subjectLabel = ref('主题');
  const state = reactive({
    id: '',
    content: '',
    fileList: [] as AttachmentFile[],
    claimEobInitData: null as Record<string, any>[] | null,
    claimDocInitData: null as Record<string, any>[] | null,
    currentEmailRecord: null as Record<string, any> | null,
    emailInitData: null as Record<string, any> | null,
    emailRecordsInitData: null as Record<string, any> | null,
    emailRecordsColumns: [
      {
        dataIndex: 'lang',
        slotName: 'lang',
        title: '邮件模板',
        width: 100,
      },
      {
        dataIndex: 'sender',
        slotName: 'sender',
        title: '操作人',
        width: 100,
        tooltip: true,
        ellipsis: true,
      },
      {
        dataIndex: 'emailSender',
        slotName: 'emailSender',
        title: '发件邮箱',
        width: 200,
        tooltip: true,
        ellipsis: true,
      },
      {
        dataIndex: 'status',
        slotName: 'status',
        title: '发送状态',
        width: 100,
      },
      {
        dataIndex: 'sendTime',
        slotName: 'sendTime',
        title: '发送时间',
        width: 180,
      },
      {
        dataIndex: 'action',
        slotName: 'action',
        title: '操作',
        width: 200,
      },
    ] as TableColumnData[],
    emailFields: [
      {
        type: 'radio',
        name: 'bizType',
        label: '邮件模板',
        value: 'CSPA_CN_EMAIL',
        options: [
          {
            label: '中文',
            value: 'CSPA_CN_EMAIL',
          },
          {
            label: 'EN',
            value: 'CSPA_EN_EMAIL',
          },
        ],
        rules: [
          {
            required: true,
            message: '请选择邮件模板',
          },
        ],
      },
      {
        type: 'input',
        name: 'from',
        label: fromLabel,
        value: '',
        disabled: true,
        rules: [
          {
            required: true,
            message: '请输入发件人',
          },
        ],
      },

      {
        type: 'input-tag',
        name: 'receiver',
        label: toLabel,
        value: [],
        rules: [
          {
            required: true,
            message: '请输入收件人',
          },
        ],
      },
      {
        type: 'input',
        name: 'title',
        label: subjectLabel,
        value: '',
        rules: [
          {
            required: true,
            message: '请输入主题',
          },
        ],
      },
    ] as Field[],
    emailDialog: {
      tab: '',
      state: false,
    },
    previewDialog: {
      state: false,
    },
  });

  const $editor = ref();
  const $emailDialogForm = ref();
  const { loading, setLoading } = useLoading(false);

  const eobColumns: TableColumnData[] = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      slotName: 'fileName',
    },
    {
      title: 'Action',
      slotName: 'action',
      width: 300,
    },
  ];

  const documentsColumns: TableColumnData[] = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      slotName: 'fileName',
    },
    {
      title: 'File Type',
      dataIndex: 'fileType',
      slotName: 'fileType',
      width: 200,
    },
    {
      title: 'Action',
      slotName: 'action',
      width: 300,
    },
  ];
  function previewEmail(record: Record<string, any>) {
    state.previewDialog.state = true;
    state.currentEmailRecord = record;
  }
  async function initEmailDialog() {
    state.emailDialog.state = true;
    state.emailDialog.tab = '1';
    state.emailInitData = null;

    const emailInitData = await getEmailInitData();
    state.emailRecordsInitData = await getEmailRecordsInitData();
    console.log('state.emailInitData', emailInitData);
    if (!emailInitData) {
      return;
    }
    const { fileList, list } = emailInitData;

    state.emailFields[0].value = 'CSPA_CN_EMAIL';

    state.emailFields[2].value = props.data.email
      ? props.data.email.split(',')
      : [];

    const find = list.find((item: Record<string, any>) => {
      return (
        item.lang ===
        (state.emailFields[0].value === 'CSPA_CN_EMAIL' ? 'CN' : 'EN')
      );
    }) as Record<string, any>;
    state.emailFields[1].value = find.sendor;
    state.content = replaceContent(find.content);
    state.emailFields[3].value = find.title;
    state.emailInitData = emailInitData;
    state.fileList = fileList;
  }

  async function saveEmailDialogForm(
    data: Record<string, any>
  ): Promise<boolean> {
    if (!state.content) {
      Message.error('请填写邮件内容');
      return false;
    }
    const post: Record<string, any> = {
      ...data,
      receiver: data.receiver.join(','),
      bizId: state.id,
      content: state.content,
      attach: state.fileList.map((file) => {
        return file.url;
      }),
    };
    console.log('post', post);
    const json: any = await claimEmailSend(post).catch(() => false);
    return !!json;
  }

  async function resend(record: Record<string, any>) {
    const confirmRs = await confirm({
      content: '是否确认发送?',
      remote: async () => {
        const json: any = await claimEmailSend({
          recordId: record.recordId,
        }).catch(() => false);
        return !!json;
      },
    });
    if (!confirmRs) {
      return;
    }
    Message.success('发送成功');
    state.emailRecordsInitData = await getEmailRecordsInitData();
  }

  async function upload(attachmentFile: Record<string, any>) {
    const fd = new FormData();
    fd.append('filePath', attachmentFile.file);
    const json: any = await claimEmailUploadAttach(fd).catch(() => false);
    if (!json) {
      return false;
    }
    attachmentFile.url = json.value;
    [attachmentFile.name] = json.key.split('/').reverse();

    return true;
  }

  async function getEmailInitData() {
    const json: any = await claimEmailBaseInfo({
      claimId: state.id,
      claimsStatus: props.data.claimsStatus,
      bizTypes: ['CSPA_CN_EMAIL', 'CSPA_EN_EMAIL'],
    }).catch(() => false);
    return json
      ? {
          list: json.data.templist || [],
          fileList: (json.data.attach || []).map(
            (item: Record<string, any>) => {
              return {
                name: item.key,
                url: item.value,
              };
            }
          ),
        }
      : null;
  }
  async function getEmailRecordsInitData() {
    const json: any = await claimEmailList({
      claimId: state.id,
    }).catch(() => false);
    return json
      ? {
          list: json.data || [],
        }
      : null;
  }
  async function getClaimEobInitData() {
    const json: any = await claimEob({
      claimsStatus: props.data.claimsStatus,
      claimId: state.id,
    }).catch(() => false);
    return json ? json.data || [] : null;
  }
  async function getClaimDocInitData() {
    const json: any = await claimDoc({
      claimId: state.id,
    }).catch(() => false);
    return json ? json.data || [] : null;
  }

  function getDownloadParams(item: Record<string, any>): Record<string, any> {
    return {
      cardNo: props.data.cardNo,
      claimsId: props.data.claimId,
      claimsType: 'Claim',
      fileName: encodeURIComponent(item.fileName),
    };
  }

  function previewDocumentFile(item: Record<string, any>) {
    const params = getDownloadParams(item);
    const fileUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/document/file/getDocument?cardNo=${params.cardNo}&claimsId=${
      params.claimsId
    }&claimsType=${params.claimsType}&fileName=${params.fileName}`;
    console.log('fileUrl', fileUrl);
    window.open(fileUrl);
  }
  async function downloadDocumentFile(item: Record<string, any>) {
    const params = getDownloadParams(item);
    const response: any = await downloadDocument(params).catch(() => false);
    if (!response) {
      return;
    }
    const blob = new Blob([response.data]);
    downloadFile(blob, item.fileName);
  }

  function previewEobFile(item: Record<string, any>) {
    const fileUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/document/file/getEob?claimId=${props.data.claimId}&claimsStatus=${
      props.data.claimsStatus
    }`;
    console.log('fileUrl', fileUrl);
    window.open(fileUrl);
  }
  async function downloadEobFile(item: Record<string, any>) {
    const response: any = await downloadEob({
      claimId: props.data.claimId,
      claimsStatus: props.data.claimsStatus,
    }).catch(() => false);
    if (!response) {
      return;
    }
    const blob = new Blob([response.data]);
    downloadFile(blob, item.fileName);
  }

  function replaceContent(content: string): string {
    // console.log('content', content);
    const pat = /<body([\s\S]*?)>([\s\S]*?)<\/body>/i;
    const match = content.match(pat);
    return match ? match[2] : content;
  }

  onMounted(async () => {
    state.id = route.query.id as string;
    [state.claimEobInitData, state.claimDocInitData] = await Promise.all([
      getClaimEobInitData(),
      getClaimDocInitData(),
    ]);
  });

  watch(
    () => state.emailFields[0].value,
    (v, oldV) => {
      if (v !== oldV) {
        fromLabel.value = v === 'CSPA_CN_EMAIL' ? '发件人' : 'From';
        toLabel.value = v === 'CSPA_CN_EMAIL' ? '收件人' : 'To';
        subjectLabel.value = v === 'CSPA_CN_EMAIL' ? '主题' : 'Subject';
        const { list } = state.emailInitData as Record<string, any>;
        const find = list.find((item: Record<string, any>) => {
          return item.lang === (v === 'CSPA_CN_EMAIL' ? 'CN' : 'EN');
        }) as Record<string, any>;
        state.emailFields[1].value = find.sendor;
        state.content = replaceContent(find.content);
        state.emailFields[3].value = find.title;
      }
    }
  );
</script>

<style lang="less" scoped>
  .b-email-container {
    height: 620px;
    overflow-y: auto;
    overflow-x: hidden;

    .b-preview {
      .arco-row {
        border-bottom: 1px solid var(--color-neutral-3);
        padding: 10px;
        .label {
          text-align: right;
        }
      }
    }
  }
</style>

<style scoped lang="less" src="@/assets/style/list.less"></style>
