<template>
  <div class="dashboard">
    <main>
      <!--카드 영역 -->
      <section class="cards">
        <div class="card expiring">
          <h3>Items Expiring Soon</h3>
          <span class="badge red">{{ expiringItemsSorted.length }} Items</span>
          <ul>
            <li v-for="item in expiringItemsSorted" :key="item.name">
              {{ item.name }} – {{ item.daysLeft }} days
            </li>
          </ul>
        </div>

        <div class="card low-stock">
          <h3>Low Stock Items</h3>
          <span class="badge black">{{ filteredLowStockItems.length }} Items</span>
          <ul>
            <li v-for="item in filteredLowStockItems" :key="item.name">
              {{ item.name }} – {{ item.qtyLeft }} left
            </li>
          </ul>
        </div>

        <div class="card suggestions">
          <h3>Recipe Suggestions</h3>
          <ul>
            <li v-for="rec in recipeSuggestions" :key="rec.name">
              {{ rec.name }} <small>({{ rec.matchPercent }}% ingredients)</small>
            </li>
          </ul>
        </div>

        <div class="card actions">
          <h3>Quick Actions</h3>
          <button class="action-btn primary" @click="openAddForm">Add New Item</button>
          <button class="action-btn" @click="goToShoppingList">Generate Shopping List</button>
          <button class="action-btn" @click="goToRecipes">Find Recipes</button>

          <div v-if="showAddForm" class="add-item-form">
            <label>
              Storage:
              <select v-model="newItem.section">
                <option disabled value="">-- 선택 --</option>
                <option value="Refrigerated">Refrigerated</option>
                <option value="Frozen">Frozen</option>
              </select>
            </label>

            <label>
              Category:
              <input v-model="newItem.category" placeholder="Category (ex. Dairy)" />
            </label>

            <label>
              Name:
              <input v-model="newItem.name" placeholder="Item name" />
            </label>

            <label>
              Capacity:
              <input v-model="newItem.capacity" placeholder="e.g. 500g, 2L" />
            </label>

            <label>
              Quantity:
              <input v-model.number="newItem.qty" type="number" min="1" />
            </label>

            <label>
              Days Left:
              <input v-model.number="newItem.daysLeft" type="number" min="0" />
            </label>

            <div class="form-actions">
              <button @click="addItem">Submit</button>
              <button @click="showAddForm = false">Cancel</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 개요, 활동 영역 -->
      <section class="overview">
        <div class="inventory-overview">
          <h3>Inventory Overview</h3>
          <div class="chart">Graph Placeholder</div>
        </div>

        <div class="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            <li v-for="(log, idx) in activity.recentLogs" :key="log.id || idx">
              <span v-if="log.type === 'add'">➕</span>
              <span v-else-if="log.type === 'remove'">➖</span>
              {{ log.message }}
              <small>– {{ timeAgo(log.timestamp) }}</small>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { storageSections } from '@/assets/state.js'
import { useActivityStore } from '@/stores/activity'

