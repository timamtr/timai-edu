import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  LineChart,
  ShieldCheck,
  Timer,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Жүйелі теория",
    description:
      "ҰБТ бағдарламасына сай қысқа әрі түсінікті конспектілер, формулалар мен код мысалдары.",
  },
  {
    icon: Timer,
    title: "Нақты ҰБТ форматы",
    description:
      "Таймер, бір және бірнеше дұрыс жауапты тесттер, аяқтаған соң әр сұрақтың толық талдауы.",
  },
  {
    icon: Zap,
    title: "Жылдам квиздер",
    description:
      "5, 10 немесе 15 сұрақтан тұратын шағын жаттығулар арқылы біліміңді күн сайын бекіт.",
  },
  {
    icon: LineChart,
    title: "Жеке аналитика",
    description:
      "Әлсіз тақырыптарды автоматты түрде анықтап, балл динамикасы мен прогресті бақыла.",
  },
  {
    icon: Code2,
    title: "Практикалық есептер",
    description:
      "Python, алгоритмдеу, SQL және логикалық есептерді нақты мысалдармен меңгер.",
  },
  {
    icon: ShieldCheck,
    title: "Әділ тексеру жүйесі",
    description:
      "Барлық жауаптар серверде тексеріледі, нәтижелер мен тарих жеке кабинетіңде сақталады.",
  },
];

const POPULAR_TOPICS = [
  { name: "Ақпарат және ақпараттық процестер", icon: Cpu },
  { name: "Санау жүйелері", icon: Code2 },
  { name: "Логика негіздері", icon: CheckCircle2 },
  { name: "Python бағдарламалау", icon: Code2 },
  { name: "Деректер қоры және SQL", icon: Database },
  { name: "Компьютерлік желілер", icon: Zap },
];

const STATS = [
  { value: "12+", label: "Негізгі тақырып бөлімі" },
  { value: "ҰБТ 2026", label: "Өзекті спецификация" },
  { value: "24/7", label: "Кез келген құрылғыдан қолжетімді" },
  { value: "100%", label: "Қазақ тіліндегі интерфейс" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground">
              <span>Информатика • 9–11 сынып • ҰБТ</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              ҰБТ-ға дайындалудың{" "}
              <span className="text-primary">жаңа деңгейі</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Информатика пәнін жүйелі меңгер, біліміңді тексер және ҰБТ-ға
              сенімді дайындал. Теория, тесттер, квиздер және жеке аналитика —
              барлығы бір платформада.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-[#233FA5] sm:w-auto"
              >
                Дайындықты бастау
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                Аккаунтқа кіру
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Нәтижеге бағытталған оқу ортасы
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Артық ақпаратсыз, тек ҰБТ-да жоғары балл жинауға көмектесетін
              құралдар.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Popular Topics */}
        <section
          id="topics"
          className="border-t border-border bg-card/60 py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Танымал тақырыптар
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  ҰБТ емтиханында жиі кездесетін негізгі бөлімдер.
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Барлық бөлімдерді көру
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_TOPICS.map((topic) => {
                const Icon = topic.icon;
                return (
                  <div
                    key={topic.name}
                    className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {topic.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-sm sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Бүгіннен бастап жүйелі дайындал
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
              Тегін тіркеліп, информатика бойынша алғашқы сынақ тестін тапсыр
              және өз деңгейіңді біл.
            </p>
            <div className="mt-7">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
              >
                Тегін тіркелу
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
