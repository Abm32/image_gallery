import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Lock, ChevronRight } from 'lucide-react';

export function Rewards() {
  const [points, setPoints] = React.useState(1250);
  
  const rewards = [
    {
      id: '1',
      title: 'Premium Research Tools',
      description: 'Access to advanced research and analysis tools',
      points: 1000,
      icon: Star,
      available: true
    },
    {
      id: '2',
      title: 'Conference Ticket',
      description: 'Free ticket to upcoming research conference',
      points: 2000,
      icon: Gift,
      available: false
    },
    {
      id: '3',
      title: 'Mentorship Session',
      description: '1-hour mentorship with leading researcher',
      points: 1500,
      icon: Star,
      available: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">Research Rewards</h2>
        <p className="text-gray-600">
          Redeem your points for exclusive research benefits and opportunities.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{points}</h3>
              <p className="text-gray-600">Available Points</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Earn More Points
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white p-6 rounded-xl shadow-sm ${
              !reward.available ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <reward.icon className="w-6 h-6 text-indigo-600" />
              </div>
              {!reward.available && (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h4 className="text-lg font-semibold mt-4">{reward.title}</h4>
            <p className="text-gray-600 mt-2">{reward.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{reward.points} points</span>
              </div>
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  reward.available
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                } transition-colors`}
                disabled={!reward.available}
              >
                <span>Redeem</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">How to Earn Points</h3>
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