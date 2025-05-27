// src/api/index.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://100.76.109.125:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // 또는 sessionStorage 등
    console.log(token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    api.interceptors.request.use((config) => {
  console.log('[🔍 최종 Request Headers]', config.headers)
  return config
})


    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 추후 로그인 토큰이 있다면 interceptor로 Authorization 추가 가능
export default api
