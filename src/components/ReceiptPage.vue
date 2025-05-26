<template>
  <div class="receipt-page">
    <h1 class="title">Receipt OCR</h1>
    <p class="subtitle">Scan and process your receipts automatically</p>

    <div class="upload-area">
      <div class="upload-box">
        <h3>Upload Receipt</h3>
        <div class="drop-zone" @dragover.prevent @drop.prevent="handleDrop">
          Drag and drop your receipt here
        </div>
        <p>or</p>
        <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" hidden />
        <button @click="$refs.fileInput.click()">Browse Files</button>
        <p class="hint">Supports JPG, PNG, PDF up to 10MB</p>
      </div>

      <div class="guide-box">
        <h3>Receipt Scanner User Guide</h3>
        <img src="@/assets/KakaoTalk_20250525_115209143.png" alt="Example Receipt" class="guide-image" />
        <p class="guide-text">
          For better performance of the Receipt Scanner, please upload a photo file of your receipt with the
          <strong>Item Name</strong> and <strong>Quantity</strong> only.<br />
          For your information, follow the provided photo example.
        </p>
      </div>
    </div>

    <div class="recent">
      <h3>Recent Scans</h3>
      <ul class="scan-list">
        <li v-if="uploadResult">
          <strong>New Upload - ID: {{ uploadResult.receipt_id }}</strong><br />
          <small>Uploaded at {{ uploadResult.upload_time }}</small>
          <a href="#" @click.prevent="fetchParsedItems(uploadResult.receipt_id)">View Details</a>
        </li>
        <li>
          <strong>Grocery Receipt</strong><br />
          <small>Scanned 2 hours ago</small>
          <a href="#">View Details</a>
        </li>
      </ul>

      <div v-if="parsedItems.length" class="parsed-results">
        <h4>Parsed Items</h4>
        <ul>
          <li v-for="(item, idx) in parsedItems" :key="idx">
            {{ item.name }} – {{ item.quantity }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadReceipt, getParsedItemsByReceiptId } from '@/api/receipts'

export default {
  name: 'ReceiptPage',
  data() {
    return {
      receiptImage: null,
      uploadResult: null,
      parsedItems: [],
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) this.upload(file)
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) this.upload(file)
    },
    async upload(file) {
      const formData = new FormData()
      formData.append('image', file)

      try {
        const res = await uploadReceipt(formData)
        this.uploadResult = res.data
        alert(`Uploaded! receiptId: ${res.data.receiptId}`)
      } catch (err) {
        console.error('Upload failed:', err)
        alert('Failed to upload receipt.')
      }
    },
    async fetchParsedItems(receiptId) {
      try {
        const res = await getParsedItemsByReceiptId(receiptId)
        this.parsedItems = res.data
      } catch (err) {
        console.error('Failed to fetch parsed items:', err)
        alert('Error fetching parsed items.')
      }
    },
  },
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
  height: 100px;
  border: 1px dashed #aaa;
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
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
.parsed-results {
  background: #fff;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}
</style>
