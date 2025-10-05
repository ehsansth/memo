import { requireRole } from "@/lib/guards";
import {
  getLatestQuizResultForPatient,
  listPatientsByCaregiver,
} from "@/lib/db-firestore";
import PatientInsights from "@/components/caregiver/PatientInsights";

export const runtime = "nodejs";

export default async function CaregiverPatientsPage() {
  const user = await requireRole(["CAREGIVER"]);
  const caregiverSub = user.auth0Id || user.id;

  const patients = await listPatientsByCaregiver(caregiverSub);

  const summaries = await Promise.all(
    patients.map(async (patient) => {
      const result = await getLatestQuizResultForPatient(caregiverSub, patient.id);

      if (!result) {
        return {
          id: patient.id,
          displayName: patient.displayName,
          latestResult: null,
        };
      }

      const wrongResponses = result.responses.filter((response) => !response.correct);

      return {
        id: patient.id,
        displayName: patient.displayName,
        latestResult: {
          sessionId: result.sessionId,
          totalQuestions: result.totalQuestions,
          correctCount: result.correctCount,
          answeredCount: result.answeredCount,
          scorePercent: result.scorePercent,
          completedAt: result.completedAt?.toISOString() ?? result.createdAt.toISOString(),
          wrongResponses: wrongResponses.map((response) => ({
            questionId: response.questionId,
            prompt: response.prompt,
            correctAnswer:
              response.correctIndex >= 0 && response.correctIndex < response.options.length
                ? response.options[response.correctIndex]
                : response.options[0] || "",
            imageDataUrl: response.imageDataUrl,
            context: response.context ?? null,
            answeredAt: response.answeredAt?.toISOString() ?? null,
          })),
        },
      };
    })
  );

  return <PatientInsights patients={summaries} />;
}
