import { z } from "zod";

const environmentSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url("VITE_API_BASE_URL must be an absolute URL")
    .default("http://localhost:8000/api/v1"),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  VITE_APP_NAME: z.string().min(1).default("Blood Bank"),
});

const result = environmentSchema.safeParse(import.meta.env);

if (!result.success) {
  console.error(
    "Invalid frontend environment configuration",
    result.error.flatten(),
  );
  throw new Error("The application environment is not configured correctly.");
}

export const env = {
  apiBaseUrl: result.data.VITE_API_BASE_URL.replace(/\/$/, ""),
  apiTimeoutMs: result.data.VITE_API_TIMEOUT_MS,
  appName: result.data.VITE_APP_NAME,
} as const;
