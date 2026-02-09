import { auth, db } from "@/configs/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserData {
  name: string;
  surname: string;
  avatar: string; // URL or local asset name
  phoneNumber: string;
  myList: Movie[];
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (phone: string, pass: string) => Promise<void>;
  signUp: (phone: string, pass: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  addToMyList: (movie: Movie) => Promise<void>;
  removeFromMyList: (movieId: number) => Promise<void>;
  isInMyList: (movieId: number) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Subscribe to user data in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const unsubUserData = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          } else {
            // User exists in Auth but not Firestore (e.g. just signed up, or error)
            setUserData(null);
          }
          setLoading(false);
        });
        return () => unsubUserData();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatEmail = (phone: string) => `${phone}@pleura.app`;

  const signIn = async (phone: string, pass: string) => {
    if (!phone || !pass) throw new Error("Please enter phone and password");
    const email = formatEmail(phone.replace(/\s/g, ""));
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (phone: string, pass: string) => {
    if (!phone || !pass) throw new Error("Please enter phone and password");
    const email = formatEmail(phone.replace(/\s/g, ""));
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      pass,
    );

    // Initialize user profile in Firestore
    await setDoc(doc(db, "users", newUser.uid), {
      phoneNumber: phone,
      name: "",
      surname: "",
      avatar: "",
      myList: [],
      createdAt: new Date().toISOString(),
    });
  };

  const continueAsGuest = async () => {
    const { user: guestUser } = await signInAnonymously(auth);

    // Generate random avatar ID (1-12 based on available avatar images)
    const randomAvatarId = Math.floor(Math.random() * 12) + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    await setDoc(doc(db, "users", guestUser.uid), {
      phoneNumber: "",
      name: `Guest ${randomSuffix}`,
      surname: "",
      avatar: `avatar_${randomAvatarId}`, // Store avatar ID reference
      myList: [],
      isGuest: true,
      createdAt: new Date().toISOString(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    // Use setDoc with merge to create doc if it doesn't exist
    await setDoc(userRef, data, { merge: true });
  };

  const addToMyList = async (movie: Movie) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    // Use setDoc with merge to handle case where doc doesn't exist
    await setDoc(
      userRef,
      {
        myList: arrayUnion(movie),
      },
      { merge: true },
    );
  };

  const removeFromMyList = async (movieId: number) => {
    if (!user || !userData) return;
    const movieToRemove = userData.myList.find((m) => m.id === movieId);
    if (!movieToRemove) return;

    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        myList: arrayRemove(movieToRemove),
      },
      { merge: true },
    );
  };

  const isInMyList = (movieId: number) => {
    return userData?.myList?.some((m) => m.id === movieId) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signIn,
        signUp,
        continueAsGuest,
        logout,
        updateUserProfile,
        addToMyList,
        removeFromMyList,
        isInMyList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
