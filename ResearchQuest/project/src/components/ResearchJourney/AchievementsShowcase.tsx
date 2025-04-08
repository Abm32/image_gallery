import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Lock, Trophy, Medal } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { gamificationService } from '../../services/gamificationService';
import type { UserAchievement } from '../../types';

export function AchievementsShowcase() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        const userAchievements = await gamificationService.getUserAchievements(user.uid);
        setAchievements(userAchievements);
      } catch (err) {
        setError('Failed to load achievements');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return Award;
      case 'milestone':
        return Trophy;
      case 'reward':
        return Medal;
      default:
        return Star;
    }
  };

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900">Research Achievements</h2>
        <p className="text-gray-600 mt-2">Track your research milestones and accomplishments</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => {
          const Icon = getAchievementIcon(achievement.type);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Earned on {achievement.earnedAt.toLocaleDateString()}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">Upcoming Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Research Pioneer',
              description: 'Complete your first research project',
              progress: 75
            },
            {
              title: 'Collaboration Master',
              description: 'Collaborate with 5 different researchers',
              progress: 40
            }
          ].map((achievement, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg flex items-start space-x-4"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{achievement.progress}% completed</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}