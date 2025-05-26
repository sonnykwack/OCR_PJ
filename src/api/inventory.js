import api from './index'

// ✅ 모든 인벤토리 조회
export const getInventoryList = () => {
  return api.get('/inventories')
}

// ✅ 인벤토리 생성
export const postInventory = (data) => {
  return api.post('/inventories', data)
}

// ✅ 인벤토리 이름 수정
export const updateInventory = (inventoryId, data) => {
  return api.put(`/inventories/${inventoryId}`, data)
}

// ✅ 인벤토리 삭제
export const deleteInventory = (inventoryId) => {
  return api.delete(`/inventories/${inventoryId}`)
}

// ✅ 해당 인벤토리의 아이템 조회
export const getInventoryItems = (inventoryId) => {
  // 반드시 /items 경로로 호출
  return api.get(`/inventories/${inventoryId}/items`)
}

// ✅ 아이템 추가
export const addInventoryItem = (itemData) => {
  return api.post('/inventories/item', itemData)
}

// ✅ 아이템 수정
export const updateInventoryItem = (itemId, updatedData) => {
  return api.put(`/inventories/item/${itemId}`, updatedData)
}

// ✅ 아이템 삭제
export const deleteInventoryItem = (itemId) => {
  return api.delete(`/inventories/item/${itemId}`)
}
