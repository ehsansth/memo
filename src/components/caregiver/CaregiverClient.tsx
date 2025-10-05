"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PatientSelector, { PatientOption } from "@/components/caregiver/PatientSelector";
import UploadForm from "@/components/caregiver/UploadForm";

type CaregiverClientProps = {
  patients: PatientOption[];
  selectedPatientId: string | null;
  selectedPatientName: string | null;
};

function sortPatients(list: PatientOption[]) {
  return [...list].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export default function CaregiverClient({
  patients: initialPatients,
  selectedPatientId: initialSelectedPatientId,
  selectedPatientName,
}: CaregiverClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [patients, setPatients] = useState<PatientOption[]>(() => sortPatients(initialPatients));
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    initialSelectedPatientId
  );

  useEffect(() => {
    setPatients(sortPatients(initialPatients));
  }, [initialPatients]);

  useEffect(() => {
    setSelectedPatientId(initialSelectedPatientId);
  }, [initialSelectedPatientId]);

  const activePatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  function updateUrl(patientId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (patientId) params.set("patient", patientId);
    else params.delete("patient");
    const query = params.toString();
    startTransition(() => {
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
      router.refresh();
    });
  }

  function handleSelectPatient(patientId: string | null) {
    const fallbackId = patientId ?? (patients[0]?.id ?? null);
    setSelectedPatientId(fallbackId);
    updateUrl(fallbackId);
  }

  function handlePatientCreated(patient: PatientOption) {
    setPatients((prev) => sortPatients([...prev, patient]));
  }

  function handleUploaded() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <PatientSelector
        patients={patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={handleSelectPatient}
        onPatientCreated={handlePatientCreated}
        isPending={isPending}
      />
      {selectedPatientId ? (
        <UploadForm
          patientId={selectedPatientId}
          patientDisplayName={activePatient?.displayName ?? selectedPatientName}
          onUploaded={handleUploaded}
        />
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          Pick or add a patient to enable memory uploads.
        </div>
      )}
    </div>
  );
}
