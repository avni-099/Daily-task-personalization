import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DietTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servingSize, setServingSize] = useState(100);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");

  const dietPlan = useQuery(api.diet.getDietPlan, { date: selectedDate });
  const foodSearch = useQuery(api.foodDatabase.searchFood, 
    searchTerm.length >= 2 ? { searchTerm } : "skip"
  );
  const addDietItem = useMutation(api.diet.addDietItem);
  const updateDietItem = useMutation(api.diet.updateDietItem);
  const deleteDietItem = useMutation(api.diet.deleteDietItem);
  const createFood = useMutation(api.foodDatabase.createFood);

  useEffect(() => {
    const trimmedName = searchTerm.trim();
    if (trimmedName.length < 2) return;

    const isSelectedMatch = selectedFood?.name?.toLowerCase() === trimmedName.toLowerCase();
    if (isSelectedMatch) return;

    const hasMatchingFood = (foodSearch ?? []).some(
      (food) => food.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (hasMatchingFood) return;

    const timer = window.setTimeout(async () => {
      try {
        const createdFood = await createFood({
          name: trimmedName,
          category: "custom",
          caloriesPer100g: 100,
          proteinPer100g: 5,
          carbsPer100g: 15,
          fatsPer100g: 3,
        });

        setSelectedFood(createdFood);
        setSearchTerm(createdFood.name);
      } catch {
        toast.error("Failed to create custom food");
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [createFood, foodSearch, searchTerm, selectedFood]);

  const handleAddDietItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) {
      toast.error("Please select a food item");
      return;
    }

    try {
      const multiplier = servingSize / 100;
      await addDietItem({
        mealType,
        foodItem: `${selectedFood.name} (${servingSize}g)`,
        calories: Math.round(selectedFood.caloriesPer100g * multiplier),
        protein: Math.round(selectedFood.proteinPer100g * multiplier * 10) / 10,
        carbs: Math.round(selectedFood.carbsPer100g * multiplier * 10) / 10,
        fats: Math.round(selectedFood.fatsPer100g * multiplier * 10) / 10,
        date: selectedDate,
      });
      
      setSelectedFood(null);
      setSearchTerm("");
      setServingSize(100);
      setShowAddForm(false);
      toast.success("Food item added successfully!");
    } catch (error) {
      toast.error("Failed to add food item");
    }
  };

  const handleToggleComplete = async (dietId: string, completed: boolean) => {
    try {
      await updateDietItem({ dietId: dietId as any, completed: !completed });
      toast.success(completed ? "Marked as not consumed" : "Marked as consumed! 🍽️");
    } catch (error) {
      toast.error("Failed to update diet item");
    }
  };

  const handleDeleteDietItem = async (dietId: string) => {
    try {
      await deleteDietItem({ dietId: dietId as any });
      toast.success("Diet item deleted");
    } catch (error) {
      toast.error("Failed to delete diet item");
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast": return "🌅";
      case "lunch": return "☀️";
      case "dinner": return "🌙";
      case "snack": return "🍎";
      default: return "🍽️";
    }
  };

  const getMealGradient = (mealType: string) => {
    switch (mealType) {
      case "breakfast": return "from-yellow-400 to-orange-500";
      case "lunch": return "from-orange-400 to-red-500";
      case "dinner": return "from-purple-400 to-indigo-500";
      case "snack": return "from-green-400 to-teal-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const totalCalories = dietPlan?.reduce((sum, item) => sum + (item.completed ? item.calories : 0), 0) || 0;
  const totalProtein = dietPlan?.reduce((sum, item) => sum + (item.completed ? item.protein : 0), 0) || 0;
  const totalCarbs = dietPlan?.reduce((sum, item) => sum + (item.completed ? item.carbs : 0), 0) || 0;
  const totalFats = dietPlan?.reduce((sum, item) => sum + (item.completed ? item.fats : 0), 0) || 0;

  const targetCalories = 2000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Nutrition Tracker</h3>
          <p className="text-gray-600">Monitor your nutrition with smart food database</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg"
          >
            + Add Food
          </button>
        </div>
      </div>

      {/* Enhanced Nutrition Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🔥</div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalCalories}</div>
              <div className="text-red-100 text-sm">/ {targetCalories} cal</div>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💪</div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalProtein.toFixed(1)}g</div>
              <div className="text-blue-100 text-sm">Protein</div>
            </div>
          </div>
          <div className="text-blue-100 text-sm">Target: {(targetCalories * 0.15 / 4).toFixed(0)}g</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🌾</div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalCarbs.toFixed(1)}g</div>
              <div className="text-yellow-100 text-sm">Carbs</div>
            </div>
          </div>
          <div className="text-yellow-100 text-sm">Target: {(targetCalories * 0.5 / 4).toFixed(0)}g</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🥑</div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalFats.toFixed(1)}g</div>
              <div className="text-purple-100 text-sm">Fats</div>
            </div>
          </div>
          <div className="text-purple-100 text-sm">Target: {(targetCalories * 0.35 / 9).toFixed(0)}g</div>
        </div>
      </div>

      {/* Enhanced Add Food Form */}
      {showAddForm && (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleAddDietItem} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-gray-900">Add Food Item</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snack">🍎 Snack</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Food</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    if (!selectedFood || value.toLowerCase() !== selectedFood.name.toLowerCase()) {
                      setSelectedFood(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type to search foods..."
                />
                
                {(foodSearch || searchTerm.trim().length >= 2) && (
                  <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                    {foodSearch?.map((food) => (
                      <button
                        key={food._id}
                        type="button"
                        onClick={() => {
                          setSelectedFood(food);
                          setSearchTerm(food.name);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-gray-500">
                          {food.caloriesPer100g} cal/100g • {food.category}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serving Size (grams)</label>
                <input
                  type="number"
                  value={servingSize}
                  onChange={(e) => setServingSize(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="1000"
                />
              </div>
              
              {selectedFood && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Nutrition Preview</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calories: {Math.round(selectedFood.caloriesPer100g * servingSize / 100)}</div>
                    <div>Protein: {(selectedFood.proteinPer100g * servingSize / 100).toFixed(1)}g</div>
                    <div>Carbs: {(selectedFood.carbsPer100g * servingSize / 100).toFixed(1)}g</div>
                    <div>Fats: {(selectedFood.fatsPer100g * servingSize / 100).toFixed(1)}g</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFood}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Food Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Diet Items List */}
      <div className="space-y-4">
        {dietPlan && dietPlan.length > 0 ? (
          dietPlan
            .sort((a, b) => {
              const mealOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
              return mealOrder[a.mealType] - mealOrder[b.mealType];
            })
            .map((item) => (
              <div
                key={item._id}
                className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border-l-4 p-6 transition-all hover:shadow-xl ${
                  item.completed ? "border-l-green-500 bg-green-50/50" : `border-l-orange-500`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() => handleToggleComplete(item._id, item.completed)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-500"
                      }`}
                    >
                      {item.completed && "✓"}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className={`text-lg font-semibold ${item.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                          {getMealIcon(item.mealType)} {item.foodItem}
                        </h4>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getMealGradient(item.mealType)} text-white`}>
                          {item.mealType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 bg-red-50 rounded-lg p-2">
                          <span className="text-red-500 text-lg">🔥</span>
                          <div>
                            <div className={`font-semibold ${item.completed ? "line-through text-gray-500" : "text-red-600"}`}>
                              {item.calories}
                            </div>
                            <div className="text-xs text-gray-500">calories</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-blue-50 rounded-lg p-2">
                          <span className="text-blue-500 text-lg">💪</span>
                          <div>
                            <div className={`font-semibold ${item.completed ? "line-through text-gray-500" : "text-blue-600"}`}>
                              {item.protein}g
                            </div>
                            <div className="text-xs text-gray-500">protein</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-yellow-50 rounded-lg p-2">
                          <span className="text-yellow-500 text-lg">🌾</span>
                          <div>
                            <div className={`font-semibold ${item.completed ? "line-through text-gray-500" : "text-yellow-600"}`}>
                              {item.carbs}g
                            </div>
                            <div className="text-xs text-gray-500">carbs</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-purple-50 rounded-lg p-2">
                          <span className="text-purple-500 text-lg">🥑</span>
                          <div>
                            <div className={`font-semibold ${item.completed ? "line-through text-gray-500" : "text-purple-600"}`}>
                              {item.fats}g
                            </div>
                            <div className="text-xs text-gray-500">fats</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteDietItem(item._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-4 text-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="text-8xl mb-6">🍽️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No food items for this date</h3>
            <p className="text-gray-600 mb-6">Start tracking your nutrition with our smart food database</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg text-lg font-medium"
            >
              Add Your First Meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
