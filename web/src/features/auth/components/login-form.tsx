"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";

import { login } from "../actions";
import type { LoginState } from "../schemas";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  return (
    <form action={action} className="mt-6 flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <FormField label="Password" error={state?.fieldError}>
        <Input name="password" type="password" autoComplete="current-password" required autoFocus />
      </FormField>
      {state?.error && (
        <p role="alert" className="border-l-2 border-bad pl-3 text-sm text-bad">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
