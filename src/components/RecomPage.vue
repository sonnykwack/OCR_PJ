<template>
  <div class="inventory-page">
    <h1 class="text-2xl font-bold mb-2">AI Recipe Recommendations</h1>
    <p class="subtitle">
      You can get recommendations according to your stock right here, right now!
    </p>

    <!-- Inventory 선택 드롭다운 -->
    <label class="inventory-label">
      Select Inventory:
      <select v-model="selectedInventoryId" class="inventory-dropdown">
        <option disabled value="">-- Please choose --</option>
        <option v-for="inv in inventoryList" :key="inv.inventory_id" :value="inv.inventory_id">
          {{ inv.name }} (ID: {{ inv.inventory_id }})
        </option>
      </select>
    </label>

    <button class="manage-btn mb-4" @click="fetchRecommendedRecipes">🔍 Get Recipes!</button>

    <div v-if="loading" class="text-gray-500">Calling Recipes...</div>

    <ul class="recipe-list" v-if="!loading && recipes.length > 0">
      <li
        v-for="recipe in recipes"
        :key="recipe.recipe_id"
        class="recipe-card"
        @click="openRecipe(recipe.recipe_id)"
      >
        <div class="title">{{ recipe.title }}</div>
        <div class="created">Date: {{ formatDate(recipe.created_at) }}</div>
      </li>
    </ul>

    <div v-else-if="!loading" class="text-gray-500">No Recommendations.</div>

    <div v-if="selectedRecipe" class="manage-modal" @click.self="selectedRecipe = null">
      <div class="modal-content">
        <h2 class="text-xl font-bold mb-2">{{ selectedRecipe.title }}</h2>
        <p class="text-gray-600 mb-3 whitespace-pre-line">{{ selectedRecipe.content }}</p>
        <h3 class="font-semibold">Used Items</h3>
        <ul class="list-disc list-inside mb-3">
          <li v-for="(item, idx) in selectedRecipe.source_items" :key="idx">
            {{ item.item_name }}
          </li>
        </ul>
        <div class="modal-actions">
          <button class="manage-btn" @click="selectedRecipe = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRecommendedRecipes, getRecipeById } from '@/api/recipe'
import { getInventoryItems, getInventoryList } from '@/api/inventory'

const selectedInventoryId = ref('')
const inventoryList = ref([])
const inventoryItems = ref([])
const recipes = ref([])
const selectedRecipe = ref(null)
const loading = ref(false)

onMounted(fetchInventoryList)

async function fetchInventoryList() {
  try {
    const res = await getInventoryList(1) // userId
    inventoryList.value = res.data
  } catch (err) {
    console.error('Inventory list fetch failed:', err)
  }
}

async function fetchInventoryItems(id) {
  try {
    const res = await getInventoryItems(id)
    inventoryItems.value = res.data
  } catch (err) {
    console.error('Inventory item fetch failed:', err)
  }
}

async function fetchRecommendedRecipes() {
  if (!selectedInventoryId.value) return alert('Please select an inventory first.')
  loading.value = true
  try {
    await fetchInventoryItems(selectedInventoryId.value)
    const payload = {
      inventory_id: selectedInventoryId.value,
      items: inventoryItems.value.map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
      })),
    }
    const res = await getRecipesByInventory(payload)
    recipes.value = res.data
  } catch (e) {
    console.error('추천 레시피 불러오기 실패:', e)
  } finally {
    loading.value = false
  }
}

async function openRecipe(recipeId) {
  try {
    const res = await getRecipeById(recipeId)
    selectedRecipe.value = res.data
  } catch (e) {
    console.error('레시피 상세 불러오기 실패:', e)
  }
}

function formatDate(dateString) {
  const d = new Date(dateString)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
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
.manage-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.inventory-label {
  font-weight: 600;
  display: block;
  margin-bottom: 1rem;
}
.inventory-dropdown {
  margin-top: 0.3rem;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
}
.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.recipe-card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.recipe-card:hover {
  background: #f9f9f9;
}
.title {
  font-weight: bold;
  font-size: 1.1rem;
}
.created {
  color: #999;
  font-size: 0.9rem;
  margin-top: 0.3rem;
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
.modal-actions {
  text-align: right;
}
</style>
