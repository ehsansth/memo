"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PatientOption = {
  id: string;
  displayName: string;
};

type PatientSelectorProps = {
  patients: PatientOption[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string | null) => void;
  onPatientCreated: (patient: PatientOption) => void;
  isPending?: boolean;
};

export default function PatientSelector({
  patients,
  selectedPatientId,
  onSelectPatient,
  onPatientCreated,
  isPending = false,
}: PatientSelectorProps) {
  const [newPatientName, setNewPatientName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteeName, setInviteeName] = useState<string | null>(null);

  const hasPatients = patients.length > 0;
  const currentValue = selectedPatientId ?? (hasPatients ? patients[0].id : "");

  const placeholder = useMemo(
    () => (hasPatients ? "Choose a patient" : "No patients yet"),
    [hasPatients]
  );

  async function handleCreatePatient(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newPatientName.trim();
    if (!trimmed) {
      setError("Enter a name or label for the patient.");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const res = await fetch("/api/patients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmed }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Unable to add patient");
      }
      const payload = await res.json();
      const patient = (payload?.patient ?? payload) as PatientOption | undefined;
      const signupUrl = typeof payload?.signupUrl === "string" ? payload.signupUrl : null;
      if (!patient) {
        throw new Error("Unable to create patient");
      }
      onPatientCreated(patient);
      onSelectPatient(patient.id);
      setNewPatientName("");
      setInviteUrl(signupUrl);
      setInviteeName(patient.displayName);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to add patient";
      setError(message);
      setInviteUrl(null);
      setInviteeName(null);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-2">
          <Label>Select patient</Label>
          {hasPatients ? (
            <Select
              value={currentValue}
              onValueChange={(value) => onSelectPatient(value || null)}
              disabled={isPending || creating}
            >
              <SelectTrigger className="min-w-60">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              No patients yet. Add one to get started.
            </p>
          )}
        </div>

        <form className="grid gap-2 md:w-72" onSubmit={handleCreatePatient}>
          <Label htmlFor="new-patient">Sign patient up</Label>
          <div className="flex gap-2">
            <Input
              id="new-patient"
              value={newPatientName}
              onChange={(event) => setNewPatientName(event.target.value)}
              placeholder="e.g. Mom"
              disabled={creating}
            />
            <Button type="submit" disabled={creating || !newPatientName.trim()}>
              {creating ? "Adding…" : "Add"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </div>
      {inviteUrl && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm">
          <p className="font-medium">
            Please share this link with {inviteeName || "your patient"} to sign them up:
          </p>
          <a
            href={inviteUrl}
            className="mt-2 block truncate text-primary underline"
            target="_blank"
            rel="noreferrer"
          >
            {inviteUrl}
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            They&apos;ll land on Auth0&apos;s signup page; once they finish, Memo records them as a patient automatically.
          </p>
        </div>
      )}
    </div>
  );
}
