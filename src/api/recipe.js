// src/api/recipe.js
import api from './index'

// ✅ AI 추천 레시피 가져오기 (POST로 inventory_id, items 전송)
export const getRecommendedRecipes = (payload) => {
  return api.post('/recipe/recommend', payload)
}

// ✅ 레시피 상세 보기
export const getRecipeById = (recipeId) => {
  return api.get(`/recipe/${recipeId}`)
}
