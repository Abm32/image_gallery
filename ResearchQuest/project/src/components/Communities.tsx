import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search,
  Users,
  MessageCircle,
  ExternalLink,
  Filter,
  Sparkles,
  TrendingUp,
  Star,
  Hash,
  Loader2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { communityService } from '../services/communityService';
import type { Community } from '../types';

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    topics: [] as string[],
    newTopic: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    const fetchCommunities = async () => {
      try {
        setError('');
        const fetchedCommunities = await communityService.fetchCommunities(searchQuery);
        setCommunities(fetchedCommunities);
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('Failed to fetch communities');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [user, searchQuery]);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError('');
      await communityService.createCommunity({
        name: newCommunity.name,
        description: newCommunity.description,
        topics: newCommunity.topics,
        platform: 'custom',
        member_count: 1,
        activity_level: 'low',
        created_by: user.uid,
        members: [user.uid]
      });

      setShowCreateModal(false);
      setNewCommunity({ name: '', description: '', topics: [], newTopic: '' });
      
      // Refresh communities list
      const updatedCommunities = await communityService.fetchCommunities(searchQuery);
      setCommunities(updatedCommunities);
    } catch (err) {
      console.error('Error creating community:', err);
      setError('Failed to create community');
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      setError('');
      await communityService.joinCommunity(communityId, user.uid);
      // Refresh communities list
      const updatedCommunities = await communityService.fetchCommunities(searchQuery);
      setCommunities(updatedCommunities);
    } catch (err) {
      console.error('Error joining community:', err);
      setError('Failed to join community');
    }
  };

  const handleAddTopic = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newCommunity.newTopic.trim()) {
      setNewCommunity({
        ...newCommunity,
        topics: [...newCommunity.topics, newCommunity.newTopic.trim()],
        newTopic: ''
      });
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesPlatform = !selectedPlatform || community.platform === selectedPlatform;
    const matchesTopic = !selectedTopic || community.topics.includes(selectedTopic);
    return matchesPlatform && matchesTopic;
  });

  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.member_count - a.member_count;
    }
    return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
  });

  const allTopics = Array.from(new Set(communities.flatMap(c => c.topics)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Communities</h1>
          <p className="text-gray-600">Connect and collaborate with researchers worldwide</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/communities/joined"
            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Joined Communities
          </Link>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Community</span>
            </button>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg flex items-center"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search communities..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Platforms</option>
                <option value="discord">Discord</option>
                <option value="slack">Slack</option>
                <option value="reddit">Reddit</option>
                <option value="custom">Custom</option>
              </select>
              {allTopics.length > 0 && (
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Topics</option>
                  {allTopics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              )}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCommunities.map((community) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{community.name}</h3>
                    <span className="text-sm text-gray-500 capitalize">{community.platform}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{community.description}</p>
                {community.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">{community.member_count}</span>
                    </div>
                  </div>
                  {community.platform === 'custom' ? (
                    community.members?.includes(user?.uid || '') ? (
                      <Link
                        to={`/communities/${community.id}/chat`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Chat
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Join
                      </button>
                    )
                  ) : (
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Create Community</h2>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  required
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics (Press Enter to add)
                </label>
                <input
                  type="text"
                  value={newCommunity.newTopic}
                  onChange={(e) => setNewCommunity({ ...newCommunity, newTopic: e.target.value })}
                  onKeyDown={handleAddTopic}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {newCommunity.topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => setNewCommunity({
                          ...newCommunity,
                          topics: newCommunity.topics.filter(t => t !== topic)
                        })}
                        className="ml-2 text-indigo-400 hover:text-indigo-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Community
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}