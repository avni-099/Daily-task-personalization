import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function UserProfile() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getUserProfile);
  const updateProfile = useMutation(api.userProfiles.updateUserProfile);
  const createProfile = useMutation(api.userProfiles.createUserProfile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userProfile?.username || "",
    phoneNumber: userProfile?.phoneNumber || "",
    targetCalories: userProfile?.targetCalories || 2000,
    activityLevel: userProfile?.activityLevel || "moderate",
  });

  const handleSave = async () => {
    try {
      if (userProfile) {
        await updateProfile(formData);
        toast.success("Profile updated successfully!");
      } else {
        await createProfile(formData);
        toast.success("Profile created successfully!");
      }
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      username: userProfile?.username || "",
      phoneNumber: userProfile?.phoneNumber || "",
      targetCalories: userProfile?.targetCalories || 2000,
      activityLevel: userProfile?.activityLevel || "moderate",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Profile Settings</h3>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {(userProfile?.username || loggedInUser?.name || loggedInUser?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {userProfile?.username || loggedInUser?.name || "User"}
              </h2>
              <p className="text-blue-100">{loggedInUser?.email}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  🎯 {userProfile?.activityLevel || "moderate"} activity
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  🔥 {userProfile?.targetCalories || 2000} cal target
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {userProfile?.username || "Not set"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500">
                {loggedInUser?.email || "Not available"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {userProfile?.phoneNumber || "Not set"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Calories
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.targetCalories}
                  onChange={(e) => setFormData({ ...formData, targetCalories: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1000"
                  max="5000"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {userProfile?.targetCalories || 2000} calories
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              {isEditing ? (
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="light">Light (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                  <option value="active">Active (hard exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (very hard exercise, physical job)</option>
                </select>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 capitalize">
                  {userProfile?.activityLevel || "moderate"}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold">7</div>
          <div className="text-green-100">Day Streak</div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold">42</div>
          <div className="text-blue-100">Tasks Completed</div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold">85%</div>
          <div className="text-purple-100">Avg Productivity</div>
        </div>
      </div>
    </div>
  );
}
