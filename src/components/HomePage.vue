<template>
  <div class="dashboard">
    <main>
      <!-- 인벤토리 선택 -->
      <div class="inventory-select">
        <label for="inventory">Select Inventory:</label>
        <select id="inventory" v-model="selectedInventoryId" @change="fetchData">
          <option disabled value="">-- 선택 --</option>
          <option v-for="inv in inventories" :value="inv.inventoryId" :key="inv.inventoryId">
            {{ inv.inventoryName }}
          </option>
        </select>
      </div>

      <!-- 현재 선택된 인벤토리 이름 표시 -->
      <div class="inventory-header">
        <h2>{{ currentInventoryName }}</h2>
      </div>

      <!-- 카드 영역 -->
      <section class="cards">
        <div class="card expiring">
          <h3>Items Expiring Soon</h3>
          <span class="badge red">{{ expiringItems.length }} Items</span>
          <ul>
            <li v-for="item in expiringItems" :key="item.id || item.item_name">
              {{ item.item_name }} – {{ item.expiration_date }}
            </li>
          </ul>
        </div>

        <div class="card low-stock">
          <h3>Low Stock Items</h3>
          <span class="badge black">{{ lowStockItems.length }} Items</span>
          <ul>
            <li v-for="item in lowStockItems" :key="item.id || item.item_name">
              {{ item.item_name }} – {{ item.quantity }} left
            </li>
          </ul>
        </div>

        <div class="card suggestions">
          <h3>Recipe Suggestions</h3>
          <ul>
            <li v-for="rec in recipeSuggestions" :key="rec.id || rec.name">
              {{ rec.name }} <small>({{ rec.matchPercent }}% match)</small>
            </li>
          </ul>
        </div>

        <div class="card actions">
          <h3>Quick Actions</h3>
          <button class="action-btn primary" @click="showAddForm = true">Add Item</button>
          <button class="action-btn" @click="$router.push('/receipt')">Scan Receipt</button>
          <button class="action-btn" @click="$router.push('/recipes')">Find Recipes</button>
          <button class="action-btn" @click="showManageItems = !showManageItems">
            {{ showManageItems ? 'Hide Management' : 'Edit Items' }}
          </button>

          <!-- 아이템 추가 폼 -->
          <div v-if="showAddForm" class="add-item-form">
            <label>
              Storage:
              <select v-model="newItem.storage_type">
                <option disabled value="">-- 선택 --</option>
                <option value="fridge">Fridge</option>
                <option value="freezer">Freezer</option>
              </select>
            </label>
            <label>
              Name:
              <input v-model="newItem.item_name" placeholder="Item name" />
            </label>
            <label>
              Quantity:
              <input v-model.number="newItem.quantity" type="number" min="1" />
            </label>
            <label>
              Expiration Date:
              <input v-model="newItem.expiration_date" type="date" />
            </label>
            <div class="form-actions">
              <button @click="addItem">Submit</button>
              <button @click="cancelAdd">Cancel</button>
            </div>
          </div>

          <!-- 아이템 관리 목록 -->
          <div v-if="showManageItems" class="manage-items">
            <ul>
              <li v-for="item in allItems" :key="item.id" class="manage-item">
                <span>{{ item.item_name }} ({{ item.quantity }}) - {{ item.expiration_date }}</span>
                <button @click="openEditModal(item)">Edit</button>
                <button @click="deleteItem(item.id)">Delete</button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 개요, 활동 영역 -->
      <section class="overview">
        <div class="inventory-overview">
          <h3>Inventory Overview</h3>
          <div class="donut-container">
            <div class="donut-box">
              <h4>Fridge</h4>
              <Doughnut :data="fridgeChartData" :options="chartOptions" />
            </div>
            <div class="donut-box">
              <h4>Freezer</h4>
              <Doughnut :data="freezerChartData" :options="chartOptions" />
            </div>
          </div>
        </div>

        <div class="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            <li v-for="(log, idx) in activity.recentLogs" :key="log.id || idx">
              <span v-if="log.type === 'add'">➕</span>
              <span v-else-if="log.type === 'remove'">➖</span>
              {{ log.message }} <small>– {{ timeAgo(log.timestamp) }}</small>
            </li>
          </ul>
        </div>
      </section>

      <!-- 아이템 수정 모달 -->
      <div v-if="showEditModal" class="edit-modal">
        <div class="modal-content">
          <h3>Edit Item</h3>
          <label>
            Name:
            <input v-model="editItem.item_name" placeholder="Name" />
          </label>
          <label>
            Quantity:
            <input v-model.number="editItem.quantity" type="number" placeholder="Quantity" />
          </label>
          <label>
            Expiration Date:
            <input v-model="editItem.expiration_date" type="date" placeholder="Expiration Date" />
          </label>
          <label>
            Storage:
            <select v-model="editItem.storage_type">
              <option value="fridge">Fridge</option>
              <option value="freezer">Freezer</option>
            </select>
          </label>
          <div class="modal-actions">
            <button @click="updateItem">Save</button>
            <button @click="closeEditModal">Cancel</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
