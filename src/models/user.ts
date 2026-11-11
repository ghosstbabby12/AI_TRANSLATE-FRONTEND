export type InterfaceLanguage = "es" | "en";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interfaceLanguage: InterfaceLanguage;
  /** Profile photo (temporary signed URL); null when there is none. */
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileChanges {
  name?: string;
  email?: string;
  phone?: string | null;
  interfaceLanguage?: InterfaceLanguage;
  /** Required only when the email changes. */
  currentPassword?: string;
}

export interface Session {
  token: string;
  user: User;
}
