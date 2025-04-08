import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useDispatch } from 'react-redux';
import { setProductKeyStatus } from '../store/slices/userSlice';
import { notify } from '../utils/notifications';

export default function useCheckProductKey() {
  const { currentUser, logout } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkProductKey = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const expirationDate = new Date(userData.productKeyExpirationDate);
          const currentDate = new Date();

          dispatch(setProductKeyStatus({
            valid: currentDate <= expirationDate,
            expirationDate: userData.productKeyExpirationDate
          }));

          if (currentDate > expirationDate) {
            notify.error('Your product key has expired. Please renew to continue using the app.');
            await logout();
          }
        }
      }
    };

    checkProductKey();
  }, [currentUser, logout, dispatch]);
}