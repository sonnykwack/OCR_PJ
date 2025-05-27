<template>
  <div class="receipt-page">
    <h2 class="title">영수증 OCR 업로드</h2>
    <p class="subtitle">영수증을 드래그하거나 선택하여 업로드하고 OCR을 진행하세요.</p>

    <div class="upload-area">
      <div class="upload-box">
        <label>📷 Upload Receipt Image</label>
        <input type="file" accept="image/*" @change="handleFileChange" />

        <div v-if="imagePreview" class="drop-zone">
          <img :src="imagePreview" class="preview" alt="Receipt Preview">
          <p>OCR을 진행하시겠습니까?</p>
          <button @click="submitImage">✅ Yes</button>
          <button @click="resetForm">❌ No</button>
        </div>
      </div>

      <div class="guide-box">
        <h3>📌 가이드</h3>
        <img src="@/assets/KakaoTalk_20250525_115209143.png" class="guide-image" alt="Guide" />
        <p class="guide-text">
          - 명확하게 촬영된 영수증 이미지를 업로드해 주세요.<br>
          - OCR 진행 후 품목 정보를 확인하고 보완할 수 있습니다.<br>
          - 품목 수정 및 저장 후 인벤토리에 자동 등록됩니다.
        </p>
      </div>
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>🧾 OCR 품목 검토</h3>
        <div v-for="(item, idx) in parsedItems" :key="idx" class="item-row">
          <input v-model="item.item_name" placeholder="품목명" />
          <input type="number" min="1" v-model.number="item.quantity" placeholder="수량" />

          <select v-model="item.storage_type">
            <option value="">보관 방식 선택</option>
            <option value="fridge">냉장</option>
            <option value="freezer">냉동</option>
          </select>

          <input type="date" v-model="item.expiration_date" placeholder="유통기한" />

          <select v-model="item.inventory_id">
            <option disabled value="">인벤토리 선택</option>
            <option v-for="inv in inventories" :key="inv.inventory_id" :value="inv.inventory_id">
              {{ inv.inventory_name }}
            </option>
          </select>

          <button @click="removeItem(idx)">🗑</button>
        </div>

        <div class="modal-actions">
          <button @click="saveItems">💾 저장</button>
          <button @click="closeModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  uploadReceipt,
  getParsedItemsByReceiptId,
  deleteParsedItems
} from '@/api/receipts'
import { getInventoryList } from '@/api/inventory'
import { addInventoryItem } from '@/api/inventoryItem'

export default {
  name: 'OCRUpload',
  data() {
    return {
      imageFile: null,
      imagePreview: '',
      receiptId: null,
      parsedItems: [],
      inventories: [],
      showModal: false,
    }
  },
  methods: {
    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.imageFile = file
        this.imagePreview = URL.createObjectURL(file)
      }
    },
    async submitImage() {
      try {
        const formData = new FormData()
        formData.append('image', this.imageFile)

        const res = await uploadReceipt(formData)
        const receiptId = res.data.receiptId
        console.log('[✅ receipt_id]', receiptId)

        if (!receiptId) {
          throw new Error('❌ receipt_id가 없습니다. OCR 실패 또는 응답 오류')
        }

        this.receiptId = receiptId

        const parsed = await getParsedItemsByReceiptId(receiptId)
        console.log('[📦 parsed items]', parsed.data)

        this.parsedItems = parsed.data.map(item => ({
          item_name: item.itemName,
          quantity: item.quantity,
          storage_type: '',
          expiration_date: '',
          inventory_id: null
        }))

        const invRes = await getInventoryList()
        this.inventories = (invRes.data || []).map(inv => ({
          inventory_id: inv.inventoryId,
          inventory_name: inv.inventoryName
        }))

        this.showModal = true
      } catch (err) {
        console.error('OCR or fetch failed:', err)
      }
    },
    async saveItems() {
      try {
        const savePromises = this.parsedItems.map(item => {
          return addInventoryItem({
            inventory_id: item.inventory_id,
            item_name: item.item_name,
            quantity: Number(item.quantity),
            storage_type: item.storage_type,
            expiration_date: item.expiration_date
          })
        })

        await Promise.all(savePromises)
        await deleteParsedItems(this.receiptId)
        this.resetForm()
        alert('✅ 저장 완료!')
      } catch (err) {
        console.error('Save failed:', err)
      }
    },
    removeItem(index) {
      this.parsedItems.splice(index, 1)
    },
    closeModal() {
      this.showModal = false
    },
    resetForm() {
      this.imageFile = null
      this.imagePreview = ''
      this.receiptId = null
      this.parsedItems = []
      this.showModal = false
    },
  }
}
</script>

<style scoped>
.receipt-page {
  padding: 2rem;
  font-family: sans-serif;
}
.title {
  font-size: 2rem;
  font-weight: bold;
}
.subtitle {
  margin-bottom: 2rem;
  color: #777;
}
.upload-area {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}
.upload-box {
  flex: 1;
  border: 2px dashed #ccc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
}
.drop-zone {
  height: auto;
  border: 1px dashed #aaa;
  margin: 1rem 0;
  padding: 1rem;
  color: #666;
}
button {
  background: black;
  color: white;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  border: none;
  cursor: pointer;
}
.hint {
  font-size: 0.8rem;
  color: #999;
}
.guide-box {
  flex: 1;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  min-width: 300px;
}
.guide-box h3 {
  margin-top: 0;
}
.guide-image {
  width: 100%;
  border-radius: 6px;
  margin: 1rem 0;
}
.guide-text {
  font-size: 0.9rem;
  color: #444;
}
.preview {
  max-width: 300px;
  margin: 1rem auto;
  border: 1px solid #ccc;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}
.item-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
