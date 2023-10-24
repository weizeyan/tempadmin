<template>
  <div class="container">
    <a-card title="在线预约" class="general-card">
      <div class="main-container">
        <a-steps :current="state.step" label-placement="vertical">
          <a-step>选择科室</a-step>
          <a-step>选择医生</a-step>
          <a-step>选择就诊日期</a-step>
          <a-step>提交预约</a-step>
        </a-steps>
        <keep-alive>
          <Department
            v-if="state.step === 1"
            :data="state.stepData"
            @change="
              (department) => {
                state.stepData.department = department;
                next();
              }
            "
          ></Department>
          <Doctor
            v-else-if="state.step === 2"
            :data="state.stepData"
            @change="doctorChange"
          ></Doctor>
          <PatientDate
            v-else-if="state.step === 3"
            :data="state.stepData"
          ></PatientDate>
          <Submit v-else-if="state.step === 4" :data="state.stepData"></Submit>
        </keep-alive>
        <!--
        <Department
          v-if="state.step === 1"
          :data="state.stepData"
          @change="
            (department) => {
              state.stepData.department = department;
              next();
            }
          "
        ></Department>
        <Doctor v-if="state.step === 2" :data="state.stepData"></Doctor>


        -->

        <div class="nav flex-center">
          <a-button v-if="state.step > 1" type="outline" @click="prev"
            >上一步</a-button
          >
          <a-button
            v-if="state.step > 1 && state.step < 4"
            type="primary"
            @click="next"
            >下一步</a-button
          >
          <a-button v-if="state.step === 4" type="primary" @click="submit"
            >确认提交</a-button
          >
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import {
    ref,
    reactive,
    watch,
    onMounted,
    onActivated,
    shallowRef,
  } from 'vue';
  import { list, searchCorporateList } from '@/api/member';
  import { useRouter } from 'vue-router';
  import Department from './components/department.vue';
  import Doctor from './components/doctor.vue';
  import PatientDate from './components/patient-date.vue';
  import Submit from './components/submit.vue';

  const state = reactive({
    step: 1,
    stepData: {
      department: null as null | Record<string, any>,
      doctor: null as null | Record<string, any>,
      patientDate: null as null | Record<string, any>,
      submit: null as null | Record<string, any>,
    },
    include: ['Department', 'Doctor', 'PatientDate', 'Submit'] as string[],
  });

  async function submit() {}

  function prev() {
    if (state.step === 1) {
      return;
    }

    state.step -= 1;
  }
  function removeCache(componentName: string) {
    state.include = state.include.filter((name) => {
      return name !== componentName;
    });
  }
  function doctorChange(doctor: Record<string, any>) {
    console.log('doctorChange', doctor);
    state.stepData.doctor = doctor;
  }
  function next() {
    if (state.step === 4) {
      return;
    }
    state.step += 1;
  }

  onMounted(() => {});

  onActivated(() => {});
</script>

<script lang="ts">
  export default {
    name: 'HospitalConnHuaDongHospitalAppointment',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>

<style scoped lang="less">
  .main-container {
    margin: 0 200px;
  }
  .arco-steps {
    margin-bottom: 20px;
  }
  .nav {
    padding-top: 20px;
    button {
      margin-right: 20px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
</style>
