import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TaskManager } from "./TaskManager";
import { DietTracker } from "./DietTracker";
import { Analytics } from "./Analytics";
import { MotivationalQuote } from "./MotivationalQuote";
import { UserProfile } from "./UserProfile";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const seedQuotes = useMutation(api.quotes.seedQuotes);
  const seedFoodDatabase = useMutation(api.foodDatabase.seedFoodDatabase);

  // Seed data on first load
  useEffect(() => {
    seedQuotes();
    seedFoodDatabase();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠", gradient: "from-blue-500 to-purple-600" },
    { id: "tasks", label: "Tasks", icon: "📋", gradient: "from-green-500 to-blue-600" },
    { id: "diet", label: "Nutrition", icon: "🍎", gradient: "from-orange-500 to-red-600" },
    { id: "analytics", label: "Analytics", icon: "📊", gradient: "from-purple-500 to-pink-600" },
    { id: "profile", label: "Profile", icon: "👤", gradient: "from-indigo-500 to-purple-600" },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = userProfile?.username || loggedInUser?.name || loggedInUser?.email || "Friend";

  return (
    <div className="space-y-6">
      {/* Welcome Section with Enhanced Gradient */}
      <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {getGreeting()}, {displayName}! ✨
              </h2>
              <p className="text-blue-100 text-lg">
                Ready to make today amazing? Let's check your progress.
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-blue-100">
                <span>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <MotivationalQuote />
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-2">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content with Enhanced Styling */}
      <div className="min-h-[600px]">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "tasks" && <TaskManager />}
        {activeTab === "diet" && <DietTracker />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "profile" && <UserProfile />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const today = new Date().toISOString().split('T')[0];
  const tasks = useQuery(api.tasks.getTasks, { date: today });
  const dietPlan = useQuery(api.diet.getDietPlan, { date: today });
  
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const consumedCalories = dietPlan?.reduce((sum, item) => sum + (item.completed ? item.calories : 0), 0) || 0;
  const targetCalories = 2000;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tasks Today</p>
              <p className="text-3xl font-bold">{completedTasks}/{totalTasks}</p>
            </div>
            <div className="text-4xl opacity-80">📋</div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Calories</p>
              <p className="text-3xl font-bold">{consumedCalories}</p>
            </div>
            <div className="text-4xl opacity-80">🔥</div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min((consumedCalories / targetCalories) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Productivity</p>
              <p className="text-3xl font-bold">{completionRate.toFixed(0)}%</p>
            </div>
            <div className="text-4xl opacity-80">🎯</div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Streak</p>
              <p className="text-3xl font-bold">7</p>
            </div>
            <div className="text-4xl opacity-80">🔥</div>
          </div>
          <p className="text-orange-100 text-sm mt-2">Days active</p>
        </div>
      </div>

      {/* Today's Schedule Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Today's Tasks
          </h3>
          <div className="space-y-3">
            {tasks && tasks.length > 0 ? (
              tasks.slice(0, 3).map((task) => (
                <div key={task._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500">{task.startTime} - {task.endTime}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks for today</p>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🍽️</span>
            Nutrition Progress
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Calories</span>
              <span className="font-semibold">{consumedCalories} / {targetCalories}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-600 rounded-full h-3 transition-all duration-500"
                style={{ width: `${Math.min((consumedCalories / targetCalories) * 100, 100)}%` }}
              ></div>
            </div>
            {dietPlan && dietPlan.length > 0 && (
              <div className="mt-4 space-y-2">
                {['breakfast', 'lunch', 'dinner'].map((meal) => {
                  const mealItems = dietPlan.filter(item => item.mealType === meal);
                  const completed = mealItems.filter(item => item.completed).length;
                  return (
                    <div key={meal} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{meal}</span>
                      <span className={completed > 0 ? 'text-green-600' : 'text-gray-400'}>
                        {completed > 0 ? '✓' : '○'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
