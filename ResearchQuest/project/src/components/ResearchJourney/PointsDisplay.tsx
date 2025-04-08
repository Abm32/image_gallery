import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Award, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { gamificationService } from '../../services/gamificationService';
import type { UserPoints, PointTransaction } from '../../types';

export function PointsDisplay() {
  const { user } = useAuth();
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPoints = async () => {
      try {
        const userPoints = await gamificationService.getUserPoints(user.uid);
        setPoints(userPoints);
      } catch (err) {
        setError('Failed to load points');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [user]);

  if (loading) {
    return <div>Loading points...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const recentTransactions = points?.history.slice(-3) || [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Trophy className="w-8 h-8 text-indigo-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{points?.total || 0} Points</h3>
              <p className="text-gray-600">Research Progress</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Next Milestone</p>
            <p className="text-lg font-semibold text-indigo-600">
              {1000 - (points?.total || 0)} points needed
            </p>
          </div>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((points?.total || 0) % 1000) / 10}%` }}
            transition={{ duration: 1 }}
            className="absolute h-full bg-indigo-600"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <Star className="w-8 h-8 text-yellow-500 mb-4" />
          <h4 className="text-lg font-semibold">Weekly Rank</h4>
          <p className="text-3xl font-bold text-gray-900 mt-2">#3</p>
          <p className="text-gray-600">Top 5% of researchers</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <Target className="w-8 h-8 text-green-500 mb-4" />
          <h4 className="text-lg font-semibold">Goals Completed</h4>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
          <p className="text-gray-600">This month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <Award className="w-8 h-8 text-purple-500 mb-4" />
          <h4 className="text-lg font-semibold">Achievements</h4>
          <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
          <p className="text-gray-600">Badges earned</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="divide-y">
          {recentTransactions.map((transaction: PointTransaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {transaction.type === 'earned' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <p className="text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.timestamp.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${
                transaction.type === 'earned' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} pts
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}