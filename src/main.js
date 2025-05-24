import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import i18n from './i18n'
import { createPinia } from 'pinia'
import api from './lib/api'

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(createPinia())
app.mount('#app')
app.config.globalProperties.$api = api
