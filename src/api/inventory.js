import api from './index'

// ✅ 모든 인벤토리 조회
export const getInventoryList = () => {
  return api.get('/inventories')
}

// ✅ 인벤토리 생성
export const postInventory = (data) => {
  return api.post('/inventory', data)
}

// ✅ 인벤토리 이름 수정
export const updateInventory = (inventoryId, data) => {
  return api.put(`/inventory/${inventoryId}`, data)
}

// ✅ 인벤토리 삭제
export const deleteInventory = (inventoryId) => {
  return api.delete(`/inventory/${inventoryId}`)
}

// ✅ 해당 인벤토리의 아이템 조회
export const getInventoryItems = (inventoryId) => {
  return api.get(`/inventory/${inventoryId}`)
}

// ✅ 아이템 추가
export const addInventoryItem = (itemData) => {
  return api.post('/inventory/item', itemData)
}

// ✅ 아이템 수정
export const updateInventoryItem = (itemId, updatedData) => {
  return api.put(`/inventory/item/${itemId}`, updatedData)
}

// ✅ 아이템 삭제
export const deleteInventoryItem = (itemId) => {
  return api.delete(`/inventory/item/${itemId}`)
}
