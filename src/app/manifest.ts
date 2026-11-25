import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TimAI Edu — ҰБТ Информатика",
    short_name: "TimAI Edu",
    description:
      "Информатика пәнін жүйелі меңгер, біліміңді тексер және ҰБТ-ға сенімді дайындал.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F7F8FC",
    theme_color: "#3157D5",
    lang: "kk",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
