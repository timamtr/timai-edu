import { getAdminContentData } from "@/services/admin";
import { ContentManager } from "@/components/admin/content-manager";

export default async function AdminContentPage() {
  const { subjects, topics, lessons } = await getAdminContentData();

  return (
    <ContentManager
      subjects={subjects}
      topics={topics}
      lessons={lessons}
    />
  );
}
