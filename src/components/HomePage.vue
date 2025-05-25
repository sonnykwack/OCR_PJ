<template>
  <div class="dashboard">
    <main>
      <!--카드 영역 -->
      <section class="cards">
        <div class="card expiring">
          <h3>Items Expiring Soon</h3>
          <span class="badge red">{{ expiringItems.length }} Items</span>
          <ul>
            <li v-for="item in expiringItems" :key="item.name">
              {{ item.name }} – {{ item.expirationDate }}
            </li>
          </ul>
        </div>

        <div class="card low-stock">
          <h3>Low Stock Items</h3>
          <span class="badge black">{{ lowStockItems.length }} Items</span>
          <ul>
            <li v-for="item in lowStockItems" :key="item.name">
              {{ item.name }} – {{ item.qty }} left
            </li>
          </ul>
        </div>

        <div class="card suggestions">
          <h3>Recipe Suggestions</h3>
          <ul>
            <li v-for="rec in recipeSuggestions" :key="rec.name">
              {{ rec.name }} <small>({{ rec.matchPercent }}% match)</small>
            </li>
          </ul>
        </div>

        <div class="card actions">
          <h3>Quick Actions</h3>
          <button class="action-btn primary" @click="showAddForm = true">Add New Item</button>
          <button class="action-btn" @click="$router.push('/receipt')">Scan Receipt</button>
          <button class="action-btn" @click="$router.push('/recipes')">Find Recipes</button>

          <div v-if="showAddForm" class="add-item-form">
            <label>
              Storage:
              <select v-model="newItem.section">
                <option disabled value="">-- 선택 --</option>
                <option value="fridge">Refrigerated</option>
                <option value="freezer">Frozen</option>
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
              Expiration Date:
              <input v-model="newItem.expirationDate" type="date" />
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
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
import { useActivityStore } from '@/stores/activity'
import { getInventoryItems, addInventoryItem } from '@/api/inventory'
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
      allItems: [],
      recipeSuggestions: [],
      showAddForm: false,
      newItem: {
        section: '',
        category: '',
        name: '',
        capacity: '',
        qty: 1,
        expirationDate: '',
      },
    }
  },
  computed: {
    fridgeItems() {
      return this.allItems.filter(item => item.storage_type === 'fridge')
    },
    freezerItems() {
      return this.allItems.filter(item => item.storage_type === 'freezer')
    },
    lowStockItems() {
      return this.allItems.filter(item => parseFloat(item.quantity) <= 3)
    },
    expiringItems() {
      const today = new Date()
      return this.allItems
        .map(item => {
          if (!item.expiration_date) return null
          const diff = (new Date(item.expiration_date) - today) / (1000 * 60 * 60 * 24)
          return diff <= 5 && diff >= 0
            ? { name: item.item_name, expirationDate: item.expiration_date }
            : null
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
    },
    fridgeChartData() {
      const categoryMap = {}
      this.fridgeItems.forEach(item => {
        categoryMap[item.item_name] = (categoryMap[item.item_name] || 0) + 1
      })
      return {
        labels: Object.keys(categoryMap),
        datasets: [
          {
            label: 'Fridge Items',
            data: Object.values(categoryMap),
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
            borderWidth: 1,
          },
        ],
      }
    },
    freezerChartData() {
      const categoryMap = {}
      this.freezerItems.forEach(item => {
        categoryMap[item.item_name] = (categoryMap[item.item_name] || 0) + 1
      })
      return {
        labels: Object.keys(categoryMap),
        datasets: [
          {
            label: 'Freezer Items',
            data: Object.values(categoryMap),
            backgroundColor: ['#4DD0E1', '#FFB74D', '#AED581', '#BA68C8'],
            borderWidth: 1,
          },
        ],
      }
    },
    chartOptions() {
      return {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      }
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
    async fetchData() {
      try {
        const res = await getInventoryItems(1)
        this.allItems = res.data
        const recipeRes = await getRecipeSuggestions()
        this.recipeSuggestions = recipeRes.data
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      }
    },
    async addItem() {
      const { section, name, qty, expirationDate } = this.newItem
      if (!section || !name || !qty || !expirationDate) {
        alert('Please fill all required fields')
        return
      }
      try {
        const res = await addInventoryItem({
          inventory_id: 1,
          item_name: name,
          quantity: qty,
          storage_type: section,
          expiration_date: expirationDate,
        })
        this.allItems.push(res.data)
        this.showAddForm = false
        this.newItem = { section: '', category: '', name: '', capacity: '', qty: 1, expirationDate: '' }
      } catch (err) {
        console.error('Add item failed:', err)
      }
    },
  },
  mounted() {
    this.fetchData()
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
.donut-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1rem 0;
}
.donut-box {
  flex: 1 1 200px;
  max-width: 300px;
  text-align: center;
}
.inventory-overview {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

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
