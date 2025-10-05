import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import type {
  AppRole,
  InviteDoc,
  LinkDoc,
  MemoryDoc,
  PatientDoc,
  UserRoleDoc,
} from "./types";

type StoredPatientDoc = Omit<PatientDoc, "createdAt"> & {
  createdAt: Date | Timestamp;
};

type StoredMemoryDoc = Omit<MemoryDoc, "createdAt" | "updatedAt"> & {
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
};

type StoredUserRoleDoc = Omit<UserRoleDoc, "createdAt" | "updatedAt"> & {
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
};

type StoredInviteDoc = Omit<InviteDoc, "createdAt" | "expiresAt"> & {
  createdAt: Date | Timestamp;
  expiresAt: Date | Timestamp;
};

const toDate = (value?: Date | Timestamp): Date | undefined => {
  if (!value) return undefined;
  return value instanceof Timestamp ? value.toDate() : value;
};

function fromPatientSnapshot(id: string, data: StoredPatientDoc) {
  const createdAt = toDate(data.createdAt) ?? new Date();
  return {
    id,
    ...data,
    createdAt,
  } as PatientDoc & { id: string };
}

function fromUserRoleSnapshot(data: StoredUserRoleDoc) {
  const createdAt = toDate(data.createdAt) ?? new Date();
  const updatedAt = toDate(data.updatedAt);
  return {
    ...data,
    createdAt,
    updatedAt,
  } as UserRoleDoc;
}

export async function getPatientById(patientId: string) {
  const snapshot = await db.collection("patients").doc(patientId).get();
  if (!snapshot.exists) return null;
  return fromPatientSnapshot(snapshot.id, snapshot.data() as StoredPatientDoc);
}

export async function getPatientByPatientSub(patientSub: string) {
  const snap = await db
    .collection("patients")
    .where("patientSub", "==", patientSub)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return fromPatientSnapshot(doc.id, doc.data() as StoredPatientDoc);
}

export async function getPatientForCaregiver(patientId: string, caregiverSub: string) {
  const patient = await getPatientById(patientId);
  if (!patient || patient.caregiverSub !== caregiverSub) return null;
  return patient;
}

function fromMemorySnapshot(id: string, data: StoredMemoryDoc) {
  const createdAt = toDate(data.createdAt) ?? new Date();
  const updatedAt = toDate(data.updatedAt);
  return {
    id,
    ...data,
    createdAt,
    updatedAt,
  } as MemoryDoc & { id: string };
}

export async function createPatient(caregiverSub: string, displayName: string) {
  const ref = db.collection("patients").doc();
  const doc: PatientDoc = {
    caregiverSub,
    displayName,
    patientSub: null,
    createdAt: new Date(),
  };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function listPatientsByCaregiver(caregiverSub: string) {
  const snap = await db
    .collection("patients")
    .where("caregiverSub", "==", caregiverSub)
    .orderBy("displayName", "asc")
    .get();

  return snap.docs.map((doc) => fromPatientSnapshot(doc.id, doc.data() as StoredPatientDoc));
}

export async function createMemoryForPatient(
  caregiverSub: string,
  patientId: string,
  data: Omit<MemoryDoc, "caregiverSub" | "patientId" | "createdAt" | "updatedAt">
) {
  const ref = db.collection("memories").doc();
  const doc: MemoryDoc = {
    caregiverSub,
    patientId,
    createdAt: new Date(),
    ...data,
  };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function listMemoriesByPatient(
  caregiverSub: string,
  patientId: string
) {
  const snap = await db
    .collection("memories")
    .where("caregiverSub", "==", caregiverSub)
    .where("patientId", "==", patientId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => fromMemorySnapshot(doc.id, doc.data() as StoredMemoryDoc));
}

export async function getMemoryById(memoryId: string) {
  const snapshot = await db.collection("memories").doc(memoryId).get();
  if (!snapshot.exists) return null;
  return fromMemorySnapshot(snapshot.id, snapshot.data() as StoredMemoryDoc);
}

export async function getMemoryForCaregiver(memoryId: string, caregiverSub: string) {
  const memory = await getMemoryById(memoryId);
  if (!memory || memory.caregiverSub !== caregiverSub) return null;
  return memory;
}

export async function updateMemory(memoryId: string, patch: Partial<MemoryDoc>) {
  await db
    .collection("memories")
    .doc(memoryId)
    .set({ ...patch, updatedAt: new Date() }, { merge: true });
}

export async function createInvite(
  caregiverSub: string,
  token: string,
  ttlHours = 24,
  options: { patientId?: string | null; targetRole: AppRole }
) {
  const expiresAt = new Date(Date.now() + ttlHours * 3_600 * 1_000);
  const invite: InviteDoc = {
    token,
    caregiverSub,
    targetRole: options.targetRole,
    patientId: options.patientId ?? null,
    used: false,
    expiresAt,
    createdAt: new Date(),
  };
  await db.collection("invites").doc(token).set(invite);
  return invite;
}

export async function consumeInvite(token: string) {
  const ref = db.collection("invites").doc(token);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Invite not found");

  const data = doc.data() as StoredInviteDoc;
  const expiresAt = toDate(data.expiresAt);
  if (data.used) throw new Error("Invite already used");
  if (expiresAt && expiresAt < new Date()) throw new Error("Invite expired");

  await ref.set({ used: true }, { merge: true });

  const createdAt = toDate(data.createdAt) ?? new Date();
  return {
    ...data,
    expiresAt: expiresAt ?? new Date(),
    createdAt,
  } as InviteDoc;
}

export async function linkCaregiverPatient(caregiverSub: string, patientSub: string) {
  const ref = db.collection("links").doc();
  const link: LinkDoc = { caregiverSub, patientSub, createdAt: new Date() };
  await ref.set(link);
  return { id: ref.id, ...link };
}

export async function linkPatientAccount(
  caregiverSub: string,
  patientId: string,
  patientSub: string
) {
  const patient = await getPatientForCaregiver(patientId, caregiverSub);
  if (!patient) throw new Error("Patient not found for caregiver");
  await db.collection("patients").doc(patientId).set({ patientSub }, { merge: true });
  return { ...patient, patientSub };
}

export async function getUserRoleDoc(auth0Id: string) {
  const snapshot = await db.collection("userRoles").doc(auth0Id).get();
  if (!snapshot.exists) return null;
  return fromUserRoleSnapshot(snapshot.data() as StoredUserRoleDoc);
}

export async function setUserRole(auth0Id: string, role: AppRole) {
  const now = new Date();
  const ref = db.collection("userRoles").doc(auth0Id);
  const existing = await ref.get();
  const base: Partial<UserRoleDoc> = {
    role,
    updatedAt: now,
  };
  if (!existing.exists) {
    base.createdAt = now;
  }
  await ref.set(base, { merge: true });
}
