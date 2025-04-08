import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, ChevronUp, User } from 'lucide-react';

export function Leaderboard() {
  const researchers = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      points: 2500,
      rank: 1,
      institution: 'Stanford University',
      trend: 'up'
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      points: 2350,
      rank: 2,
      institution: 'MIT',
      trend: 'up'
    },
    {
      id: '3',
      name: 'Dr. Emily Brown',
      points: 2200,
      rank: 3,
      institution: 'Harvard University',
      trend: 'down'
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">Research Leaderboard</h2>
        <p className="text-gray-600">
          Top performing researchers based on contributions and achievements.
        </p>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 bg-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Global Rankings</h3>
              <p className="text-indigo-200 mt-1">Updated in real-time</p>
            </div>
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="divide-y">
          {researchers.map((researcher, index) => (
            <motion.div
              key={researcher.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 flex items-center space-x-4 hover:bg-gray-50"
            >
              <div className="flex-shrink-0 w-12 text-center">
                {getRankIcon(researcher.rank) || (
                  <span className="text-xl font-bold text-gray-600">
                    {researcher.rank}
                  </span>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {researcher.name}
                </h4>
                <p className="text-gray-600">{researcher.institution}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">
                  {researcher.points}
                </p>
                <p className="text-sm text-gray-600">points</p>
              </div>
              <div className="flex-shrink-0">
                {researcher.trend === 'up' ? (
                  <ChevronUp className="w-6 h-6 text-green-500" />
                ) : (
                  <ChevronUp className="w-6 h-6 text-red-500 transform rotate-180" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Top Institutions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Stanford University</span>
              <span className="text-indigo-600 font-semibold">12,500 pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900">MIT</span>
              <span className="text-indigo-600 font-semibold">11,200 pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Harvard University</span>
              <span className="text-indigo-600 font-semibold">10,800 pts</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Research Fields</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Machine Learning</span>
              <span className="text-indigo-600 font-semibold">8,200 pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Quantum Computing</span>
              <span className="text-indigo-600 font-semibold">7,500 pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Climate Science</span>
              <span className="text-indigo-600 font-semibold">6,800 pts</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Publications</span>
                <span>85%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Collaborations</span>
                <span>70%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '70%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Citations</span>
                <span>60%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}