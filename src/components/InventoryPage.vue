<template>
  <div class="inventory-page">
    <h1>Inventory Management</h1>
    <p class="subtitle">Select an inventory to view its dashboard</p>

    <div class="add-inventory-container">
      <input v-model="newInventoryName" placeholder="New Inventory Name" class="inventory-input" />
      <button @click="createInventory" class="add-inventory-btn">+ Add Inventory</button>
    </div>

    <div class="inventory-grid" v-if="inventories.length">
      <div
        v-for="inv in inventories"
        :key="inv.inventory_id"
        class="inventory-card-box"
        @click="goToInventory(inv.inventory_id)"
      >
        <!-- Backend returns inventory_name -->
        <h2 class="inventory-card-title">
          {{ inv.inventory_name || inv.name || '(No Name)' }}
        </h2>
        <p class="inventory-count">{{ inv.itemCount }} items</p>
      </div>
    </div>
    <p v-else class="no-inventories">아직 생성된 인벤토리가 없습니다.</p>
  </div>
</template>

<script>
import { getInventoryList, getInventoryItems, postInventory } from '@/api/inventory'

export default {
  name: 'InventoryPage',
  data() {
    return {
      inventories: [],
      newInventoryName: '',
    }
  },
  methods: {
    async fetchInventories() {
      try {
        // 1) fetch all inventories
        const { data: list } = await getInventoryList()
        console.log('Raw inventories:', list)

        // 2) for each, fetch items count
        this.inventories = await Promise.all(
          list.map(async (inv) => {
            let itemCount = 0
            try {
              const { data: items } = await getInventoryItems(inv.inventory_id)
              itemCount = Array.isArray(items) ? items.length : 0
            } catch (e) {
              console.error(`Items fetch failed for ${inv.inventory_id}:`, e)
            }
            // ensure correct field mapping
            return {
              inventory_id: inv.inventory_id,
              inventory_name: inv.inventory_name,
              itemCount,
            }
          }),
        )
      } catch (err) {
        console.error('Fetch inventories failed:', err)
      }
    },

    async createInventory() {
      const name = this.newInventoryName.trim()
      if (!name) return
      try {
        await postInventory({ inventory_name: name })
        this.newInventoryName = ''
        await this.fetchInventories()
      } catch (err) {
        console.error('Create inventory failed:', err)
        alert('인벤토리 생성에 실패했습니다.')
      }
    },

    goToInventory(id) {
      this.$router.push({ path: `/inventory/${id}` })
    },
  },
  mounted() {
    this.fetchInventories()
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
.add-inventory-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.inventory-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-inventory-btn {
  background: #000;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.add-inventory-btn:hover {
  background: #333;
}
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}
.inventory-card-box {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}
.inventory-card-box:hover {
  transform: translateY(-5px);
}
.inventory-card-title {
  margin: 0;
  font-size: 1.25rem;
}
.inventory-count {
  color: #555;
  margin-top: 0.5rem;
}
.no-inventories {
  text-align: center;
  color: #999;
  margin-top: 2rem;
}
</style>
