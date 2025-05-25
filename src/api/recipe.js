// 레시피 추천 관련 API 함수 모음
import api from './index'

// ✅ AI 추천 레시피 가져오기
export const getRecommendedRecipes = (userId) => {
  return api.get(`/recipe/recommend/${userId}`)
}

// ✅ 레시피 상세 보기
export const getRecipeById = (recipeId) => {
  return api.get(`/recipe/${recipeId}`)
}
