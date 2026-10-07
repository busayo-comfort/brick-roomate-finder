import React, { createContext, useContext, useEffect, useState } from "react";
import { api, type ApiUser, type SeekerProfile } from "../lib/api";
import {
  EMPTY_SESSION,
  invalidateSession,
  loadSession,
  primeSession,
  type SessionState,
} from "../lib/session";

export type FrontendUser = Omit<ApiUser, "name" | "image"> & SeekerProfile & {
  type: "student";
  name: string;
  gender?: "male" | "female";
  budget?: number;
  moveInDate?: string;
  preferences?: string[];
  image?: string;
};

/** Accepts a raw API user or an already-mapped one, so updates can re-map in place. */
type UserLike = Omit<ApiUser, "image"> & { image?: string | null };

const toUser = (user: UserLike, profile: SeekerProfile = {}): FrontendUser => ({
  ...user,
  ...profile,
  name: profile.name ?? user.name ?? "",
  type: "student",
  gender: profile.genderPreference || undefined,
  budget: profile.budgetMax ?? profile.budgetMin ?? undefined,
  moveInDate: profile.moveInDate || undefined,
  preferences: profile.lifestyleTags || [],
  image: user.image || undefined,
});

const fromSession = (session: SessionState): FrontendUser | null =>
  session.user ? toUser(session.user, session.profile ?? {}) : null;

interface AuthContextType {
  currentUser: FrontendUser | null;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<FrontendUser>;
  signUpWithPassword: (email: string, password: string) => Promise<FrontendUser>;
  signInWithPassword: (email: string, password: string) => Promise<FrontendUser>;
  completeOnboarding: (userType: "seeker" | "landlord") => Promise<void>;
  isProfileComplete: boolean;
  /** 0-100 from the API, or 0 until a seeker profile has loaded. */
  completeness: number;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<SeekerProfile>) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
  /** Re-reads the session from the API, e.g. after a password is set. */
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialSession?: SessionState;
}> = ({ children, initialSession = EMPTY_SESSION }) => {
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(() =>
    fromSession(initialSession),
  );
  // A resolved session needs no client round trip, so the first paint is
  // already the real UI instead of a spinner.
  const [authReady, setAuthReady] = useState(initialSession.resolved);

  useEffect(() => {
    if (initialSession.resolved) return;
    let active = true;
    void loadSession().then((session) => {
      if (!active) return;
      setCurrentUser(fromSession(session));
      setAuthReady(true);
    });
    return () => {
      active = false;
    };
  }, [initialSession.resolved]);

  /** Shared tail of every sign-in path. */
  const establish = async (user: ApiUser): Promise<FrontendUser> => {
    const profile =
      user.userType === "seeker" ? await api.getProfile().catch(() => ({}) as SeekerProfile) : {};
    const nextUser = toUser(user, profile);
    setCurrentUser(nextUser);
    setAuthReady(true);
    primeSession({ user, profile, resolved: true });
    return nextUser;
  };

  const verifyOtp = async (email: string, code: string) => {
    const { user } = await api.verifyOtp(email, code);
    return establish(user);
  };

  const signUpWithPassword = async (email: string, password: string) => {
    const { user } = await api.passwordSignup(email, password);
    return establish(user);
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { user } = await api.passwordLogin(email, password);
    return establish(user);
  };

  const logout = async () => {
    await api.logout().catch(() => undefined);
    setCurrentUser(null);
    invalidateSession();
  };

  const completeOnboarding = async (userType: "seeker" | "landlord") => {
    await api.onboarding(userType);
    setCurrentUser((user) => (user ? { ...user, userType } : user));
    invalidateSession();
  };

  const updateProfile = async (updates: Partial<SeekerProfile>) => {
    const profile = await api.updateProfile(updates);
    setCurrentUser((user) => (user ? { ...user, ...toUser(user, profile) } : user));
    invalidateSession();
  };

  const uploadPhoto = async (file: File) => {
    const { url } = await api.uploadPhoto(file);
    setCurrentUser((user) => (user ? { ...user, image: url } : user));
    invalidateSession();
    return url;
  };

  const refreshSession = async () => {
    invalidateSession();
    const session = await loadSession();
    setCurrentUser(fromSession(session));
    setAuthReady(true);
  };

  const refreshProfile = async () => {
    if (!currentUser || currentUser.userType !== "seeker") return;
    const profile = await api.getProfile();
    setCurrentUser((user) => (user ? { ...user, ...toUser(user, profile) } : user));
  };

  const isProfileComplete =
    currentUser?.userType === "seeker" &&
    Boolean(currentUser.name.trim()) &&
    Boolean(currentUser.university?.trim());

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        requestOtp: async (email) => {
          await api.requestOtp(email);
        },
        verifyOtp,
        signUpWithPassword,
        signInWithPassword,
        completeOnboarding,
        isProfileComplete,
        completeness: currentUser?.completeness ?? 0,
        logout,
        updateProfile,
        uploadPhoto,
        refreshProfile,
        refreshSession,
        isAuthenticated: !!currentUser,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
