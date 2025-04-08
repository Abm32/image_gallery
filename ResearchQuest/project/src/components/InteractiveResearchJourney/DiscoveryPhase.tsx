import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Lightbulb, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Star,
  Users,
  MessageCircle,
  Hash
} from 'lucide-react';

export function DiscoveryPhase() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState<string | null>(null);
  const [activeFilter, setActiveFilter] = React.useState('all');

  const suggestions = [
    {
      id: '1',
      title: 'Machine Learning',
      description: 'Explore artificial intelligence and machine learning algorithms.',
      relevance: 95,
      color: 'from-purple-500 to-indigo-500',
      keywords: ['AI', 'Neural Networks', 'Deep Learning'],
      researchers: 1234,
      discussions: 456,
      trending: true,
      category: 'technology'
    },
    {
      id: '2',
      title: 'Data Science',
      description: 'Analyze and interpret complex data sets.',
      relevance: 88,
      color: 'from-blue-500 to-cyan-500',
      keywords: ['Big Data', 'Analytics', 'Statistics'],
      researchers: 987,
      discussions: 234,
      trending: true,
      category: 'technology'
    },
    {
      id: '3',
      title: 'Cognitive Psychology',
      description: 'Study mental processes and human behavior.',
      relevance: 82,
      color: 'from-green-500 to-teal-500',
      keywords: ['Memory', 'Perception', 'Learning'],
      researchers: 567,
      discussions: 123,
      trending: false,
      category: 'psychology'
    },
    {
      id: '4',
      title: 'Climate Change',
      description: 'Research environmental impacts and solutions.',
      relevance: 78,
      color: 'from-orange-500 to-red-500',
      keywords: ['Environment', 'Global Warming', 'Sustainability'],
      researchers: 789,
      discussions: 345,
      trending: true,
      category: 'environmental'
    },
    {
      id: '5',
      title: 'Quantum Computing',
      description: 'Explore quantum mechanics and computation.',
      relevance: 75,
      color: 'from-pink-500 to-rose-500',
      keywords: ['Quantum Mechanics', 'Computing', 'Physics'],
      researchers: 432,
      discussions: 167,
      trending: false,
      category: 'physics'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Topics' },
    { id: 'technology', label: 'Technology' },
    { id: 'psychology', label: 'Psychology' },
    { id: 'environmental', label: 'Environmental' },
    { id: 'physics', label: 'Physics' }
  ];

  const filteredSuggestions = suggestions
    .filter(suggestion => {
      const matchesSearch = 
        suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesFilter = activeFilter === 'all' || suggestion.category === activeFilter;
      return matchesSearch && matchesFilter;
    });

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    // Additional logic for topic selection
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search research topics or keywords..."
          className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
      </motion.div>

      <div className="flex items-center justify-start space-x-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors
              ${activeFilter === filter.id
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={searchQuery + activeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="group relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => handleTopicSelect(suggestion.title)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${suggestion.color} opacity-5 group-hover:opacity-10 transition-opacity rounded-xl`} />
              <div className="flex items-start space-x-4">
                <div className={`p-3 bg-gradient-to-br ${suggestion.color} rounded-xl`}>
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                        {suggestion.trending && (
                          <span className="flex items-center space-x-1 px-2 py-1 bg-rose-100 text-rose-600 rounded-full text-xs">
                            <TrendingUp className="w-3 h-3" />
                            <span>Trending</span>
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-indigo-600 font-medium">
                        {suggestion.relevance}% match
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {suggestion.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        <Hash className="w-3 h-3" />
                        <span>{keyword}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{suggestion.researchers.toLocaleString()} researchers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{suggestion.discussions} discussions</span>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 group">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredSuggestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No research topics found matching your search.</p>
          <div className="mt-4 space-x-4">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Clear search
              </button>
            )}
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Show all topics
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}