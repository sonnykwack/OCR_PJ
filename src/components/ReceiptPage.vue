<template>
  <div class="receipt-page">
    <h1 class="title">Receipt OCR</h1>
    <p class="subtitle">Scan and process your receipts automatically</p>

    <div class="upload-area">
      <div class="upload-box">
        <h3>Upload Receipt</h3>
        <input type="file" @change="handleFileUpload" accept="image/*,application/pdf" />
        <p class="hint">Supports JPG, PNG, PDF up to 10MB</p>
      </div>

      <div class="guide-box">
        <h3>Receipt Scanner User Guide</h3>
        <img src="/src/assets/KakaoTalk_20250525_115209143.png" alt="Receipt example" class="guide-image" />
        <p class="guide-text">
          For better performance of the Receipt Scanner, please upload a photo file of your receipt with the <strong>Item Name</strong>, and the <strong>Quantity</strong> only.<br/>
          For your information, follow the provided photo example.
        </p>
      </div>
    </div>

    <div class="recent">
      <h3>Recent Scans</h3>
      <ul class="scan-list">
        <li v-for="receipt in recentReceipts" :key="receipt.receipt_id">
          <strong>{{ receipt.title || 'Receipt #' + receipt.receipt_id }}</strong><br />
          <small>Uploaded at: {{ formatDate(receipt.uploaded_at) }}</small>
          <a :href="'/receipt/' + receipt.receipt_id">View Details</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { uploadReceipt, saveParsedItems, getRecentReceipts } from '@/api/receipt'

export default {
  name: 'ReceiptPage',
  data() {
    return {
      recentReceipts: [],
    }
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      try {
        await uploadReceipt(formData)
        this.fetchReceipts()
      } catch (err) {
        console.error('Upload failed:', err)
      }
    },
    async fetchReceipts() {
      try {
        const res = await getRecentReceipts()
        this.recentReceipts = res.data
      } catch (err) {
        console.error('Failed to load recent receipts:', err)
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString()
    }
  },
  mounted() {
    this.fetchReceipts()
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
}
.upload-box {
  flex: 1;
  border: 2px dashed #ccc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}
.guide-box {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #f9f9f9;
  text-align: center;
}
.guide-image {
  max-width: 100%;
  border: 1px solid #ccc;
  margin-bottom: 0.5rem;
}
.guide-text {
  font-size: 0.9rem;
  color: #444;
}
input[type='file'] {
  display: block;
  margin: 1rem auto;
}
.hint {
  font-size: 0.8rem;
  color: #999;
}
.recent h3 {
  margin-bottom: 1rem;
}
.scan-list {
  list-style: none;
  padding: 0;
}
.scan-list li {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.scan-list a {
  float: right;
  color: #007bff;
  text-decoration: none;
}
</style>
