import { requireRole } from '@/lib/guards';
import QuizClient from './quiz-client'; // move your current client UI to a separate file

export default async function QuizPage() {
  await requireRole(['PATIENT']);
  return <QuizClient />;
}
