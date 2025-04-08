import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from 'firebase/firestore';
import { Send, User, ArrowLeft } from 'lucide-react';
import type { Community } from '../types';

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: any;
}

export default function CommunityChat() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!communityId) return;

    // Fetch community details
    const fetchCommunity = async () => {
      try {
        const docRef = doc(db, 'communities', communityId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCommunity({ id: docSnap.id, ...docSnap.data() } as Community);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching community:', error);
        setLoading(false);
      }
    };

    fetchCommunity();

    // Set up real-time messages listener
    const q = query(
      collection(db, 'community_messages'),
      where('communityId', '==', communityId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [communityId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !communityId) return;

    try {
      await addDoc(collection(db, 'community_messages'), {
        content: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        communityId,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Community not found</p>
        <button
          onClick={() => navigate('/communities')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Return to Communities
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/communities')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">{community.name}</h2>
              <p className="text-sm text-gray-600">{community.member_count} members</p>
            </div>
          </div>
        </div>

        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start space-x-3 ${
                  message.userId === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className={`flex flex-col ${message.userId === user?.uid ? 'items-end' : ''}`}>
                  <span className="text-sm text-gray-600">{message.userName}</span>
                  <div
                    className={`mt-1 px-4 py-2 rounded-lg ${
                      message.userId === user?.uid
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}