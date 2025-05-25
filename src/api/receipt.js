// 영수증 관련 API 함수 모음
import api from './index'

// ✅ 영수증 이미지 업로드 (OCR)
export const uploadReceipt = (formData) => {
  return api.post('/receipt', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// ✅ OCR로 파싱된 항목 저장
export const saveParsedItems = (parsedItems) => {
  return api.post('/parseditem/save', parsedItems)
}
