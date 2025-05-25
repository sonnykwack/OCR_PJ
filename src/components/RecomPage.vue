<template>
  <div class="inventory-page">
    <h1 class="text-2xl font-bold mb-2">AI Recipe Recommendations</h1>
    <p class="subtitle">
      You can get recommendations according to your stock right here, right now!
    </p>

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

<script setup lang="ts">
import { ref } from 'vue'
import { getRecommendedRecipes, getRecipeById } from '@/api/recipe'

const loading = ref(false)
const recipes = ref<any[]>([])
const selectedRecipe = ref<any | null>(null)

// ✅ 로그인 연결 전까지는 userId 하드코딩
const userId = 1

// ✅ 레시피 목록 불러오기
async function fetchRecommendedRecipes() {
  loading.value = true
  try {
    const res = await getRecommendedRecipes(userId)
    recipes.value = res.data
  } catch (e) {
    console.error('추천 레시피 불러오기 실패:', e)
  } finally {
    loading.value = false
  }
}

// ✅ 레시피 상세 보기
async function openRecipe(recipeId: number) {
  try {
    const res = await getRecipeById(recipeId)
    selectedRecipe.value = res.data
  } catch (e) {
    console.error('레시피 상세 불러오기 실패:', e)
  }
}

// ✅ 날짜 포맷
function formatDate(dateString: string) {
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
