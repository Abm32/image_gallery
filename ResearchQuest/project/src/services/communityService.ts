import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  getDoc,
  doc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import type { Community } from '../types';

export const communityService = {
  async fetchCommunities(searchQuery: string = ''): Promise<Community[]> {
    try {
      const communitiesRef = collection(db, 'communities');
      let q = query(communitiesRef);
      
      if (searchQuery) {
        // Case-insensitive search on name and description
        q = query(
          communitiesRef,
          where('searchTerms', 'array-contains', searchQuery.toLowerCase())
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[];
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw new Error('Failed to fetch communities');
    }
  },

  async createCommunity(communityData: Partial<Community>): Promise<string> {
    try {
      // Create searchable terms for the community
      const searchTerms = [
        ...communityData.name?.toLowerCase().split(' ') || [],
        ...communityData.description?.toLowerCase().split(' ') || [],
        ...(communityData.topics || []).map(topic => topic.toLowerCase())
      ];

      const docRef = await addDoc(collection(db, 'communities'), {
        ...communityData,
        searchTerms: Array.from(new Set(searchTerms)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        members: communityData.members || [],
        member_count: communityData.members?.length || 0
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating community:', error);
      throw new Error('Failed to create community');
    }
  },

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    try {
      // First check if the user is already a member
      const communityRef = doc(db, 'communities', communityId);
      const communityDoc = await getDoc(communityRef);
      
      if (!communityDoc.exists()) {
        throw new Error('Community not found');
      }

      const communityData = communityDoc.data();
      if (communityData.members?.includes(userId)) {
        throw new Error('Already a member of this community');
      }

      // Update the community document with transaction to ensure atomicity
      await updateDoc(communityRef, {
        members: arrayUnion(userId),
        member_count: increment(1),
        updatedAt: serverTimestamp()
      });

      // Create a welcome message
      await addDoc(collection(db, 'community_messages'), {
        communityId,
        userId: 'system',
        userName: 'System',
        content: `Welcome to the community!`,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error joining community:', error);
      throw new Error('Failed to join community');
    }
  },

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const communityRef = doc(db, 'communities', communityId);
      const communityDoc = await getDoc(communityRef);
      
      if (!communityDoc.exists()) {
        throw new Error('Community not found');
      }

      await updateDoc(communityRef, {
        members: arrayRemove(userId),
        member_count: increment(-1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error leaving community:', error);
      throw new Error('Failed to leave community');
    }
  },

  async getCommunity(communityId: string): Promise<Community | null> {
    try {
      const docRef = doc(db, 'communities', communityId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Community;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching community:', error);
      throw new Error('Failed to fetch community');
    }
  },

  async getJoinedCommunities(userId: string): Promise<Community[]> {
    try {
      const q = query(
        collection(db, 'communities'),
        where('members', 'array-contains', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[];
    } catch (error) {
      console.error('Error fetching joined communities:', error);
      throw new Error('Failed to fetch joined communities');
    }
  }
};