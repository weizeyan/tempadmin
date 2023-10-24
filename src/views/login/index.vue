<template>
  <div class="container">
    <!-- <div class="logo">
      <img
        alt="logo"
        src="https://bhstatics.oss-cn-shanghai.aliyuncs.com/prosper-website/logo-img.png"
        class="logo-img"
      />
      <div class="logo-text">Prosper CS Portal</div>
    </div> -->
    <!-- <LoginBanner /> -->
    <div class="content">
      <div class="content-inner">
        <LoginForm />
      </div>
      <!-- <div class="footer">
        <Footer />
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  // import Footer from '@/components/footer/index.vue';
  import { onActivated, onMounted } from 'vue';
  import LoginBanner from './components/banner.vue';
  import LoginForm from './components/login-form.vue';
  onActivated(() => {
    console.log('onActivated login');
  });
  onMounted(() => {
    console.log('onMounted login');
  });
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    height: 100vh;

    .logo-text {
      color: #000;
    }

    .banner {
      width: 550px;
      background: linear-gradient(163.85deg, #1d2129 0%, #00308f 100%);
    }

    .content {
      position: relative;
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
    }

    .footer {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 100%;
    }
  }

  .logo {
    position: fixed;
    top: 24px;
    left: 22px;
    z-index: 1;
    display: inline-flex;
    align-items: center;

    &-text {
      margin-right: 4px;
      margin-left: 4px;
      color: var(--color-fill-1);
      font-size: 20px;
    }
  }
</style>

<style lang="less" scoped>
  .container {
    background-image: url('https://bhstatics.oss-cn-shanghai.aliyuncs.com/prosper-portal-admin-arco/login-bg.jpg');
    background-size: 100% 100%;
  }
  // responsive
  @media (max-width: @screen-lg) {
    .container {
      .banner {
        width: 25%;
      }
    }
  }

  .logo-img {
    width: 30px;
  }

  .content-inner {
    background: #fff;
    border-radius: 16px;
    padding: 40px 80px;
  }
</style>
