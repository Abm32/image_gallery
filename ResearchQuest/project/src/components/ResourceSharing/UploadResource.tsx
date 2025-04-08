import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Tag, Link as LinkIcon } from 'lucide-react';

export function UploadResource() {
  const [resourceType, setResourceType] = React.useState('paper');
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState('');

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">Share Resource</h2>
        <p className="text-gray-600">
          Share your research papers, datasets, or educational materials with the
          community.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-sm"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="paper">Research Paper</option>
              <option value="dataset">Dataset</option>
              <option value="educational">Educational Material</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter resource title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe your resource..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-indigo-400 hover:text-indigo-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tags (press Enter)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource URL (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5 text-gray-400" />
              <input
                type="url"
                placeholder="https://"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Drag and drop your file here, or{' '}
                <button className="text-indigo-600 hover:text-indigo-700">
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Maximum file size: 50MB
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Upload Resource
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}