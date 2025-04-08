import React from 'react';
import { motion } from 'framer-motion';
import { Send, User, Clock } from 'lucide-react';

export function Chat() {
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([
    {
      id: '1',
      user: 'Dr. Sarah Johnson',
      content: 'Has anyone reviewed the latest dataset?',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      user: 'Prof. Michael Chen',
      content: 'Yes, I noticed some interesting patterns in the control group.',
      timestamp: '10:35 AM'
    }
  ]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        user: 'You',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Research Discussion</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 ${
                msg.user === 'You' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div className={`flex-1 ${msg.user === 'You' ? 'text-right' : ''}`}>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{msg.user}</span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {msg.timestamp}
                  </div>
                </div>
                <div
                  className={`mt-1 inline-block px-4 py-2 rounded-lg ${
                    msg.user === 'You'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}