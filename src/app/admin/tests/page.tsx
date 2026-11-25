import { getAdminTestsData } from "@/services/admin";
import { TestsManager } from "@/components/admin/tests-manager";

export default async function AdminTestsPage() {
  const { tests, subjects, topics, bankQuestions } = await getAdminTestsData();

  return (
    <TestsManager
      initialTests={tests}
      subjects={subjects}
      topics={topics}
      bankQuestions={bankQuestions}
    />
  );
}
