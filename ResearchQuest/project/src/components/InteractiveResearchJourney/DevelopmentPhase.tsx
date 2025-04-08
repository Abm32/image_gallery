import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, FileSpreadsheet, BarChart2, Share2 } from 'lucide-react';

export function DevelopmentPhase() {
  const [progress, setProgress] = React.useState(45);
  const milestones = [
    { id: '1', title: 'Data Collection', progress: 80 },
    { id: '2', title: 'Data Analysis', progress: 60 },
    { id: '3', title: 'Initial Findings', progress: 30 },
    { id: '4', title: 'Peer Review', progress: 10 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">Research Development</h2>
        <p className="text-gray-600">
          Track your research progress and analyze your findings.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <LineChart className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold">Overall Progress</h3>
          </div>
          <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-indigo-600"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
              <span className="text-indigo-600 font-medium">{milestone.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${milestone.progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-indigo-600"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          <span>Upload Data</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          <span>Analyze Results</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <Share2 className="w-5 h-5 text-indigo-600" />
          <span>Share Progress</span>
        </motion.button>
      </div>
    </div>
  );
}