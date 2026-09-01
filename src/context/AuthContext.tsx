import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAgent: boolean;
  favorites: string[];
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  authModalState: { isOpen: boolean; mode: 'login' | 'register' | 'forgot' };
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  isFavorite: (propertyId: string) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email list - developer/owner email has full admin privileges
const SUPER_ADMIN_EMAILS = ['thienthanhnguyen0860@gmail.com', 'admin@auraluxury.vn'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  const { success, error, info } = useToast();

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const syncUserProfile = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      const isSuperAdmin = user.email ? SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // If it's a super admin email and role isn't admin yet, elevate it
        if (isSuperAdmin && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() });
          data.role = 'admin';
        }
        setUserProfile(data);
      } else {
        // Create new user profile document
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Khách Hàng Thượng Lưu',
          phone: user.phoneNumber || null,
          photoURL: user.photoURL || null,
          role: isSuperAdmin ? 'admin' : 'user',
          favorites: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          status: 'active',
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
    }
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
        success(`Xin chào, ${result.user.displayName || 'Quý khách'}! Đăng nhập thành công.`);
        closeAuthModal();
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      error(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await syncUserProfile(result.user);
        success('Đăng nhập tài khoản thành công.');
        closeAuthModal();
      }
    } catch (err: any) {
      console.error('Email sign in error:', err);
      let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau.';
      }
      error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        const userRef = doc(db, 'users', result.user.uid);
        const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
        const newProfile: UserProfile = {
          uid: result.user.uid,
          email,
          displayName: name,
          phone: phone || null,
          photoURL: null,
          role: isSuperAdmin ? 'admin' : 'user',
          favorites: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          status: 'active',
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        success('Đăng ký tài khoản thành công. Chào mừng bạn gia nhập AURA Luxury.');
        closeAuthModal();
      }
    } catch (err: any) {
      console.error('Register error:', err);
      let msg = 'Đăng ký không thành công. Vui lòng thử lại.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Mật khẩu phải có ít nhất 6 ký tự.';
      }
      error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      info('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến của bạn.');
      closeAuthModal();
    } catch (err: any) {
      console.error('Reset password error:', err);
      error('Không thể gửi email khôi phục. Vui lòng kiểm tra lại địa chỉ email.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      info('Bạn đã đăng xuất tài khoản an toàn.');
    } catch (err: any) {
      console.error('Sign out error:', err);
      error('Lỗi khi đăng xuất. Vui lòng thử lại.');
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    if (!userProfile || !userProfile.favorites) return false;
    return userProfile.favorites.includes(propertyId);
  };

  const toggleFavorite = async (propertyId: string): Promise<boolean> => {
    if (!currentUser || !userProfile) {
      openAuthModal('login');
      info('Vui lòng đăng nhập để lưu bất động sản vào danh sách yêu thích.');
      return false;
    }

    try {
      const isFav = isFavorite(propertyId);
      const userRef = doc(db, 'users', currentUser.uid);
      const propRef = doc(db, 'properties', propertyId);

      if (isFav) {
        await updateDoc(userRef, {
          favorites: arrayRemove(propertyId),
          updatedAt: serverTimestamp(),
        });
        setUserProfile((prev) =>
          prev ? { ...prev, favorites: prev.favorites.filter((id) => id !== propertyId) } : null
        );
        info('Đã xóa khỏi danh sách bất động sản yêu thích.');
        return false;
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(propertyId),
          updatedAt: serverTimestamp(),
        });
        setUserProfile((prev) =>
          prev ? { ...prev, favorites: [...prev.favorites, propertyId] } : null
        );
        success('Đã lưu bất động sản vào danh mục quan tâm.');
        return true;
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
      error('Không thể cập nhật danh sách yêu thích lúc này.');
      return false;
    }
  };

  const isSuperAdmin = currentUser?.email ? SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) : false;
  const isAdmin = userProfile?.role === 'admin' || isSuperAdmin;
  const isAgent = userProfile?.role === 'agent' || isAdmin;
  const favorites = userProfile?.favorites || [];
  const authModalState = {
    isOpen: isAuthModalOpen,
    mode: authModalMode,
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isSuperAdmin,
        isAgent,
        favorites,
        isAuthModalOpen,
        authModalMode,
        authModalState,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        toggleFavorite,
        isFavorite,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
