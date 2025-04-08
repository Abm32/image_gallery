import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  increment,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import type { UserAchievement, UserPoints, Reward } from '../types';

export const gamificationService = {
  // Award points to a user
  async awardPoints(userId: string, amount: number, description: string): Promise<void> {
    const userPointsRef = doc(db, 'points', userId);
    
    await updateDoc(userPointsRef, {
      total: increment(amount),
      history: arrayUnion({
        id: crypto.randomUUID(),
        amount,
        type: 'earned',
        description,
        timestamp: serverTimestamp()
      })
    });
  },

  // Get user's points
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    const docRef = doc(db, 'points', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { userId, ...docSnap.data() } as UserPoints : null;
  },

  // Award an achievement to a user
  async awardAchievement(userId: string, achievement: Partial<UserAchievement>): Promise<void> {
    const achievementData = {
      userId,
      earnedAt: serverTimestamp(),
      ...achievement
    };

    await updateDoc(doc(db, 'users', userId), {
      achievements: arrayUnion(achievementData)
    });
  },

  // Get user's achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().achievements || [] : [];
  },

  // Get available rewards
  async getAvailableRewards(): Promise<Reward[]> {
    const querySnapshot = await getDocs(collection(db, 'rewards'));
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as Reward)
      .filter(reward => reward.available);
  },

  // Redeem a reward
  async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    const rewardRef = doc(db, 'rewards', rewardId);
    const userPointsRef = doc(db, 'points', userId);
    
    const rewardDoc = await getDoc(rewardRef);
    const userPointsDoc = await getDoc(userPointsRef);
    
    if (!rewardDoc.exists() || !userPointsDoc.exists()) {
      return false;
    }

    const reward = rewardDoc.data() as Reward;
    const userPoints = userPointsDoc.data() as UserPoints;

    if (userPoints.total < reward.pointsCost) {
      return false;
    }

    // Deduct points and record transaction
    await updateDoc(userPointsRef, {
      total: increment(-reward.pointsCost),
      history: arrayUnion({
        id: crypto.randomUUID(),
        amount: -reward.pointsCost,
        type: 'spent',
        description: `Redeemed reward: ${reward.title}`,
        timestamp: serverTimestamp()
      })
    });

    return true;
  }
};