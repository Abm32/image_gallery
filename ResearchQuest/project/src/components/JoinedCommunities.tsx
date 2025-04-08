import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, MessageCircle } from 'lucide-react';
import type { Community } from '../types';

export default function JoinedCommunities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchJoinedCommunities = async () => {
      try {
        const q = query(
          collection(db, 'communities'),
          where('members', 'array-contains', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const joinedCommunities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Community[];
        setCommunities(joinedCommunities);
      } catch (error) {
        console.error('Error fetching joined communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedCommunities();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Communities</h1>
          <p className="text-gray-600">Communities you've joined</p>
        </div>
        <Link
          to="/communities"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Explore More
        </Link>
      </div>

      {communities.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You haven't joined any communities yet.</p>
          <Link
            to="/communities"
            className="mt-4 text-indigo-600 hover:text-indigo-700 inline-block"
          >
            Explore Communities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {community.name}
                </h3>
                <p className="text-gray-600 mb-4">{community.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{community.member_count} members</span>
                  </div>
                  <button
                    onClick={() => navigate(`/communities/${community.id}/chat`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}