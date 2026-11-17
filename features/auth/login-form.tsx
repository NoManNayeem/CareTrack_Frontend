"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api-client";
import { duration, ease } from "@/lib/motion";
import { queryKeys } from "@/lib/query-keys";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { authApi } from "./api";

const DEMO = {
  enabled: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  email: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "admin@caretrack.dev",
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "CareTrack@2026",
};

/** Only allow same-site relative redirects (prevents open-redirects via ?next=). */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    params.get("reason") === "expired" ? "Your session expired. Please sign in again." : null,
  );

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user } = await authApi.login(values);
      qc.setQueryData(queryKeys.me, user);
      router.replace(safeNext(params.get("next")));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        Object.entries(error.fieldErrors()).forEach(([field, message]) =>
          form.setError(field as keyof LoginValues, { message }),
        );
      } else {
        setFormError(error instanceof ApiError ? error.message : "Can't reach the server. Check your connection.");
      }
      form.setFocus("password");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <AnimatePresence initial={false}>
        {formError && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease } }}
            exit={{ opacity: 0, transition: { duration: duration.fast, ease } }}
          >
            <div className="flex items-start gap-2 rounded-md border border-danger/25 bg-danger/5 px-3 py-2.5 text-[13px] text-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
              {formError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Work email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            autoFocus
            placeholder="you@hospital.org"
            aria-invalid={!!errors.email}
            className="h-9"
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup className="h-9">
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.password]} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : null}
        {isSubmitting ? "Signing in…" : "Sign in"}
        {!isSubmitting && <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />}
      </Button>

      {DEMO.enabled && (
        <button
          type="button"
          onClick={() => {
            form.setValue("email", DEMO.email, { shouldValidate: true });
            form.setValue("password", DEMO.password, { shouldValidate: true });
          }}
          className="flex w-full items-center gap-3 rounded-md border border-dashed px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-muted/50"
        >
          <KeyRound className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 text-[13px]">
            <span className="block font-medium">Use demo credentials</span>
            <span className="block truncate font-mono text-xs text-muted-foreground">{DEMO.email}</span>
          </span>
        </button>
      )}
    </form>
  );
}
