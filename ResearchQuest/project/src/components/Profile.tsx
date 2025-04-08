import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { 
  Award, 
  BookOpen, 
  Star, 
  Trophy,
  Briefcase,
  GraduationCap,
  Upload,
  Plus,
  X,
  AlertCircle,
  Users,
  MessageCircle
} from 'lucide-react';
import type { Community } from '../types';

interface UserProfile {
  role: 'Student' | 'Researcher' | 'Mentor' | 'Administrator';
  interests: string[];
  expertise: string[];
  bio: string;
  photoURL?: string;
  updatedAt?: Date;
}

const JoinedCommunitiesSection = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchJoinedCommunities = async () => {
      try {
        const q = query(
          collection(db, 'communities'),
          where('members', 'array-contains', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const joinedCommunities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Community[];
        setCommunities(joinedCommunities);
      } catch (error) {
        console.error('Error fetching joined communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedCommunities();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Joined Communities</h2>
        <Link
          to="/communities/joined"
          className="text-indigo-600 hover:text-indigo-700"
        >
          View All
        </Link>
      </div>
      
      {communities.length === 0 ? (
        <div className="text-center py-6">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">You haven't joined any communities yet</p>
          <Link
            to="/communities"
            className="mt-2 text-indigo-600 hover:text-indigo-700 inline-block"
          >
            Explore Communities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {communities.slice(0, 3).map((community) => (
            <div
              key={community.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-900">{community.name}</h3>
                <p className="text-sm text-gray-600">{community.member_count} members</p>
              </div>
              <Link
                to={`/communities/${community.id}/chat`}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    role: 'Student',
    interests: [],
    expertise: [],
    bio: '',
  });
  const [newInterest, setNewInterest] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile({
            role: data.role || 'Student',
            interests: data.interests || [],
            expertise: data.expertise || [],
            bio: data.bio || '',
            photoURL: data.photoURL,
          });
        } else {
          // Create a new profile document if it doesn't exist
          const initialProfile: UserProfile = {
            role: 'Student',
            interests: [],
            expertise: [],
            bio: '',
            photoURL: user.photoURL || undefined,
            updatedAt: new Date(),
          };
          await setDoc(userRef, initialProfile);
          setProfile(initialProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // Create users collection reference
      const usersRef = collection(db, 'users');
      
      // Prepare the profile data
      const profileData: UserProfile = {
        ...profile,
        updatedAt: new Date(),
      };

      // Save to Firestore
      await setDoc(doc(usersRef, user.uid), profileData);

      // Update profile photo if changed
      if (profile.photoURL && profile.photoURL !== user.photoURL) {
        await updateProfile(user, {
          photoURL: profile.photoURL
        });
      }

      // Show success feedback
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      setProfile(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleRemoveExpertise = (expertise: string) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center -mt-16 space-y-4 sm:space-y-0">
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || ''}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{user?.displayName}</h1>
              <select
                value={profile.role}
                onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value as UserProfile['role'] }))}
                className="mt-2 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Student">Student</option>
                <option value="Researcher">Researcher</option>
                <option value="Mentor">Mentor</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Bio</h2>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="Tell us about yourself and your research interests..."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Research Interests</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
            >
              {interest}
              <button
                onClick={() => handleRemoveInterest(interest)}
                className="ml-2 text-indigo-400 hover:text-indigo-600"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
            placeholder="Add a research interest"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Areas of Expertise</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.expertise.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
            >
              {item}
              <button
                onClick={() => handleRemoveExpertise(item)}
                className="ml-2 text-green-400 hover:text-green-600"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
            placeholder="Add an area of expertise"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddExpertise}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <JoinedCommunitiesSection />

      <div className="flex justify-end">
        <button
          onClick={handleProfileUpdate}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}