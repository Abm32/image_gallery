import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Star, Download } from 'lucide-react';

export function EvaluationPhase() {
  const achievements = [
    {
      id: '1',
      title: 'Research Completed',
      description: 'Successfully completed all research phases',
      icon: CheckCircle
    },
    {
      id: '2',
      title: 'Expert Reviewer',
      description: 'Received positive peer reviews',
      icon: Award
    },
    {
      id: '3',
      title: 'Top Contributor',
      description: 'Among top 10% of researchers',
      icon: Star
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">Research Evaluation</h2>
        <p className="text-gray-600">
          Review your research achievements and prepare for publication.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-sm text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 360]
          }}
          transition={{ duration: 1 }}
          className="inline-block"
        >
          <Award className="w-16 h-16 text-indigo-600 mx-auto" />
        </motion.div>
        <h3 className="text-2xl font-bold mt-4">Congratulations!</h3>
        <p className="text-gray-600 mt-2">
          You've successfully completed your research journey.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm text-center"
          >
            <achievement.icon className="w-12 h-12 text-indigo-600 mx-auto" />
            <h4 className="text-lg font-semibold mt-4">{achievement.title}</h4>
            <p className="text-gray-600 mt-2">{achievement.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-center space-x-2 p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Research Report</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-2 p-4 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
            <Star className="w-5 h-5" />
            <span>Submit for Publication</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}