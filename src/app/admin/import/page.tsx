import { getAdminQuestionsData } from "@/services/admin";
import { BulkImportManager } from "@/components/admin/bulk-import-manager";

export default async function AdminImportPage() {
  const { subjects, topics } = await getAdminQuestionsData();

  return <BulkImportManager subjects={subjects} topics={topics} />;
}
