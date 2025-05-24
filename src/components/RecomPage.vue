<template>
  <div class="inventory-page">
    <h1 class="text-2xl font-bold mb-2">AI Recipe Recommendations</h1>
    <p class="subtitle">You can get recommendations according to your stock right here, right now!</p>

    <!-- 추천 요청 버튼 -->
    <button class="manage-btn mb-4" @click="generateAndSaveRecipe">
      🔍 Get Recipes!
    </button>

    <!-- 로딩 표시 -->
    <div v-if="loading" class="text-gray-500">Calling Recipes...</div>

    <!-- 추천된 레시피 리스트 -->
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

    <!-- 추천이 없는 경우 -->
    <div v-else-if="!loading" class="text-gray-500">No Recommendations.</div>

    <!-- 레시피 상세 보기 모달 -->
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
import { ref, onMounted } from 'vue'

const loading = ref(false)
const recipes = ref<any[]>([])
const selectedRecipe = ref<any | null>(null)

const INVENTORY_ID = 1
const AI_RECIPE_API = '/ai/recipe-generate' // 실제 AI 백엔드가 있다면 이 엔드포인트 사용

// ✅ 예제용 초기 더미 레시피 3개
const dummyRecipes = [
  {
    recipe_id: 101,
    title: '계란 볶음밥',
    created_at: '2025-05-01T12:00:00',
    content: '1. 계란을 풀고\n2. 밥과 함께 볶아줍니다',
    source_items: [
      { item_id: 1, item_name: '계란' },
      { item_id: 2, item_name: '밥' }
    ]
  },
  {
    recipe_id: 102,
    title: '우유 토스트',
    created_at: '2025-05-02T09:30:00',
    content: '1. 식빵을 우유에 적시고\n2. 팬에 구워주세요',
    source_items: [
      { item_id: 3, item_name: '식빵' },
      { item_id: 4, item_name: '우유' }
    ]
  },
  {
    recipe_id: 103,
    title: '당근 샐러드',
    created_at: '2025-05-03T10:10:00',
    content: '1. 당근을 얇게 썰고\n2. 드레싱과 함께 섞어요',
    source_items: [
      { item_id: 5, item_name: '당근' }
    ]
  }
]

// ✅ 페이지 로딩 시 실행
onMounted(() => {
  // 실제 환경에서는 아래 함수로 API에서 가져옵니다
  // fetchSavedRecipes()
  recipes.value = dummyRecipes // ← 지금은 예제 더미 데이터 사용
})

// ✅ 상세보기 클릭 시 레시피 1개를 가져옴 (지금은 더미에서 찾음)
async function openRecipe(recipeId: number) {
  // 실제 환경에서는 아래처럼 API에서 불러옴
  // const res = await fetch(`/api/recipes/${recipeId}`)
  // selectedRecipe.value = await res.json()

  selectedRecipe.value = dummyRecipes.find(r => r.recipe_id === recipeId) || null
}

// ✅ 날짜 포맷
function formatDate(dateString: string) {
  const d = new Date(dateString)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// ✅ AI 추천받고 저장하는 함수 (지금은 실제 동작하지 않음)
async function generateAndSaveRecipe() {
  loading.value = true
  try {
    // 1. 인벤토리 재고 가져오기 (예: /api/inventories/1/items)
    // 2. AI 서버에 item_ids 보내기 → 추천 레시피 받기
    // 3. /api/recipes POST로 저장
    // 4. 저장된 레시피 다시 불러오기

    alert('🔧 Not connected to BackEnd!')

    // await fetchSavedRecipes()
  } catch (e) {
    console.error('Failed getting Recipe!:', e)
  } finally {
    loading.value = false
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
