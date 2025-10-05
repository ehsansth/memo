export type AppRole = "CAREGIVER" | "PATIENT";

export type PatientDoc = {
  caregiverSub: string;
  patientSub?: string | null;
  displayName: string;
  createdAt: Date;
};

export type Memory = {
  id: string;
  caregiverSub: string;
  patientId: string;
  title: string;
  imageUrl: string; // base64 data URL stored in Firestore
  personName?: string | null;
  eventName?: string | null;
  placeName?: string | null;
  dateLabel?: string | null;
  captionAI?: string | null;
  tagsAI?: string | null;
  embedding?: number[] | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MemoryDoc = Omit<Memory, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt?: Date;
};

export type InviteDoc = {
  token: string;
  caregiverSub: string;
  targetRole: AppRole;
  patientId?: string | null;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
};

export type UserRoleDoc = {
  role: AppRole;
  createdAt: Date;
  updatedAt?: Date;
};

export type LinkDoc = {
  caregiverSub: string;
  patientSub: string;
  createdAt: Date;
};

export type SessionQuestion = {
  id: string;
  memoryId: string;
  prompt: string;
  hint: string;
  options: [string, string, string];
  imageUrl: string;
};
