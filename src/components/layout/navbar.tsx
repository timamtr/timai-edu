import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            TimAI <span className="text-primary">Edu</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Мүмкіндіктер
          </a>
          <a href="#topics" className="transition-colors hover:text-foreground">
            Тақырыптар
          </a>
          <a href="#stats" className="transition-colors hover:text-foreground">
            Нәтижелер
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Кіру
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-[#233FA5]"
          >
            Тіркелу
          </Link>
        </div>
      </div>
    </header>
  );
}
