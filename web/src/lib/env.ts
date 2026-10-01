import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  API_URL: z.url().default("http://localhost:8000"),
  API_TOKEN: z.string().optional().transform((v) => v || undefined),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Validated server environment. Parsed lazily so static pages can build
 * without secrets; anything that needs them fails fast with a clear message.
 */
export function serverEnv(): ServerEnv {
  if (!cached) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new Error(`Invalid server environment:\n${issues}\nSee web/.env.example.`);
    }
    cached = parsed.data;
  }
  return cached;
}