export default {
  name: 'HomePage',
  data() {
    return {
      showAddForm: false,

      newItem: {
        section: '',
        category: '',
        name: '',
        capacity: '',
        qty: 1,
        daysLeft: null,
      },

      recipeSuggestions: [
        { name: 'Pasta Primavera', matchPercent: 80 },
        { name: 'Greek Salad', matchPercent: 100 },
      ],
      recentActivity: [
        { id: 1, type: 'add', message: 'Added 1L Milk', time: '2 hours ago' },
        { id: 2, type: 'remove', message: 'Removed Expired Yogurt', time: '5 hours ago' },
        { id: 3, type: 'update', message: 'Updated Shopping List', time: 'Yesterday' },
      ],

      storageSections: [
        { name: 'Refrigerated', categories: [] },
        { name: 'Frozen', categories: [] },
      ],
    }
  },
  setup() {
    const activity = useActivityStore()
    return { activity }
  },

  methods: {
    openAddForm() {
      this.showAddForm = true
    },
    goToShoppingList() {
      this.$router.push('/shopping-list')
    },
    goToRecipes() {
      this.$router.push('/recipes')
    },
    timeAgo(date) {
      const now = new Date()
      const seconds = Math.floor((now - date) / 1000)

      if (seconds < 60) return 'Just now'
      const minutes = Math.floor(seconds / 60)

      if (minutes < 60) return `${minutes} minutes ago`
      const hours = Math.floor(minutes / 60)

      if (hours < 24) return `${hours} hours ago`

      return `${Math.floor(hours / 24)} days ago`
    },
    addItem() {
      const { section, category, name, capacity, qty, daysLeft } = this.newItem
      if (!section || !category || !name) {
        return alert('Section, category, and name은 필수입니다.')
      }

      let expiry = null
      if (daysLeft !== null && !isNaN(daysLeft)) {
        const today = new Date()
        const expiryDate = new Date(today.setDate(today.getDate() + daysLeft))
        expiry = expiryDate.toISOString().split('T')[0]
      }

      const sec = storageSections.find((s) => s.name === section)
      if (sec) {
        let cat = sec.categories.find((c) => c.name === category)
        if (!cat) {
          cat = { name: category, items: [], count: 0 }
          sec.categories.push(cat)
        }
        cat.items.push({ name, qty: `${capacity} x ${qty}`, expiry })
        cat.count = cat.items.length
      }

      const now = new Date()
      this.recentActivity.unshift({
        id: Date.now(),
        type: 'add',
        message: `Added ${capacity} ${name}`,
        time: this.timeAgo(now),
      })

      this.activity.recentLogs.unshift({
        id: Date.now(),
        type: 'add',
        message: `Added ${capacity} ${name}`,
        timestamp: new Date(),
      })

      this.newItem = { section: '', category: '', name: '', capacity: '', qty: 1, daysLeft: null }
      this.showAddForm = false
    },
  },
  computed: {
    expiringItemsSorted() {
      const items = []

      for (const section of storageSections) {
        for (const cat of section.categories) {
          for (const item of cat.items) {
            if (item.expiry) {
              const expiryDate = new Date(item.expiry)
              if (isNaN(expiryDate)) continue

              const today = new Date()
              const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

              if (daysLeft <= 5 && daysLeft >= 0) {
                items.push({
                  name: item.name,
                  daysLeft,
                })
              }
            }
          }
        }
      }

      return items.sort((a, b) => a.daysLeft - b.daysLeft)
    },
    filteredLowStockItems() {
      const result = []

      for (const section of storageSections) {
        for (const category of section.categories) {
          for (const item of category.items) {
            const parsedQty = parseFloat(item.qty)
            // 수량이 3 이하
            if (!isNaN(parsedQty) && parsedQty <= 3) {
              result.push({ name: item.name, qtyLeft: parsedQty })
            }
          }
        }
      }

      return result.sort((a, b) => a.qtyLeft - b.qtyLeft)
    },
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

/* 네비게이션 */
.navbar {
  display: flex;
  align-items: center;
  padding: 0 2rem;
  background: #fff;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
.logo {
  height: 40px;
}
.nav-links {
  display: flex;
  list-style: none;
  margin-left: 2rem;
  flex: 1;
}
.nav-links li {
  margin-right: 1.5rem;
  cursor: pointer;
  color: #555;
}
.nav-links li.active {
  color: #000;
  font-weight: bold;
}
.nav-actions {
  display: flex;
  align-items: center;
}
.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  margin-right: 1rem;
  cursor: pointer;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

/* 메인 콘텐츠 */
main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f5f5f5;
}

/* 카드 레이아웃 */
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

.card.actions h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
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

.action-btn:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.action-btn.primary {
  background-color: #000;
  color: white;
  font-weight: 600;
  border: none;
}

.action-btn.primary:hover {
  background-color: #222;
}
.badge {
  float: right;
  font-weight: bold;
}
.badge.red {
  color: #d9534f;
}
.badge.black {
  color: #000;
}

.card ul {
  padding: 0;
  list-style: none;
  margin: 0;
}
.card ul li {
  margin: 0.5rem 0;
}

/* 추가 폼*/
.add-item-form {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
}
.add-item-form label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}
.add-item-form input,
.add-item-form select {
  margin-top: 0.25rem;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}
.form-actions button {
  padding: 0.5rem 1rem;
  border: none;
  background: #000;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
}
.form-actions button:last-child {
  background: #777;
}

/* 개요 & 활동 */
.overview {
  display: flex;
  gap: 1.5rem;
}
.inventory-overview,
.recent-activity {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
.inventory-overview {
  flex: 3;
}
.recent-activity {
  flex: 1;
}
.chart {
  height: 250px;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
}
.recent-activity ul {
  padding: 0;
  list-style: none;
}
.recent-activity li {
  margin: 0.75rem 0;
}
.recent-activity small {
  color: #888;
  margin-left: 0.5rem;
  font-size: 0.9rem;
}
</style>
