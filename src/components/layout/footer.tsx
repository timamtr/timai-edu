import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">TimAI Edu</span>
          <span>— Информатика пәнінен ҰБТ-ға дайындық платформасы</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="hover:text-foreground">
            Кіру
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Тіркелу
          </Link>
          <span>© 2026 TimAI Edu</span>
        </div>
      </div>
    </footer>
  );
}
