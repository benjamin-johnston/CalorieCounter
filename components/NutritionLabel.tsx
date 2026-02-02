
import React from 'react';
import { NutritionFacts } from '../types';

interface NutritionLabelProps {
  data: NutritionFacts;
  onAdd?: () => void;
  onCancel?: () => void;
}

export const NutritionLabel: React.FC<NutritionLabelProps> = ({ data, onAdd, onCancel }) => {
  const formatVal = (val?: number) => (val !== undefined ? val : '0');

  return (
    <div className="bg-white p-4 border-4 border-black font-sans text-sm max-w-xs shadow-xl mx-auto my-4">
      <h1 className="text-3xl font-black border-b-8 border-black leading-tight uppercase">Nutrition Facts</h1>
      <div className="border-b border-black py-1">
        <div className="flex justify-between font-bold">
          <span>Serving size</span>
          <span>{data.serving_size}</span>
        </div>
      </div>
      <div className="border-b-8 border-black py-1">
        <div className="flex justify-between items-baseline font-black">
          <span className="text-lg">Amount per serving</span>
        </div>
        <div className="flex justify-between items-baseline font-black">
          <span className="text-2xl">Calories</span>
          <span className="text-3xl">{data.calories}</span>
        </div>
      </div>
      
      <div className="border-b border-black py-0.5">
        <div className="flex justify-between">
          <span><span className="font-bold">Total Fat</span> {formatVal(data.total_fat_g)}g</span>
          <span className="font-bold">{Math.round((data.total_fat_g || 0) / 65 * 100)}%</span>
        </div>
      </div>
      <div className="border-b border-black py-0.5 pl-4">
        <div className="flex justify-between">
          <span>Saturated Fat {formatVal(data.saturated_fat_g)}g</span>
          <span className="font-bold">{Math.round((data.saturated_fat_g || 0) / 20 * 100)}%</span>
        </div>
      </div>
      <div className="border-b border-black py-0.5 pl-4 italic">
        <span>Trans Fat {formatVal(data.trans_fat_g)}g</span>
      </div>
      <div className="border-b border-black py-0.5">
        <div className="flex justify-between">
          <span><span className="font-bold">Cholesterol</span> {formatVal(data.cholesterol_mg)}mg</span>
          <span className="font-bold">{Math.round((data.cholesterol_mg || 0) / 300 * 100)}%</span>
        </div>
      </div>
      <div className="border-b border-black py-0.5">
        <div className="flex justify-between">
          <span><span className="font-bold">Sodium</span> {formatVal(data.sodium_mg)}mg</span>
          <span className="font-bold">{Math.round((data.sodium_mg || 0) / 2300 * 100)}%</span>
        </div>
      </div>
      <div className="border-b border-black py-0.5">
        <div className="flex justify-between">
          <span><span className="font-bold">Total Carbohydrate</span> {formatVal(data.total_carbohydrate_g)}g</span>
          <span className="font-bold">{Math.round((data.total_carbohydrate_g || 0) / 300 * 100)}%</span>
        </div>
      </div>
      <div className="border-b border-black py-0.5 pl-4">
        <div className="flex justify-between">
          <span>Dietary Fiber {formatVal(data.dietary_fiber_g)}g</span>
          <span className="font-bold">{Math.round((data.dietary_fiber_g || 0) / 25 * 100)}%</span>
        </div>
      </div>
      <div className="border-b border-black py-0.5 pl-4">
        <span>Total Sugars {formatVal(data.total_sugars_g)}g</span>
      </div>
      <div className="border-b border-black py-0.5 pl-8">
        <span>Includes {formatVal(data.added_sugars_g)}g Added Sugars</span>
      </div>
      <div className="border-b-8 border-black py-0.5">
        <div className="flex justify-between">
          <span><span className="font-bold">Protein</span> {formatVal(data.protein_g)}g</span>
        </div>
      </div>

      <div className="py-1 border-b border-black">
        <div className="flex justify-between">
          <span>Vitamin D {formatVal(data.vitamins_and_minerals?.vitamin_d_mcg)}mcg</span>
          <span>{Math.round((data.vitamins_and_minerals?.vitamin_d_mcg || 0) / 20 * 100)}%</span>
        </div>
      </div>
      <div className="py-1 border-b border-black">
        <div className="flex justify-between">
          <span>Calcium {formatVal(data.vitamins_and_minerals?.calcium_mg)}mg</span>
          <span>{Math.round((data.vitamins_and_minerals?.calcium_mg || 0) / 1300 * 100)}%</span>
        </div>
      </div>
      <div className="py-1 border-b border-black">
        <div className="flex justify-between">
          <span>Iron {formatVal(data.vitamins_and_minerals?.iron_mg)}mg</span>
          <span>{Math.round((data.vitamins_and_minerals?.iron_mg || 0) / 18 * 100)}%</span>
        </div>
      </div>
      <div className="py-1">
        <div className="flex justify-between">
          <span>Potassium {formatVal(data.vitamins_and_minerals?.potassium_mg)}mg</span>
          <span>{Math.round((data.vitamins_and_minerals?.potassium_mg || 0) / 4700 * 100)}%</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {onAdd && (
          <button 
            onClick={onAdd}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-green-700 transition shadow-md"
          >
            Add to Log
          </button>
        )}
        {onCancel && (
          <button 
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-bold hover:bg-gray-300 transition"
          >
            Discard
          </button>
        )}
      </div>
    </div>
  );
};
