<template>
  <div class="login-page">
    <!-- 왼쪽 패널: 이미지 + 설명 -->
    <div class="left-panel">
      <img src="@/assets/냉장고.png" alt="Fridge Illustration" />
      <!--임시 이미지입니다-->
      <h2>Manage Your Fridge Smarter</h2>
      <p>
        Track your groceries, reduce food waste, and discover recipes – all in one place. Our
        AI-powered system makes food management effortless.
      </p>
    </div>

    <!-- 오른쪽 패널: 로그인 폼 -->
    <div class="right-panel">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <div class="login-header">
        <h1>Welcome back</h1>
        <p class="signup">
          Don’t have an account?
          <a href="#">Sign up</a>
        </p>
      </div>

      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="Email address" required />
        <input v-model="password" type="password" placeholder="Password" required />

        <div class="options">
          <label>
            Remember me
            <input type="checkbox" v-model="remember" />
          </label>
          <a href="#">Forgot password?</a>
        </div>

        <button type="submit" class="signin-btn">Sign in</button>
      </form>

      <div class="divider"><span>Or continue with</span></div>
      <button class="google-btn">Sign in with Google</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      remember: false,
    }
  },
  methods: {
    login() {
      // 여기에 실제 인증 구현하시면 추가해주세요
      console.log('로그인 시도:', this.email, this.password, this.remember)
      this.$router.push('/home')
    },
  },
}
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.left-panel {
  flex: 1;
  background-color: #000;
  color: #fff;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.left-panel img {
  width: 200px;
  margin-bottom: 1rem;
}
.left-panel h2 {
  font-size: 1.5rem;
  margin-top: 1rem;
}
.left-panel p {
  margin-top: 1rem;
  line-height: 1.5;
  text-align: center;
}

.right-panel {
  flex: 1;
  padding: 3rem 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.logo {
  height: 60px;
  width: auto;
  display: block;
  margin: 0 auto 1rem auto;
  object-fit: contain;
}
.right-panel h1 {
  margin: 0.5rem 0;
}
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}
.signup {
  margin-bottom: 2rem;
  font-size: 0.9rem;
}
.signup a {
  color: #3498db;
  text-decoration: none;
}

form input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.options label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.options a {
  color: #3498db;
  text-decoration: none;
}

.signin-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}
.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #ccc;
}
.divider::before {
  left: 0;
}
.divider::after {
  right: 0;
}
.divider span {
  background-color: #fff;
  padding: 0 0.5rem;
  color: #888;
}

.google-btn {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}
</style>
