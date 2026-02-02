
export interface VitaminsAndMinerals {
  vitamin_d_mcg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  potassium_mg?: number;
}

export interface NutritionFacts {
  item_name: string;
  serving_size: string;
  calories: number;
  total_fat_g?: number;
  saturated_fat_g?: number;
  trans_fat_g?: number;
  cholesterol_mg?: number;
  sodium_mg?: number;
  total_carbohydrate_g?: number;
  dietary_fiber_g?: number;
  total_sugars_g?: number;
  added_sugars_g?: number;
  protein_g?: number;
  vitamins_and_minerals?: VitaminsAndMinerals;
}

export interface AnalysisResponse {
  status: 'NEED_INFO' | 'COMPLETE';
  clarifying_question?: string;
  nutrition_facts?: NutritionFacts;
}

export interface FoodLogEntry extends NutritionFacts {
  id: string;
  timestamp: number;
}

export interface DailyStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