import { useActivityStore } from '@/stores/activity'
import {
  getInventoryList,
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
//  deleteInventoryItem,
} from '@/api/inventory'
import { getRecommendedRecipes } from '@/api/recipe'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

export default {
  name: 'HomePage',
  components: { Doughnut },
  setup() {
    const activity = useActivityStore()
    return { activity }
  },
  data() {
    return {
      inventories: [],
      selectedInventoryId: this.$route.query.id || '',
      allItems: [],
      recipeSuggestions: [],
      showAddForm: false,
      showManageItems: false,
      showEditModal: false,
      newItem: { storage_type: '', item_name: '', quantity: 1, expiration_date: '' },
      editItem: {},
    }
  },
  computed: {
    currentInventoryName() {
      const inv = this.inventories.find((i) => i.inventory_id === this.selectedInventoryId)
  return inv ? inv.inventoryName : 'Loading...'
    },
    fridgeItems() {
      return this.allItems.filter((item) => item.storage_type === 'fridge')
    },
    freezerItems() {
      return this.allItems.filter((item) => item.storage_type === 'freezer')
    },
    lowStockItems() {
      return this.allItems.filter((item) => Number(item.quantity) <= 3)
    },
    expiringItems() {
      const today = new Date()
      return this.allItems
        .filter((item) => item.expiration_date)
        .map((item) => {
          const diff = (new Date(item.expiration_date) - today) / (1000 * 60 * 60 * 24)
          return diff <= 5 && diff >= 0 ? item : null
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
    },
    fridgeChartData() {
      const map = {}
      this.fridgeItems.forEach((item) => {
        map[item.item_name] = (map[item.item_name] || 0) + 1
      })
      return { labels: Object.keys(map), datasets: [{ data: Object.values(map), borderWidth: 1 }] }
    },
    freezerChartData() {
      const map = {}
      this.freezerItems.forEach((item) => {
        map[item.item_name] = (map[item.item_name] || 0) + 1
      })
      return { labels: Object.keys(map), datasets: [{ data: Object.values(map), borderWidth: 1 }] }
    },
    chartOptions() {
      return { responsive: true, plugins: { legend: { position: 'bottom' } } }
    },
  },
  methods: {
    timeAgo(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000)
      if (seconds < 60) return 'Just now'
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes} minutes ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} hours ago`
      return `${Math.floor(hours / 24)} days ago`
    },
    async fetchInventories() {
      try {
        const res = await getInventoryList()
        this.inventories = res.data
        this.selectedInventoryId =
          this.$route.query.id || (this.inventories[0] && this.inventories[0].inventory_id)
        await this.fetchData()
      } catch (err) {
        console.error('Inventory list fetch error:', err)
      }
    },
    async fetchData() {
      if (!this.selectedInventoryId) return
      try {
        const res = await getInventoryItems(this.selectedInventoryId)
        this.allItems = res.data
        const recipeRes = await getRecommendedRecipes(this.selectedInventoryId)
        this.recipeSuggestions = recipeRes.data
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      }
    },
    cancelAdd() {
      this.showAddForm = false
      this.newItem = { storage_type: '', item_name: '', quantity: 1, expiration_date: '' }
    },
    async addItem() {
      if (!this.selectedInventoryId || !this.newItem.storage_type || !this.newItem.item_name) return
      try {
        const res = await addInventoryItem({
          inventory_id: this.selectedInventoryId,
          ...this.newItem,
        })
        this.allItems.push(res.data)
        this.cancelAdd()
      } catch (err) {
        console.error('Add item failed:', err)
      }
    },
    async deleteItem(id) {
      try {
        await deleteInventoryItem(id)
        this.allItems = this.allItems.filter((i) => i.id !== id)
      } catch (err) {
        console.error('Delete item failed:', err)
      }
    },
    openEditModal(item) {
      this.editItem = { ...item }
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.editItem = {}
    },
    async updateItem() {
      try {
        const res = await updateInventoryItem(this.editItem.id, this.editItem)
        const idx = this.allItems.findIndex((i) => i.id === this.editItem.id)
        if (idx >= 0) this.allItems.splice(idx, 1, res.data)
        this.closeEditModal()
      } catch (err) {
        console.error('Update item failed:', err)
      }
    },
  },
  mounted() {
    this.fetchInventories()
  },
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}
.inventory-select {
  margin-bottom: 1rem;
}
.inventory-header {
  margin-bottom: 2rem;
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.card {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  min-height: 250px;
}
.card h3 {
  margin-top: 0;
}
.card.actions {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.action-btn {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  color: #333;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn.primary {
  background-color: #000;
  color: white;
  font-weight: 600;
  border: none;
}
.manage-items ul {
  list-style: none;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}
.manage-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 300px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
