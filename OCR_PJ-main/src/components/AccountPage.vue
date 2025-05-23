<template>
  <div class="account-page">
    <h1>Account Management</h1>
    <p class="subtitle">Manage your account settings and preferences</p>

    <div class="account-container">
      <section class="panel personal-info">
        <h2>Personal Information</h2>
        <div class="fields">
          <div class="field-group">
            <label for="name">Full Name</label>
            <input id="name" type="text" placeholder="Your name" v-model="user.name" />
          </div>
          <div class="field-group">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" v-model="user.email" />
          </div>
          <div class="field-group">
            <label for="phone">Phone Number</label>
            <input id="phone" type="text" placeholder="+1 234 567 890" v-model="user.phone" />
          </div>
          <div class="field-group">
            <label for="lang">Language</label>
            <select id="lang" v-model="user.language">
              <option>English</option>
              <option>Korean</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 계정 연동 -->
      <section class="panel connect-accounts">
        <h2>Connect Accounts</h2>
        <button class="connect-btn">
          <img src="@/assets/google-icon.png" alt="Google" /> Connect with Google
        </button>
        <button class="connect-btn">
          <img src="@/assets/facebook-icon.png" alt="Facebook" /> Connect with Facebook
        </button>
        <button class="connect-btn">
          <img src="@/assets/apple-icon.png" alt="Apple" /> Connect with Apple
        </button>
      </section>

      <!-- 비번 -->
      <section class="panel security">
        <h2>Password & Security</h2>
        <ul class="sec-list">
          <li @click="changePassword">Change Password ➔</li>
          <li @click="setup2FA">Two-Factor Authentication ➔</li>
        </ul>
      </section>

      <!-- 수신 -->
      <section class="panel preferences">
        <h2>Preferences</h2>
        <div class="preference-option">
          <label>
            <input type="checkbox" v-model="prefs.emailNotifs" />
            <span>Email Notifications</span>
          </label>
        </div>
        <div class="preference-option">
          <label>
            <input type="checkbox" v-model="prefs.smsNotifs" />
            <span>SMS Notifications</span>
          </label>
        </div>
      </section>
    </div>

    <!-- 저장 -->
    <div class="actions">
      <button class="btn save" @click="saveAll">Save Changes</button>
      <button class="btn cancel" @click="resetAll">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountPage',
  data() {
    return {
      user: {
        fullName: '',
        email: '',
        phone: '',
        language: 'English',
      },
      prefs: {
        emailNotifs: true,
        smsNotifs: false,
      },
    }
  },
  methods: {
    changePassword() {
      alert('Navigate to change-password flow')
    },
    setup2FA() {
      alert('Navigate to two-factor setup')
    },
    saveAll() {
      // 여기에 저장 로직 추가해주세여
      alert('Your changes have been saved.')
    },
    resetAll() {
      this.user = { fullName: '', email: '', phone: '', language: 'English' }
      this.prefs = { emailNotifs: true, smsNotifs: false }
    },
  },
}
</script>

<style scoped>
.account-page {
  padding: 2rem;
  font-family: Arial, sans-serif;
}
.subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}
.account-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.panel {
  background: #fff;
  padding: 2rem;
  min-height: 250px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
.personal-info .fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
  margin-top: 1rem;
}
.field-group {
  display: flex;
  flex-direction: column;
}
.field-group label {
  font-weight: 500;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
}
.field-group input,
.field-group select {
  padding: 0.6rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}
.preference-option {
  margin-bottom: 0.75rem;
}

.connect-accounts .connect-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
.connect-accounts .connect-btn img {
  width: 20px;
  margin-right: 0.5rem;
}
.security .sec-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.security .sec-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.actions {
  text-align: right;
}
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn.save {
  background: #000;
  color: #fff;
  margin-right: 0.5rem;
}
.btn.cancel {
  background: #777;
  color: #fff;
}
</style>
