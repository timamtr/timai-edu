import fs from "fs";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitStore } from "@/lib/utils/rate-limit";

describe("Rate Limiter & RLS Security Audit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("blocks requests exceeding rate limit", () => {
    expect(checkRateLimit("u1", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("u1", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("u1", 2, 60_000).allowed).toBe(false);
  });

  it("enforces RLS on answer keys and blocks pre-completion answer leaks", () => {
    const rlsSql = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/migrations/0002_rls_policies.sql"),
      "utf-8"
    );
    const rpcSql = fs.readFileSync(
      path.resolve(__dirname, "../../supabase/migrations/0003_testing_rpc.sql"),
      "utf-8"
    );

    expect(rlsSql).toContain("ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;");
    expect(rlsSql).toContain('CREATE POLICY "Only admins access answer keys"');
    expect(rlsSql).toContain("role = (SELECT role FROM public.profiles WHERE id = auth.uid())");
    expect(rpcSql).toContain("RAISE EXCEPTION 'Attempt already completed';");
    expect(rpcSql).toContain("RAISE EXCEPTION 'Cannot view answers before test completion';");
  });
});
