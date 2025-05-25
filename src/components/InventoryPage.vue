<template>
  <div class="inventory-page">
    <h1>Stock Management</h1>
    <p class="subtitle">Track and manage your inventory items</p>

    <!-- Fridge and Freezer Side-by-Side -->
    <div class="section-container">
      <div class="section-box">
        <h2>Fridge</h2>
        <div v-for="item in filteredInventories('Fridge')" :key="item.id" class="inventory-card">
          <div class="info">
            <h3>{{ item.name }}</h3>
            <p>Category: {{ item.category }}</p>
            <p>Quantity: {{ item.qty }}</p>
            <p v-if="item.expirationDate">Expires: {{ item.expirationDate }}</p>
          </div>
          <div class="actions">
            <button @click="openEditModal(item)">Edit</button>
            <button @click="deleteItem(item.id)">Delete</button>
          </div>
        </div>
      </div>
      <div class="section-box">
        <h2>Freezer</h2>
        <div v-for="item in filteredInventories('Freezer')" :key="item.id" class="inventory-card">
          <div class="info">
            <h3>{{ item.name }}</h3>
            <p>Category: {{ item.category }}</p>
            <p>Quantity: {{ item.qty }}</p>
            <p v-if="item.expirationDate">Expires: {{ item.expirationDate }}</p>
          </div>
          <div class="actions">
            <button @click="openEditModal(item)">Edit</button>
            <button @click="deleteItem(item.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="edit-modal">
      <div class="modal-content">
        <h3>Edit Item</h3>
        <input v-model="editItem.name" placeholder="Name" />
        <input v-model="editItem.category" placeholder="Category" />
        <input v-model="editItem.section" placeholder="Section" />
        <input v-model="editItem.qty" placeholder="Quantity" />
        <input v-model="editItem.expirationDate" type="date" />
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
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '@/api/inventory.js'

export default {
  name: 'InventoryPage',
  data() {
    return {
      inventories: [],
      showEditModal: false,
      editItem: {}
    }
  },
  methods: {
    filteredInventories(section) {
      return this.inventories.filter(item => item.section === section)
    },
    async fetchInventories() {
      try {
        const res = await getInventoryItems(1) // mock user ID 1
        this.inventories = res.data
      } catch (err) {
        console.error('Inventory fetch failed:', err)
      }
    },
    async deleteItem(id) {
      try {
        await deleteInventoryItem(id)
        this.inventories = this.inventories.filter(item => item.id !== id)
      } catch (err) {
        console.error('Item deletion failed:', err)
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
        const index = this.inventories.findIndex(i => i.id === this.editItem.id)
        if (index !== -1) this.inventories.splice(index, 1, res.data)
        this.closeEditModal()
      } catch (err) {
        console.error('Item update failed:', err)
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
}
.section-box {
  flex: 1;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
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
