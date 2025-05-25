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

// ✅ 최근 업로드된 영수증 목록 불러오기
export const getRecentReceipts = () => {
  return api.get('/receipt/recent')
}

// ✅ 특정 영수증의 OCR 결과 조회
export const getParsedItemsByReceiptId = (receiptId) => {
  return api.get(`/parseditem/${receiptId}`)
}

// ✅ 특정 영수증의 ParsedItem 삭제 요청
export const deleteParsedItems = (receiptId) => {
  return api.post(`/parseditem/delete/${receiptId}`)
}
