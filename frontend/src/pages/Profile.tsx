import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

const Profile = () => {
  const navigate = useNavigate();
  
  // Initialize user state from localStorage
  const [user] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return null;
    }
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Welcome, {user.username}!
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">School</label>
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <span className="text-gray-800 font-semibold">{user.profile.school}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Program</label>
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <span className="text-gray-800 font-semibold">{user.profile.program}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Degree</label>
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <span className="text-gray-800 font-semibold">{user.profile.degree}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Rating</label>
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <span className="text-gray-800 font-semibold">
                  {user.profile.rating.toFixed(1)} ⭐ ({user.profile['#ofratings']} ratings)
                </span>
              </div>
            </div>
          </div>

          {user.possible_dates && user.possible_dates.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">Available Dates</label>
              <div className="flex flex-wrap gap-2">
                {user.possible_dates.map((date, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200 text-gray-800"
                  >
                    {date}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
