<template>
  <div class="inventory-page">
    <h1>Inventory Management</h1>
    <p class="subtitle">Manage your inventories and items</p>

    <div>
      <input v-model="newInventoryName" placeholder="New Inventory Name" />
      <button @click="createInventory">Add Inventory</button>
    </div>

    <div class="section-container">
      <div v-for="inventory in inventories" :key="inventory.id" class="section-box">
        <h2>
          <input v-model="inventory.name" @blur="renameInventory(inventory)" />
          <button @click="deleteInventoryById(inventory.id)">Delete</button>
        </h2>

        <h3>Fridge</h3>
        <div v-for="item in inventory.items.filter(i => i.storage_type === 'fridge')" :key="item.id" class="inventory-card">
          <div class="info">
            <p>{{ item.item_name }}</p>
            <p>Qty: {{ item.quantity }}</p>
            <p>Expiry: {{ item.expiration_date }}</p>
          </div>
          <div class="actions">
            <button @click="openEditModal(item)">Edit</button>
            <button @click="deleteItem(item.id, inventory.id)">Delete</button>
          </div>
        </div>

        <h3>Freezer</h3>
        <div v-for="item in inventory.items.filter(i => i.storage_type === 'freezer')" :key="item.id" class="inventory-card">
          <div class="info">
            <p>{{ item.item_name }}</p>
            <p>Qty: {{ item.quantity }}</p>
            <p>Expiry: {{ item.expiration_date }}</p>
          </div>
          <div class="actions">
            <button @click="openEditModal(item)">Edit</button>
            <button @click="deleteItem(item.id, inventory.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="edit-modal">
      <div class="modal-content">
        <h3>Edit Item</h3>
        <input v-model="editItem.item_name" placeholder="Name" />
        <input v-model="editItem.quantity" placeholder="Quantity" />
        <input v-model="editItem.expiration_date" type="date" placeholder="Expiration Date" />
        <select v-model="editItem.storage_type">
          <option value="fridge">Fridge</option>
          <option value="freezer">Freezer</option>
        </select>
        <div class="modal-actions">
          <button @click="updateItem">Save</button>
          <button @click="closeEditModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getInventoryList,
  getInventoryItems,
  postInventory,
  updateInventory,
  deleteInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '@/api/inventory.js'

export default {
  name: 'InventoryPage',
  data() {
    return {
      inventories: [],
      newInventoryName: '',
      showEditModal: false,
      editItem: {},
      currentInventoryId: null
    }
  },
  methods: {
    async fetchInventories() {
      try {
        const res = await getInventoryList()
        const allInventories = res.data

        const inventoriesWithItems = await Promise.all(
          allInventories.map(async (inv) => {
            const itemRes = await getInventoryItems(inv.id)
            return { ...inv, items: itemRes.data }
          })
        )
        this.inventories = inventoriesWithItems
      } catch (err) {
        console.error('Fetch failed:', err)
      }
    },
    async createInventory() {
      if (!this.newInventoryName) return
      try {
        const res = await postInventory({ name: this.newInventoryName })
        this.inventories.push({ ...res.data, items: [] })
        this.newInventoryName = ''
      } catch (err) {
        console.error('Create inventory failed:', err)
      }
    },
    async renameInventory(inventory) {
      try {
        await updateInventory(inventory.id, { name: inventory.name })
      } catch (err) {
        console.error('Rename failed:', err)
      }
    },
    async deleteInventoryById(id) {
      try {
        await deleteInventory(id)
        this.inventories = this.inventories.filter(inv => inv.id !== id)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    },
    openEditModal(item) {
      this.editItem = { ...item }
      this.currentInventoryId = this.inventories.find(inv => inv.items.some(i => i.id === item.id)).id
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.editItem = {}
    },
    async updateItem() {
      try {
        const res = await updateInventoryItem(this.editItem.id, this.editItem)
        const inventory = this.inventories.find(inv => inv.id === this.currentInventoryId)
        const index = inventory.items.findIndex(i => i.id === this.editItem.id)
        inventory.items.splice(index, 1, res.data)
        this.closeEditModal()
      } catch (err) {
        console.error('Item update failed:', err)
      }
    },
    async deleteItem(itemId, inventoryId) {
      try {
        await deleteInventoryItem(itemId)
        const inventory = this.inventories.find(inv => inv.id === inventoryId)
        inventory.items = inventory.items.filter(i => i.id !== itemId)
      } catch (err) {
        console.error('Delete item failed:', err)
      }
    }
  },
  mounted() {
    this.fetchInventories()
  }
}
</script>

<style scoped>
.inventory-page {
  padding: 2rem;
  font-family: Arial, sans-serif;
}
.subtitle {
  color: #666;
  margin-bottom: 1rem;
}
.section-container {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  flex-wrap: wrap;
}
.section-box {
  flex: 1;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  min-width: 300px;
}
.inventory-card {
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info p {
  margin: 0.3rem 0;
}
.actions button {
  margin-left: 0.3rem;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.actions button:nth-child(2) {
  background: #d9534f;
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
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.modal-content input {
  padding: 0.5rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
