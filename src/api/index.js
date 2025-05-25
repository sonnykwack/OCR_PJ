// src/api/index.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // spring boot 기본 포트
  headers: {
    'Content-Type': 'application/json',
  },
})

// 추후 로그인 토큰이 있다면 interceptor로 Authorization 추가 가능
export default api
