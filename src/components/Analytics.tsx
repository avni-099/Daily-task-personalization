import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Analytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const analytics = useQuery(api.analytics.getAnalytics, dateRange);

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 bg-green-100";
    if (rate >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getProgressBarColor = (rate: number) => {
    if (rate >= 80) return "from-green-400 to-green-600";
    if (rate >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h3>
          <p className="text-gray-600">Track your progress with detailed insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <span className="text-gray-500 font-medium">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {analytics ? (
        <>
          {/* Enhanced Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-3">📊</div>
                <div className="text-3xl font-bold mb-1">{analytics.completionRate.toFixed(1)}%</div>
                <div className="text-blue-100 text-sm">Completion Rate</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-3">✅</div>
                <div className="text-3xl font-bold mb-1">{analytics.completedTasks}</div>
                <div className="text-green-100 text-sm">Tasks Completed</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-3">📋</div>
                <div className="text-3xl font-bold mb-1">{analytics.totalTasks}</div>
                <div className="text-orange-100 text-sm">Total Tasks</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-3">🎯</div>
                <div className="text-3xl font-bold mb-1">{analytics.avgProductivity.toFixed(1)}%</div>
                <div className="text-purple-100 text-sm">Avg Productivity</div>
              </div>
            </div>
          </div>

          {/* Enhanced Category Performance Chart */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📂</span>
              Category Performance
            </h4>
            <div className="space-y-6">
              {Object.entries(analytics.categoryStats).map(([category, stats]) => {
                const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                return (
                  <div key={category} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                          {category === "work" ? "💼" : 
                           category === "personal" ? "👤" : 
                           category === "health" ? "🏃" : 
                           category === "study" ? "📚" : 
                           category === "social" ? "👥" : "📋"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 capitalize text-lg">{category}</div>
                          <div className="text-gray-600">
                            {stats.completed} of {stats.total} tasks completed
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold ${getCompletionColor(completionRate)}`}>
                        {completionRate.toFixed(1)}%
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${getProgressBarColor(completionRate)} h-3 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Daily Progress Chart */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📈</span>
              Daily Progress Trends
            </h4>
            <div className="space-y-4">
              {analytics.dailyProgress.map((day, index) => (
                <div key={day.date} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {new Date(day.date).getDate()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {day.tasksCompleted}/{day.totalTasks} tasks • {day.caloriesConsumed} calories
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getCompletionColor(day.productivityScore)}`}>
                      {day.productivityScore.toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Task Completion</span>
                        <span>{day.productivityScore.toFixed(1)}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getProgressBarColor(day.productivityScore)} h-2 rounded-full transition-all duration-1000`}
                          style={{ width: `${day.productivityScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Calorie Goal</span>
                        <span>{((day.caloriesConsumed / day.targetCalories) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((day.caloriesConsumed / day.targetCalories) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Insights */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-6 flex items-center">
                <span className="mr-3">💡</span>
                AI-Powered Insights & Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.completionRate >= 80 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <h5 className="font-bold text-green-100 mb-1">Excellent Performance!</h5>
                        <p className="text-indigo-100 text-sm">
                          You're maintaining a high completion rate of {analytics.completionRate.toFixed(1)}%. Keep up the great work!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {analytics.completionRate < 60 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h5 className="font-bold text-yellow-100 mb-1">Room for Improvement</h5>
                        <p className="text-indigo-100 text-sm">
                          Your completion rate is {analytics.completionRate.toFixed(1)}%. Try breaking large tasks into smaller, manageable chunks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {Object.entries(analytics.categoryStats).length > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <h5 className="font-bold text-blue-100 mb-1">Category Insights</h5>
                        <p className="text-indigo-100 text-sm">
                          You're most productive in {Object.entries(analytics.categoryStats)
                            .sort(([,a], [,b]) => (b.completed/b.total) - (a.completed/a.total))[0]?.[0] || 'various'} tasks. 
                          Consider scheduling similar tasks together.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h5 className="font-bold text-purple-100 mb-1">Productivity Tip</h5>
                      <p className="text-indigo-100 text-sm">
                        Your most productive days show consistent task completion. Try to maintain a steady rhythm rather than cramming tasks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="text-8xl mb-6">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No analytics data available</h3>
          <p className="text-gray-600 mb-6">Start adding tasks and tracking nutrition to see your insights</p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
              Add Tasks
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg">
              Track Nutrition
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
