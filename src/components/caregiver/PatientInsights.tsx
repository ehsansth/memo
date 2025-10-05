"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type WrongResponseOverview = {
  questionId: string;
  prompt: string;
  correctAnswer: string;
  imageDataUrl: string;
  context: {
    personName?: string | null;
    eventName?: string | null;
    placeName?: string | null;
    captionAI?: string | null;
  } | null;
  answeredAt: string | null;
};

type PatientResultSummary = {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  answeredCount: number;
  scorePercent: number;
  completedAt: string;
  wrongResponses: WrongResponseOverview[];
};

type PatientSummary = {
  id: string;
  displayName: string;
  latestResult: PatientResultSummary | null;
};

type PatientInsightsProps = {
  patients: PatientSummary[];
};

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function PatientInsights({ patients }: PatientInsightsProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id ?? ""
  );

  const selectedPatient = useMemo(() => {
    return patients.find((patient) => patient.id === selectedPatientId) ?? null;
  }, [patients, selectedPatientId]);

  if (!patients.length) {
    return (
      <div className="p-8">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No patients yet</CardTitle>
            <CardDescription>
              Add a patient to start tracking quiz progress and insights.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const result = selectedPatient?.latestResult;
  const scoreText = result
    ? `${result.correctCount}/${result.totalQuestions} correct`
    : "No quiz data yet";
  const completedText = result ? formatDateTime(result.completedAt) : "";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Review quiz progress and see where extra coaching might help.
          </p>
        </div>
        <Select
          value={selectedPatientId}
          onValueChange={(value) => setSelectedPatientId(value)}
        >
          <SelectTrigger className="min-w-56">
            <SelectValue placeholder="Choose a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedPatient?.displayName ?? "Select a patient"}</CardTitle>
          <CardDescription>
            {result ? (
              <span>
                Latest quiz: {scoreText}
                {completedText && ` on ${completedText}`}
              </span>
            ) : (
              "No quiz results yet. Encourage them to take a quiz to see insights here."
            )}
          </CardDescription>
        </CardHeader>
        {result && (
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p>
                Answered {result.answeredCount} of {result.totalQuestions} questions • Score: {result.scorePercent}%
              </p>
            </div>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Needs More Practice</h2>
              {result.wrongResponses.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {result.wrongResponses.map((response) => (
                    <Card key={response.questionId} className="overflow-hidden">
                      <CardContent className="space-y-3 p-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={response.imageDataUrl}
                            alt={response.prompt}
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-foreground">{response.prompt}</p>
                          <p className="text-muted-foreground">
                            Correct answer: <span className="font-medium">{response.correctAnswer || "Not recorded"}</span>
                          </p>
                          {response.context?.personName && (
                            <p className="text-muted-foreground">
                              Person: {response.context.personName}
                            </p>
                          )}
                          {response.context?.eventName && (
                            <p className="text-muted-foreground">
                              Event: {response.context.eventName}
                            </p>
                          )}
                          {response.context?.placeName && (
                            <p className="text-muted-foreground">
                              Place: {response.context.placeName}
                            </p>
                          )}
                          {response.answeredAt && (
                            <p className="text-xs text-muted-foreground">
                              Answered on {formatDateTime(response.answeredAt)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All answers were correct in the latest quiz. Great work!
                </p>
              )}
            </section>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
