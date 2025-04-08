import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Award } from 'lucide-react';

export function PointsDisplay() {
  const [points, setPoints] = React.useState(1250);
  const [level, setLevel] = React.useState(5);
  const [nextLevelPoints, setNextLevelPoints] = React.useState(2000);

  const progress = (points / nextLevelPoints) * 100;

  const recentActivities = [
    { id: '1', action: 'Completed Research Phase', points: 500 },
    { id: '2', action: 'Shared Resource', points: 100 },
    { id: '3', action: 'Helped Community Member', points: 50 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Trophy className="w-8 h-8 text-indigo-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{points} Points</h3>
              <p className="text-gray-600">Level {level} Researcher</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Next Level</p>
            <p className="text-lg font-semibold text-indigo-600">
              {nextLevelPoints - points} points needed
            </p>
          </div>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
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
          <h3 className="text-lg font-semibold">Recent Activities</h3>
        </div>
        <div className="divide-y">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-gray-900">{activity.action}</span>
              <span className="text-indigo-600 font-semibold">
                +{activity.points} pts
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}