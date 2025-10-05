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

export type QuizResponseDoc = {
  questionId: string;
  memoryId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  chosenIndex: number | null;
  correct: boolean;
  hint?: string | null;
  context?: {
    personName?: string | null;
    eventName?: string | null;
    placeName?: string | null;
    captionAI?: string | null;
  } | null;
  imageDataUrl: string;
  answeredAt?: Date | null;
};

export type QuizResultDoc = {
  sessionId: string;
  patientId: string | null;
  caregiverSub: string | null;
  createdBySub: string | null;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  responses: QuizResponseDoc[];
  createdAt: Date;
  completedAt?: Date | null;
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
