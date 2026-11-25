import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Жүктелуде...</div>}>
      <LoginForm />
    </Suspense>
  );
}
