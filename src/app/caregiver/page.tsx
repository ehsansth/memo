import { headers, cookies } from "next/headers";
import CaregiverClient from "@/components/caregiver/CaregiverClient";
import MemoryCard from "@/components/caregiver/MemoryCard";
import { requireRole } from "@/lib/guards";
import { listMemoriesByPatient } from "@/lib/db-firestore";
import type { Memory } from "@/lib/types";

type CaregiverPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

async function fetchPatientsViaApi() {
  const headerList = headers();
  const host = headerList.get("host");
  if (!host) return [] as { id: string; displayName: string }[];

  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const cookieHeader = cookies()
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    const res = await fetch(`${baseUrl}/api/patients/list`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as { id: string; displayName: string }[];
  } catch (err) {
    console.error("Failed to load patients", err);
    return [];
  }
}

export default async function CaregiverPage({ searchParams }: CaregiverPageProps) {
  const user = await requireRole(["CAREGIVER"]);
  const caregiverSub = user.auth0Id || user.id;

  const patients = await fetchPatientsViaApi();
  const requestedPatientIdRaw = searchParams?.patient;
  const requestedPatientId = Array.isArray(requestedPatientIdRaw)
    ? requestedPatientIdRaw[0]
    : requestedPatientIdRaw ?? null;
  const patientIds = new Set(patients.map((p) => p.id));
  const selectedPatientId = requestedPatientId && patientIds.has(requestedPatientId)
    ? requestedPatientId
    : patients[0]?.id ?? null;
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;

  const docs = selectedPatientId
    ? await listMemoriesByPatient(caregiverSub, selectedPatientId)
    : [];

  const memories: Memory[] = docs.map((doc) => ({
    id: doc.id,
    caregiverSub: doc.caregiverSub,
    patientId: doc.patientId,
    title: doc.title || "Memory",
    imageUrl: doc.imageUrl,
    personName: doc.personName ?? null,
    eventName: doc.eventName ?? null,
    placeName: doc.placeName ?? null,
    dateLabel: doc.dateLabel ?? null,
    captionAI: doc.captionAI ?? null,
    tagsAI: doc.tagsAI ?? null,
    embedding: doc.embedding ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return (
    <div className="grid gap-6">
      <CaregiverClient
        patients={patients}
        selectedPatientId={selectedPatientId}
        selectedPatientName={selectedPatient?.displayName ?? null}
      />

      <section className="grid gap-4">
        {selectedPatientId ? (
          memories.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {memories.map((memory) => (
                <MemoryCard key={memory.id} m={memory} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              No memories yet for {selectedPatient?.displayName ?? "this patient"}. Upload one to get started.
            </div>
          )
        ) : patients.length ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Select a patient to view their memory library.
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Add your first patient to begin collecting memories.
          </div>
        )}
      </section>
    </div>
  );
}
