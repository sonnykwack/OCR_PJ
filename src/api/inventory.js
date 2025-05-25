// 재고 관련 API 함수 모음
import api from './index'

// ✅ 인벤토리 전체 조회
export const getInventoryItems = (userId) => {
  return api.get(`/inventory/${userId}`)
}

// ✅ 인벤토리에 항목 추가
export const addInventoryItem = (itemData) => {
  return api.post('/inventory/item', itemData)
}

// ✅ 항목 수정
export const updateInventoryItem = (itemId, updatedData) => {
  return api.put(`/inventory/item/${itemId}`, updatedData)
}

// ✅ 항목 삭제
export const deleteInventoryItem = (itemId) => {
  return api.delete(`/inventory/item/${itemId}`)
}
