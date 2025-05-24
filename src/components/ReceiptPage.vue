<template>
  <div class="receipt-page">
    <h1 class="title">Receipt OCR</h1>
    <p class="subtitle">Scan and process your receipts automatically</p>

    <div class="upload-area">
      <div class="upload-box">
        <h3>Upload Receipt</h3>
        <div class="drop-zone">Drag and drop your receipt here</div>
        <p>or</p>
        <button>Browse Files</button>
        <p class="hint">Supports JPG, PNG, PDF up to 10MB</p>
      </div>

      <div class="upload-box">
        <h3>Take Photo</h3>
        <div class="camera-zone">Use your device camera</div>
        <button>Open Camera</button>
        <p class="hint">Make sure the receipt is well-lit and clear</p>
      </div>
    </div>

    <div class="recent">
      <h3>Recent Scans</h3>
      <ul class="scan-list">
        <li>
          <strong>Grocery Receipt</strong><br />
          <small>Scanned 2 hours ago</small>
          <a href="#">View Details</a>
        </li>
        <li>
          <strong>Supermarket Receipt</strong><br />
          <small>Scanned 1 day ago</small>
          <a href="#">View Details</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReceiptPage',
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
.drop-zone,
.camera-zone {
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
