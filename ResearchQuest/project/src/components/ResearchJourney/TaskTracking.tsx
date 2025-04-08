import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, User, Calendar } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { researchService } from '../../services/researchService';
import type { ResearchTask } from '../../types';

interface TaskTrackingProps {
  projectId: string;
}

export function TaskTracking({ projectId }: TaskTrackingProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: ''
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const projectTasks = await researchService.getProjectTasks(projectId);
        setTasks(projectTasks);
      } catch (err) {
        setError('Failed to load tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const taskId = await researchService.addTask(projectId, {
        ...newTask,
        assignedTo: user.uid,
        dueDate: new Date(newTask.dueDate),
        status: 'todo'
      });

      const newTaskData = await researchService.getProjectTasks(projectId);
      setTasks(newTaskData);
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
    } catch (err) {
      setError('Failed to add task');
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    try {
      await researchService.updateTask(taskId, { status });
      const updatedTasks = await researchService.getProjectTasks(projectId);
      setTasks(updatedTasks);
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['todo', 'in_progress', 'completed'].map((status) => (
          <div key={status} className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-medium mb-4 capitalize">
              {status.replace('_', ' ')}
            </h3>
            <div className="space-y-4">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{task.dueDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>You</span>
                        </div>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                        className="text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold mb-4">Add New Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}