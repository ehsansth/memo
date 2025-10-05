import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import type { InviteDoc, LinkDoc, MemoryDoc } from "./types";

type StoredMemoryDoc = Omit<MemoryDoc, "createdAt" | "updatedAt"> & {
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

export async function createMemory(
  ownerSub: string,
  data: Omit<MemoryDoc, "ownerSub" | "createdAt" | "updatedAt">
) {
  const ref = db.collection("memories").doc();
  const doc: MemoryDoc = { ownerSub, createdAt: new Date(), ...data };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function updateMemory(memoryId: string, patch: Partial<MemoryDoc>) {
  await db
    .collection("memories")
    .doc(memoryId)
    .set({ ...patch, updatedAt: new Date() }, { merge: true });
}

export async function listMemoriesByOwner(
  ownerSub: string
): Promise<(MemoryDoc & { id: string })[]> {
  const snap = await db
    .collection("memories")
    .where("ownerSub", "==", ownerSub)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data() as StoredMemoryDoc;
    const createdAt = toDate(data.createdAt) ?? new Date();
    const updatedAt = toDate(data.updatedAt);
    return {
      id: doc.id,
      ...data,
      createdAt,
      updatedAt,
    } as MemoryDoc & { id: string };
  });
}

export async function createInvite(caregiverSub: string, token: string, ttlHours = 24) {
  const expiresAt = new Date(Date.now() + ttlHours * 3_600 * 1_000);
  const invite: InviteDoc = {
    token,
    caregiverSub,
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
