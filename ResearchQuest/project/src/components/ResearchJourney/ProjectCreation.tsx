import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { researchService } from '../../services/researchService';

interface ProjectCreationProps {
  onProjectCreated: () => void;
}

export function ProjectCreation({ onProjectCreated }: ProjectCreationProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await researchService.createProject(user.uid, {
        title,
        description,
        collaborators,
        phase: 'discovery',
        status: 'active',
        progress: 0
      });

      setTitle('');
      setDescription('');
      setCollaborators([]);
      onProjectCreated();
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = () => {
    if (newCollaborator.trim() && !collaborators.includes(newCollaborator.trim())) {
      setCollaborators([...collaborators, newCollaborator.trim()]);
      setNewCollaborator('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <h2 className="text-2xl font-bold mb-6">Create New Research Project</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter project title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe your research project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collaborators
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {collaborators.map((collaborator) => (
              <span
                key={collaborator}
                className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
              >
                {collaborator}
                <button
                  type="button"
                  onClick={() => setCollaborators(collaborators.filter(c => c !== collaborator))}
                  className="ml-2 text-indigo-400 hover:text-indigo-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={newCollaborator}
              onChange={(e) => setNewCollaborator(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter collaborator email"
            />
            <button
              type="button"
              onClick={handleAddCollaborator}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}