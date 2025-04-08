import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { gamificationService } from '../../services/gamificationService';
import type { Reward, UserPoints } from '../../types';

export function RewardsStore() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [fetchedRewards, points] = await Promise.all([
          gamificationService.getAvailableRewards(),
          gamificationService.getUserPoints(user.uid)
        ]);
        setRewards(fetchedRewards);
        setUserPoints(points);
      } catch (err) {
        setError('Failed to load rewards');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRedeem = async (rewardId: string) => {
    if (!user || redeeming) return;

    setRedeeming(rewardId);
    try {
      const success = await gamificationService.redeemReward(user.uid, rewardId);
      if (success) {
        // Refresh points after redemption
        const points = await gamificationService.getUserPoints(user.uid);
        setUserPoints(points);
        alert('Reward redeemed successfully!');
      }
    } catch (err) {
      setError('Failed to redeem reward');
      console.error(err);
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return <div>Loading rewards...</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{userPoints?.total || 0}</h3>
              <p className="text-gray-600">Available Points</p>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canAfford = (userPoints?.total || 0) >= reward.pointsCost;
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 rounded-xl shadow-sm ${
                !canAfford ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Gift className="w-6 h-6 text-indigo-600" />
                </div>
                {!canAfford && (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <h4 className="text-lg font-semibold mt-4">{reward.title}</h4>
              <p className="text-gray-600 mt-2">{reward.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">{reward.pointsCost} points</span>
                </div>
                <button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!canAfford || redeeming === reward.id}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    canAfford
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  <span>{redeeming === reward.id ? 'Redeeming...' : 'Redeem'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">How to Earn More Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Complete research phases</span>
            </div>
            <p className="text-sm text-gray-500">Earn up to 500 points</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Share resources</span>
            </div>
            <p className="text-sm text-gray-500">Earn up to 100 points</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Help community members</span>
            </div>
            <p className="text-sm text-gray-500">Earn up to 50 points</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}