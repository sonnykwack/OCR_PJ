import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// 요청 시 토큰 자동 부착
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 에러 공통 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.')
      window.location.href = '/'
    }
    return Promise.reject(err)
  },
)

export default api
