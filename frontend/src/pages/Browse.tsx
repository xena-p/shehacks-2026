import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item, ItemsResponse, ApiError } from '../types';
import axiosInstance from '../api/axiosInstance';
import { AxiosError } from 'axios';

const Browse = () => {
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem('user_id');

  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loggedInUserId) {
      navigate('/');
      return;
    }
  }, [loggedInUserId, navigate]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim() || !loggedInUserId) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get<ItemsResponse>('/search', {
        params: {
          user_id: loggedInUserId,
          query: searchQuery.trim(),
        },
      });

      if (response.data && response.data.items) {
        setItems(response.data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err instanceof AxiosError) {
        if (err.response) {
          const errorData = err.response.data as ApiError;
          setError(errorData.error || 'Failed to search items');
        } else {
          setError('Cannot connect to server. Please check if the backend is running.');
        }
      } else {
        setError('An unexpected error occurred');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (itemId: string) => {
    if (!loggedInUserId) {
      setError('Please log in to like items');
      return;
    }

    try {
      const response = await axiosInstance.post(`/items/${itemId}/request`, {
        requester_id: loggedInUserId,
      });

      if (response.data && response.data.message) {
        // Remove the item from the list since it's now unavailable
        setItems(items.filter(item => item._id !== itemId));
        alert('Item requested successfully!');
      }
    } catch (err) {
      console.error('Like error:', err);
      if (err instanceof AxiosError) {
        if (err.response) {
          const errorData = err.response.data as ApiError;
          setError(errorData.error || 'Failed to request item');
          alert(errorData.error || 'Failed to request item');
        } else {
          setError('Cannot connect to server');
          alert('Cannot connect to server');
        }
      } else {
        setError('An unexpected error occurred');
        alert('An unexpected error occurred');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getConditionBorderColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'border-purple-400';
      case 'gently used':
        return 'border-purple-300';
      case 'fair':
        return 'border-orange-400';
      case 'poor':
        return 'border-orange-300';
      default:
        return 'border-gray-300';
    }
  };

  const getItemIcon = (category: string) => {
    // Default to book icon, can be customized based on category
    if (category.toLowerCase().includes('laptop') || category.toLowerCase().includes('computer') || category.toLowerCase().includes('electronics')) {
      return '💻';
    }
    return '📚';
  };

  if (!loggedInUserId) {
    return null;
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
              onClick={() => navigate(`/profile/${loggedInUserId}`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
            >
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md rounded-lg font-medium transition-all">
              Browse
              <span className="ml-auto bg-white/30 px-2 py-0.5 rounded text-xs">active</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all">
              Matches
            </button>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('user_id');
              localStorage.removeItem('token');
              navigate('/');
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button and Search */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(`/profile/${loggedInUserId}`)}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-purple-600 transition-all shadow-lg"
              >
                Back to Profile
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <div 
                  className="w-full rounded-2xl p-[2px] bg-gradient-to-r from-pink-400 to-purple-400 shadow-lg"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full px-6 py-4 text-lg rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
          </div>

          {/* Browse Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Browse</h2>

            {loading ? (
              <div className="text-gray-600 text-center py-12">Searching...</div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center text-gray-500">
                <p className="text-xl mb-2">No items found</p>
                <p>Try searching for items using the search bar above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${getConditionBorderColor(item.condition)} hover:shadow-xl transition-all relative`}
                  >
                    {/* Heart Icon */}
                    <button
                      onClick={() => handleLike(item._id)}
                      className="absolute top-4 right-4 text-pink-500 hover:text-pink-700 transition-colors z-10"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Item Title */}
                    <h3 className="font-bold text-gray-800 text-center mb-4 truncate">{item.title}</h3>

                    {/* Item Icon */}
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <span className="text-4xl">{getItemIcon(item.category)}</span>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Condition</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            item.condition === 'excellent' || item.condition === 'gently used'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-orange-100 text-orange-700 border border-orange-200'
                          }`}>
                            {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                          </span>
                        </div>
                        {item.owner && (
                          <div className="text-right">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Owner</p>
                            <p className="text-xs text-gray-700">{item.owner.username}</p>
                            {item.owner.profile && (
                              <p className="text-xs text-gray-600">
                                ⭐ {item.owner.profile.rating?.toFixed(1) || '0.0'}/5.0
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Return Date:</p>
                        <p className="text-xs text-gray-700">{formatDate(item.return_date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
