import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue' // 로그린 페이지
import HomePage from '../components/HomePage.vue' // 홈 페이지
import ReceiptPage from '../components/ReceiptPage.vue' // 영수증 업로드
import InventoryPage from '../components/InventoryPage.vue' //목록
import AccountPage from '@/components/AccountPage.vue' // 유저 정보
import RecomPage from '@/components/RecomPage.vue' //메뉴 추천 페이지

const routes = [
  { path: '/', component: LoginPage },
  { path: '/home', component: HomePage },
  { path: '/receipt', component: ReceiptPage },
  { path: '/inventory', component: InventoryPage },
  { path: '/account', component: AccountPage },
  { path: '/recipes', component: RecomPage},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
