import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  FileText,
  Database,
  Book,
  Download,
  Share2
} from 'lucide-react';

export default function Resources() {
  const resources = [
    {
      id: '1',
      type: 'paper',
      title: 'Introduction to Research Methods',
      description: 'A comprehensive guide to research methodologies and best practices.',
      author: 'Dr. Sarah Johnson',
      downloads: 1234,
      shares: 456
    },
    {
      id: '2',
      type: 'dataset',
      title: 'Global Climate Data 2020-2023',
      description: 'Comprehensive climate data from weather stations worldwide.',
      author: 'Climate Research Institute',
      downloads: 892,
      shares: 234
    },
    {
      id: '3',
      type: 'book',
      title: 'Advanced Statistical Analysis',
      description: 'In-depth coverage of statistical methods for research.',
      author: 'Prof. Michael Chen',
      downloads: 2341,
      shares: 567
    }
  ];

  const resourceIcons = {
    paper: FileText,
    dataset: Database,
    book: Book
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-gray-900">Research Resources</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover and share valuable research resources. Find papers, datasets,
          and educational materials to support your research journey.
        </p>
      </motion.div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resources by title, author, or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Types</option>
            <option value="paper">Papers</option>
            <option value="dataset">Datasets</option>
            <option value="book">Books</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => {
          const Icon = resourceIcons[resource.type as keyof typeof resourceIcons];
          
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-500">by {resource.author}</p>
                  </div>
                </div>
                <p className="text-gray-600">{resource.description}</p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Share2 className="w-4 h-4" />
                      <span>{resource.shares}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}