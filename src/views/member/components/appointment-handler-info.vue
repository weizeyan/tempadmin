<template>
  <a-card class="general-card" :title="title">
    <template #extra>
      <a-link title="操作日志" @click="tracking">
        <icon-history class="icon"> </icon-history>&nbsp;操作日志
      </a-link>
    </template>

    <a-descriptions :data="fields" bordered></a-descriptions>
    <a-modal
      v-model:visible="state.dialog.state"
      title="操作日志"
      :mask-closable="false"
      :width="800"
      :footer="false"
      @before-close="beforeClose"
    >
      <div ref="$listContainer" class="log-list">
        <template v-if="state.dialog.initData">
          <a-timeline v-if="state.dialog.initData.list.length > 0">
            <a-timeline-item
              v-for="(item, index) in state.dialog.initData.list"
              :key="index"
            >
              <div class="item-date">{{ item.operatorTime }}</div>
              <div class="item-content">
                <h3>{{ item.bizTypeDesc }}</h3>
                <div class="b-text">操作内容：{{ item.content }}</div>
                <div class="b-user">操作人：{{ item.operator }}</div>
                <div class="b-date">操作时间：{{ item.operatorTime }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
          <div v-else class="arco-empty">
            <icon-empty size="80" :style="{ color: 'rgba(0,0,0,0.5)' }" />
            <div class="text">暂无数据</div>
          </div>
        </template>
      </div>
    </a-modal>
  </a-card>
</template>

<script lang="ts" setup>
  import { DescData } from '@arco-design/web-vue';
  import { reactive, computed, ref } from 'vue';
  import { appointmentLogList } from '@/api/member';
  import { constant } from 'lodash';

  const props = withDefaults(
    defineProps<{
      title?: string;
      data: Record<string, any>;
    }>(),
    {
      title: '预约信息',
      data() {
        return {
          info: {},
        };
      },
    }
  );
  const state = reactive({
    dialog: {
      state: false,
      initData: null as null | Record<string, any>,
      pageNum: 1,
      pageSize: 10,
      hasNextPage: false,
      isLoading: false,
    },
  });
  const fields = computed<DescData[]>(() => {
    const info = props.data;
    const otherDate = info.acceptOtherTime
      ? (info.otherDate && info.otherEndDate
          ? `${info.otherDate} - ${info.otherEndDate}`
          : info.otherDate || '') +
        ' ' +
        (info.otherTime || '')
      : '';

    return [
      {
        label: '就诊医院',
        value: info.hospital || '',
      },
      {
        label: '营业性质',
        value: info.natureOfBusinessDesc || '',
      },
      {
        label: '医院联系电话',
        value: info.hospitalContactMobile || '',
      },
      {
        label: '国家',
        value: info.hospitalCountry || '',
      },
      {
        label: '省',
        value: info.hospitalProvince || '',
      },
      {
        label: '市',
        value: info.hospitalCity || '',
      },
      {
        label: '医院地址',
        value: info.hospitalAddress || '',
      },
      {
        label: '初/复诊',
        value: info.appointmentType === '0' ? '初诊' : '复诊',
      },
      {
        label: '就诊科室',
        value: info.department || '',
      },
      {
        label: '就诊医生',
        value: info.doctor || '',
      },
      {
        label: '就诊时间',
        value: (info.visitDate || '') + ' ' + (info.visitTime || ''),
      },
      {
        label: '其他时间段',
        value: info.acceptOtherTime === 'Y' ? '是' : '否',
      },
      {
        label: '备选时间',
        value: otherDate,
      },
      {
        label: '症状',
        value: info.symptoms || '',
      },
      {
        label: '症状补充说明',
        value: info.symptomsRemark || '',
      },
      {
        label: '联系人姓名',
        value: info.contact || '',
      },
      {
        label: '联系人电话',
        value: info.contactMobile || '',
      },
      {
        label: '内部备注',
        value: info.internalRemarks || '',
      },
    ];
  });

  const $listContainer = ref();

  async function tracking() {
    state.dialog.state = true;
    state.dialog.pageNum = 1;
    state.dialog.initData = null;
    fetchLogList();
    // $listContainer.value.addEventListener('scroll', scrollEvent);
  }

  async function scrollEvent(e: any) {
    const { scrollTop, clientHeight, offsetHeight, scrollHeight } =
      $listContainer.value;
    console.log(
      'scroll',
      scrollTop,
      clientHeight,
      offsetHeight,
      scrollHeight,
      state.dialog.isLoading
    );
    if (
      scrollTop + clientHeight + 30 >= scrollHeight &&
      state.dialog.hasNextPage &&
      !state.dialog.isLoading
    ) {
      console.log('next');
      state.dialog.pageNum += 1;
      state.dialog.isLoading = true;
      await fetchLogList();
      state.dialog.isLoading = false;
    }
  }

  async function fetchLogList() {
    const params = {
      orderNo: props.data.appointmentNo,
      // pageSize: state.dialog.pageSize,
      // pageNum: state.dialog.pageNum,
      // sorts: [
      //   {
      //     name: 'operatorTime',
      //     sort: 'DESC',
      //   },
      // ],
    };

    const json: any = await appointmentLogList(params).catch(() => false);
    if (!json) {
      return;
    }

    state.dialog.initData = {
      list: json.data || [],
    };

    // if (!state.dialog.initData) {
    //   state.dialog.initData = {
    //     list: [],
    //     total: 0,
    //   };
    // }
    // state.dialog.initData.list.push(...(data.list || []));
    // state.dialog.initData.total = data.total;
    // state.dialog.hasNextPage = data.hasNextPage;
  }

  function beforeClose() {
    // $listContainer.value.removeEventListener('scroll', scrollEvent);
    // console.log('remove scroll event');
  }
</script>

<style lang="less" scoped>
  .icon {
    font-size: 22px;
  }
  .log-list {
    padding-right: 20px;
    height: 600px;
    overflow: auto;
    .item-date {
      margin-bottom: 10px;
      color: #999;
    }
    .item-content {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      padding: 10px;
      margin-bottom: 20px;

      .b-text {
        white-space: pre-line;
        padding-bottom: 10px;
      }
      .b-user {
        padding-bottom: 10px;
      }
      .b-date {
        padding-bottom: 10px;
      }
    }
  }
</style>
