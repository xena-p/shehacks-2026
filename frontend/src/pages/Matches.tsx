import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { Item } from '../types';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  profile?: {
    rating?: number;
  };
}

const Matches: React.FC = () => {
  const navigate = useNavigate();
  const [activeRequests, setActiveRequests] = useState<Item[]>([]);
  const [loanedItems, setLoanedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  const userId = localStorage.getItem('user_id');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch both data types in parallel
        const [requestsResponse, loanedResponse] = await Promise.all([
          apiService.getActiveRequests(userId),
          apiService.getMyLoanedItems(userId)
        ]);

        // Extract items from responses
        const requests = requestsResponse.items || [];
        const loaned = loanedResponse.items || [];

        setActiveRequests(requests);
        setLoanedItems(loaned);

        // Collect all user IDs we need to fetch
        const userIds = new Set<string>();
        
        // For active requests, we need the owner info (user_id)
        requests.forEach((item: Item) => {
          if (item.user_id) userIds.add(item.user_id);
        });
        
        // For loaned items, we need the requester info
        loaned.forEach((item: Item) => {
          if (item.requester) userIds.add(item.requester);
        });

        // Fetch user information for all relevant users
        if (userIds.size > 0) {
          const userPromises = Array.from(userIds).map(async (id) => {
            try {
              // We'll need to add this endpoint to the backend or use existing user data
              // For now, we'll create a basic user object
              return { _id: id, username: `user_${id.slice(-6)}`, profile: { rating: 0 } };
            } catch (err) {
              console.error(`Failed to fetch user ${id}:`, err);
              return { _id: id, username: 'Unknown User', profile: { rating: 0 } };
            }
          });

          const userResults = await Promise.all(userPromises);
          const userMap = userResults.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
          }, {} as { [key: string]: User });
          
          setUsers(userMap);
        }

      } catch (err) {
        console.error('Failed to fetch matches data:', err);
        setError('Failed to load matches data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-lg">
            {i < fullStars ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </span>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">({rating})</span>
      </div>
    );
  };

  const RequestCard = ({ item, showRating = false }: { item: Item; showRating?: boolean }) => {
    const owner = users[item.user_id];
    const requester = users[item.requester || ''];
    
    return (
      <div className="bg-gradient-to-r from-white to-purple-50/30 rounded-xl shadow-lg p-5 mb-4 border border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-start space-x-4">
          {/* Book icon */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-3">
              Textbook: {item.title}
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-purple-700 text-sm">Condition:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.condition === 'excellent' ? 'bg-green-100 text-green-800 border border-green-200' :
                  item.condition === 'gently used' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-purple-700 text-sm">Return Date:</span>
                <span className="text-gray-800 font-medium">{formatDate(item.return_date)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-purple-700 text-sm">User:</span>
                <span className="text-gray-800 font-medium">
                  {showRating && owner ? owner.username : requester?.username || 'Unknown'}
                </span>
              </div>
              
              {showRating && owner?.profile?.rating !== undefined && (
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-purple-700 text-sm">Rating:</span>
                  {renderStars(owner.profile.rating)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <div className="text-gray-600 font-medium">Loading matches...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-red-200">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-red-600 font-semibold text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ReUseU
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button 
              onClick={() => navigate(`/profile/${userId}`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
            >
              Profile
            </button>
            <button 
              onClick={() => navigate('/browse')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
            >
              Browse
            </button>
            <button 
              onClick={() => navigate('/matches')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
            >
              Matches
              <span className="ml-auto bg-white/30 px-2 py-0.5 rounded text-xs">active</span>
            </button>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
              My Matches
            </h1>
            <p className="text-xl text-gray-600">Manage your requests and loans</p>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - My Requests (where user is requester) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 pb-3 border-b border-purple-200">
                My Requests
              </h2>
              <div className="space-y-4">
                {activeRequests.length > 0 ? (
                  activeRequests.map((item) => (
                    <RequestCard key={item._id} item={item} showRating={true} />
                  ))
                ) : (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 text-center text-gray-500 border border-purple-200">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-lg font-medium">No active requests</p>
                    <p className="text-sm mt-2">Browse items to make requests</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Item Requests (where user is owner) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 pb-3 border-b border-purple-200">
                Item Requests
              </h2>
              <div className="space-y-4">
                {loanedItems.length > 0 ? (
                  loanedItems.map((item) => (
                    <RequestCard key={item._id} item={item} showRating={false} />
                  ))
                ) : (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 text-center text-gray-500 border border-purple-200">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg font-medium">No loaned items</p>
                    <p className="text-sm mt-2">Your items will appear here when requested</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;
