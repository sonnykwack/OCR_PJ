<template>
  <div class="inventory-page">
    <h1>Stock Management</h1>
    <p class="subtitle">Track and manage your inventory items</p>

    <!-- 카테고리별 영역 -->
    <section class="storage-sections">
      <div v-for="section in storageSections" :key="section.name" class="storage-section">
        <h2>{{ section.name }}</h2>
        <div class="categories">
          <div v-for="cat in section.categories" :key="cat.name" class="category-card">
            <h3>{{ cat.name }}</h3>
            <span class="badge">{{ cat.count }} items</span>
            <ul>
              <li v-for="item in cat.items" :key="item.name">
                {{ item.name }} – {{ item.qty }}
                <span v-if="item.expiry"> (Expires: {{ item.expiry }})</span>
              </li>
            </ul>
            <button class="manage-btn" @click="openManage(section, cat)">Manage Category</button>
          </div>
        </div>
      </div>
    </section>
    <div v-if="showManage" class="manage-modal">
      <div class="modal-content">
        <h3>Edit {{ currentCategory.name }} in {{ currentSection.name }}</h3>

        <!-- 기존 아이템들 편집/삭제 -->
        <ul class="manage-list">
          <li v-for="(item, idx) in manageItems" :key="item.name + '-' + idx">
            <input v-model="item.name" placeholder="Name" />
            <input v-model="item.qty" placeholder="Qty (e.g. 2L)" />
            <input v-model.number="item.expiryDays" placeholder="Days Left" />
            <span v-if="item.expiryDays">({{ formatExpiry(item.expiryDays) }})</span>
            <button @click="removeItem(idx)">Delete</button>
          </li>
        </ul>

        <!-- 새 아이템 추가 -->
        <div class="add-sub-item">
          <input v-model="newSubItem.name" placeholder="New item name" />
          <input v-model="newSubItem.qty" placeholder="New item qty" />
          <input v-model="newSubItem.daysLeft" type="number" placeholder="Days until expiry" />
          <button @click="addSubItem()">Add</button>
        </div>

        <!-- 저장/취소 -->
        <div class="modal-actions">
          <button @click="saveManage()">Save</button>
          <button @click="closeManage()">Cancel</button>
          <button class="danger" @click="removeCategory()">Delete Category</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storageSections } from '@/assets/state.js'
import { useActivityStore } from '@/stores/activity'

export default {
  name: 'InventoryPage',
  data() {
    return {
      storageSections,
      activity: useActivityStore(),

      categoryOptions: ['All', 'Dairy', 'Vegetables', 'Meat', 'Pantry', 'Ice Cream', 'Peas'],
      stockStatusOptions: ['All', 'Low Stock', 'In Stock'],
      expiryStatusOptions: ['All', 'Expiring Soon', 'Expired', 'Fresh'],
      sortByOptions: ['None', 'Expiry Date', 'Quantity'],
      showManage: false,
      currentSection: null,
      currentCategory: null,
      manageItems: [],
      newSubItem: { name: '', qty: '', section: '', daysLeft: '' },
    }
  },
  methods: {
    openManage(section, category) {
      this.currentSection = section
      this.currentCategory = category
      // 원본 아이템 배열 복사
      this.manageItems = category.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        expiry: i.expiry,
        expiryDays: null,
      }))
      this.newSubItem = { name: '', qty: '', daysLeft: '' }
      this.showManage = true
    },

    // 저장
    saveManage() {
      // 1) 원본 섹션/카테고리
      const sec = this.storageSections.find((s) => s.name === this.currentSection.name)
      const cat = sec && sec.categories.find((c) => c.name === this.currentCategory.name)
      if (!sec || !cat) return alert('섹션/카테고리를 찾을 수 없습니다.')

      // 2) 원본으로 덮어쓰기
      cat.items = this.manageItems.map((item) => {
        let expiry = item.expiry
        if (item.expiryDays != null && !isNaN(item.expiryDays)) {
          const d = new Date()
          d.setDate(d.getDate() + parseInt(item.expiryDays))
          expiry = d.toISOString().split('T')[0]
        }
        return { name: item.name, qty: item.qty, expiry }
      })

      // 3) 개수 갱신
      cat.count = cat.items.length

      // 4) modal 닫기
      this.closeManage()
    },

    // 취소
    closeManage() {
      this.showManage = false
      this.currentSection = null
      this.currentCategory = null
      this.manageItems = []
      this.newSubItem = { name: '', qty: '', daysLeft: '' }
    },

    // 삭제
    removeItem(index) {
      const removedItem = this.manageItems[index]
      this.manageItems.splice(index, 1)

      if (removedItem) {
        this.activity.recentLogs.unshift({
          type: 'remove',
          message: `Removed ${removedItem.qty} ${removedItem.name}`,
          timestamp: new Date(),
        })
      }
    },
    removeCategory() {
      if (!confirm(`정말 "${this.currentCategory.name}" 카테고리를 삭제할까요?`)) return
      const sec = this.storageSections.find((s) => s.name === this.currentSection.name)
      sec.categories = sec.categories.filter((c) => c.name !== this.currentCategory.name)
      this.closeManage()
    },

    // 아이템 추가
    addSubItem() {
      const { name, qty, daysLeft } = this.newSubItem
      if (!name || !qty) return alert('이름, 수량 항목을 입력하세요.')

      const targetSection = this.storageSections.find((s) => s.name === this.currentSection.name)
      if (!targetSection) return alert('해당 섹션을 찾을 수 없습니다.')

      let targetCategory = targetSection.categories.find(
        (c) => c.name === this.currentCategory.name,
      )
      if (!targetCategory) {
        targetCategory = {
          name: this.currentCategory.name,
          items: [],
          count: 0,
        }
        targetSection.categories.push(targetCategory)
      }

      let expiry = ''
      if (daysLeft && !isNaN(daysLeft)) {
        const today = new Date()
        today.setDate(today.getDate() + parseInt(daysLeft))
        expiry = today.toISOString().split('T')[0]
      }

      this.activity.recentLogs.unshift({
        type: 'add',
        message: `Added ${qty} ${name}`,
        timestamp: new Date(),
      })

      this.manageItems.push({ name, qty, expiry })

      this.newSubItem = { name: '', qty: '', section: '', daysLeft: '' }
    },

    formatExpiry(days) {
      if (!days || isNaN(days)) return ''
      const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      return date.toISOString().split('T')[0]
    },
  },
}
</script>

<style scoped>
.inventory-page {
  padding: 2rem;
  font-family: Arial, sans-serif;
}
.subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}
.storage-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}
.storage-section h2 {
  margin-bottom: 0.5rem;
}
.categories {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.category-card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  flex: 1 1 200px;
}
.category-card h3 {
  margin: 0 0 0.5rem;
}
.badge {
  float: right;
  background: #eee;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
.category-card ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}
.manage-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.manage-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}
.manage-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
}
.manage-list li {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.manage-list li input {
  flex: 1;
  padding: 0.3rem;
}
.add-sub-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.add-sub-item input {
  flex: 1;
  padding: 0.3rem;
}
.modal-actions {
  text-align: right;
}
.modal-actions button {
  margin-left: 0.5rem;
}
.danger {
  background: #d9534f;
  color: white;
  border: none;
}
.danger:hover {
  background: #c9302c;
}
</style>
