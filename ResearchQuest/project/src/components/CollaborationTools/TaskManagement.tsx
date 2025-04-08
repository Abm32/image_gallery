import React from 'react';
import { motion } from 'framer-motion';
import { Plus, User, Calendar } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: string;
}

const getPriorityIcon = (priority: Task['priority']) => {
  const colors = {
    low: 'text-green-500',
    medium: 'text-yellow-500', 
    high: 'text-red-500'
  };

  return (
    <div className={`flex items-center ${colors[priority]}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      <span className="ml-2 text-sm capitalize">{priority}</span>
    </div>
  );
};

export default function TaskManagement() {
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Research Project Plan',
      description: 'Create initial research project plan and timeline',
      status: 'todo',
      priority: 'high',
      assignedTo: 'John Doe',
      dueDate: '2024-02-01'
    },
    // Add more sample tasks as needed
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-600 mt-2">
            Track and manage research tasks with your team.
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['todo', 'in_progress', 'completed'].map((status, columnIndex) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: columnIndex * 0.1 }}
            className="bg-white rounded-xl shadow-sm"
          >
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold capitalize">
                {status.replace('_', ' ')}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {tasks
                .filter((task) => task.status === status)
                .map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">
                          {task.description}
                        </p>
                      </div>
                      {getPriorityIcon(task.priority)}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
