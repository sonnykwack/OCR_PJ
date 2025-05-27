import api from './index'

// ✅ 모든 인벤토리 조회
export const getInventoryList = () => api.get('/inventories')

// ✅ 인벤토리 생성
export const postInventory = (data) => api.post('/inventories', data)

// ✅ 인벤토리 이름 수정
export const updateInventory = (inventoryId, data) =>
  api.put(`/inventories/${inventoryId}`, data)

// ✅ 인벤토리 삭제
export const deleteInventory = (inventoryId) =>
  api.delete(`/inventories/${inventoryId}`)
