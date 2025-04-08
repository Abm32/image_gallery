import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle,
  Clock,
  Tag,
  AlertCircle
} from 'lucide-react';

export function DesignPhase() {
  const [tasks, setTasks] = React.useState([
    { 
      id: '1', 
      title: 'Define Research Question', 
      completed: false,
      priority: 'high',
      dueDate: '2024-03-15',
      assignedTo: 'Dr. Sarah Johnson'
    },
    { 
      id: '2', 
      title: 'Literature Review', 
      completed: false,
      priority: 'medium',
      dueDate: '2024-03-20',
      assignedTo: 'Prof. Michael Chen'
    },
    { 
      id: '3', 
      title: 'Methodology Selection', 
      completed: false,
      priority: 'high',
      dueDate: '2024-03-25',
      assignedTo: 'You'
    },
    { 
      id: '4', 
      title: 'Data Collection Plan', 
      completed: false,
      priority: 'medium',
      dueDate: '2024-03-30',
      assignedTo: 'Team'
    }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">Research Design</h2>
        <p className="text-gray-600">
          Plan your research methodology and approach.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold">Research Tasks</h3>
            </div>
            <span className="text-sm text-gray-500">
              {tasks.filter(t => t.completed).length}/{tasks.length} completed
            </span>
          </div>
          <div className="space-y-4">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{task.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold">Timeline</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Start Date</span>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">End Date</span>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Tag className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold">Research Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Quantitative', 'Experimental', 'Data Analysis', 'Survey'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold">Important Notes</h3>
            </div>
            <textarea
              placeholder="Add important notes about your research methodology..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end space-x-4"
      >
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Save Draft
        </button>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Continue to Development
        </button>
      </motion.div>
    </div>
  );
}