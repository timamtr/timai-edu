import { getAdminQuestionsData } from "@/services/admin";
import { QuestionsManager } from "@/components/admin/questions-manager";

export default async function AdminQuestionsPage() {
  const { questions, subjects, topics } = await getAdminQuestionsData();

  return (
    <QuestionsManager
      initialQuestions={questions}
      subjects={subjects}
      topics={topics}
    />
  );
}
