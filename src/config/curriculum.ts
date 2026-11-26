export const CURRICULUM_SECTIONS = [
  {
    code: "01",
    title: "01. КОМПЬЮТЕРЛІК ЖҮЙЕЛЕР",
    topicPrefixes: ["01.", "02."],
  },
  {
    code: "02",
    title: "02. АҚПАРАТТЫҚ ПРОЦЕСТЕР",
    topicPrefixes: ["03.", "04.", "05."],
  },
  {
    code: "03",
    title: "03. КОМПЬЮТЕРЛІК ОЙЛАУ",
    topicPrefixes: ["06.", "07."],
  },
  {
    code: "04",
    title: "04. АППАРАТТЫҚ ЖӘНЕ ПРОГРАММАЛЫҚ ҚАМТАМАСЫЗ ЕТУ",
    topicPrefixes: ["08."],
  },
  {
    code: "05",
    title: "05. АҚПАРАТТЫҚ ПРОЦЕСТЕР МЕН ЖҮЙЕЛЕР",
    topicPrefixes: ["09.", "10.", "11."],
  },
  {
    code: "06",
    title: "06. АҚПАРАТТЫҚ ОБЪЕКТІЛЕРДІ ҚҰРУ ЖӘНЕ ТҮРЛЕНДІРУ",
    topicPrefixes: ["12.", "13."],
  },
] as const;

export function getSectionByTopicTitle(topicTitle: string): string {
  const found = CURRICULUM_SECTIONS.find((sec) =>
    sec.topicPrefixes.some((prefix) => topicTitle.trim().startsWith(prefix))
  );
  return found ? found.title : "01. КОМПЬЮТЕРЛІК ЖҮЙЕЛЕР";
}
