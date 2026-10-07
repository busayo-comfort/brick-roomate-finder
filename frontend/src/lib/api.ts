const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export type UserType = "seeker" | "landlord" | null;

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  userType: UserType;
  emailVerified?: boolean;
  /** Whether a password is set — OTP-only accounts have none yet. */
  hasPassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type Cleanliness = "very-clean" | "average" | "messy";
export type SleepSchedule = "early-bird" | "night-owl" | "flexible";
export type StudyHabits = "quiet" | "group" | "library" | "any";

export interface SeekerProfile {
  name?: string | null;
  university?: string | null;
  hasApartment?: boolean;
  location?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  moveInDate?: string | null;
  duration?: "short" | "long" | "flexible" | null;
  genderPreference?: "male" | "female" | null;
  occupation?: string | null;
  bio?: string | null;
  lifestyleTags?: string[];
  cleanliness?: Cleanliness | null;
  sleepSchedule?: SleepSchedule | null;
  studyHabits?: StudyHabits | null;
  /** 0-100, computed by the API from the scored profile fields. */
  completeness?: number;
}

export interface Match {
  user: ApiUser & SeekerProfile;
  compatibilityScore: number;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt?: string;
  /** Both parties arrive with their seeker profile flattened in; no email until accepted. */
  requester?: Pick<ApiUser, "id" | "name" | "image"> & SeekerProfile;
  receiver?: Pick<ApiUser, "id" | "name" | "image"> & SeekerProfile;
}

/** `GET /connections/:id` — `otherUser.email` is only present once accepted. */
export interface ConnectionDetail {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt?: string;
  updatedAt?: string;
  contactRevealed: boolean;
  otherUser: Pick<ApiUser, "id" | "name" | "image"> & SeekerProfile & { email?: string };
}

export interface BlockedEntry {
  id: string;
  createdAt: string;
  user: Pick<ApiUser, "id" | "name" | "image">;
}

export interface University {
  id: string;
  name: string;
}

type ApiEnvelope<T> = { status?: string; message?: string; data: T };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Let the browser set the multipart boundary itself for FormData bodies.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: isFormData
      ? { ...(options.headers || {}) }
      : { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & {
    message?: string | string[];
  };
  if (!response.ok) {
    const message = Array.isArray(payload.message) ? payload.message.join(" ") : payload.message;
    throw new ApiError(message || "Something went wrong. Please try again.", response.status);
  }
  return payload.data;
}

const json = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export const api = {
  requestOtp: (email: string) => request<{ message: string }>("/auth/otp/request", json({ email })),
  verifyOtp: (email: string, code: string) =>
    request<{ user: ApiUser }>("/auth/otp/verify", json({ email, code })),
  session: () => request<ApiUser | null>("/auth/session"),
  me: () => request<ApiUser>("/auth/me"),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  logoutAll: () => request<void>("/auth/logout-all", { method: "POST" }),

  // Password auth (documented in backend/README.md, previously unwired)
  passwordSignup: (email: string, password: string) =>
    request<{ user: ApiUser }>("/auth/password/signup", json({ email, password })),
  passwordLogin: (email: string, password: string) =>
    request<{ user: ApiUser }>("/auth/password/login", json({ email, password })),
  setPassword: (password: string) =>
    request<{ success: boolean }>("/auth/password/set", {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>("/auth/password/update", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  onboarding: (userType: "seeker" | "landlord") =>
    request<{ userType: UserType }>("/auth/onboarding", {
      method: "PATCH",
      body: JSON.stringify({ userType }),
    }),
  universities: () => request<University[]>("/universities"),
  getProfile: () => request<SeekerProfile>("/profile/seeker"),
  updateProfile: (profile: Partial<SeekerProfile>) =>
    request<SeekerProfile>("/profile/seeker", { method: "PUT", body: JSON.stringify(profile) }),
  matches: (page = 1, limit = 20) =>
    request<{
      data: Match[];
      meta: { page: number; limit: number; total: number; totalPages?: number };
    }>(`/matches?page=${page}&limit=${limit}`),
  connections: (direction: "incoming" | "outgoing") =>
    request<Connection[]>(`/connections/${direction}`),
  sendConnection: (receiverId: string) => request<Connection>("/connections", json({ receiverId })),
  acceptConnection: (id: string) =>
    request<Connection>(`/connections/${id}/accept`, { method: "PUT" }),
  rejectConnection: (id: string) =>
    request<Connection>(`/connections/${id}/reject`, { method: "PUT" }),
  withdrawConnection: (id: string) =>
    request<Connection>(`/connections/${id}/withdraw`, { method: "PUT" }),
  connection: (id: string) => request<ConnectionDetail>(`/connections/${id}`),

    // Messages
  getConversations: () => request<{
    id: string;
    userId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserImage: string;
    lastMessage: string;
    lastMessageTime: number;
    unreadCount: number;
  }[]>("/messages/conversations"),

  getMessages: (connectionId: string) => request<{
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    read: boolean;
    createdAt: string;
    sender: { id: string; name: string; image: string | null };
    recipient: { id: string; name: string; image: string | null };
  }[]>(`/messages/${connectionId}`),

  sendMessage: (connectionId: string, content: string) =>
    request<{
      id: string;
      senderId: string;
      recipientId: string;
      content: string;
      createdAt: string;
    }>("/messages", { method: "POST", body: JSON.stringify({ connectionId, content }) }),

  markMessageRead: (messageId: string) =>
    request<void>(`/messages/${messageId}/read`, { method: "PUT" }),
  
  // Blocking
  blockedUsers: () => request<BlockedEntry[]>("/block"),
  blockUser: (userId: string) =>
    request<{ success: boolean }>(`/block/${userId}`, { method: "POST" }),
  unblockUser: (userId: string) =>
    request<{ success: boolean }>(`/block/${userId}`, { method: "DELETE" }),

  // Reporting
  reportUser: (reportedId: string, reason: string) =>
    request<{ id: string; createdAt: string }>("/report", json({ reportedId, reason })),

  // Profile photo
  uploadPhoto: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ url: string }>("/profile/photo", { method: "POST", body });
  },
};

export { API_URL };
