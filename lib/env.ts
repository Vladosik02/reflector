import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FACE_MATCH_PROVIDER: z.enum(["mock"]).default("mock"),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(10),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const parsedServer = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  FACE_MATCH_PROVIDER: process.env.FACE_MATCH_PROVIDER,
  RATE_LIMIT_PER_MINUTE: process.env.RATE_LIMIT_PER_MINUTE,
});

const parsedPublic = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedServer.success) {
  console.error("Invalid server environment variables:", parsedServer.error.flatten());
  throw new Error("Invalid server environment variables");
}
if (!parsedPublic.success) {
  console.error("Invalid public environment variables:", parsedPublic.error.flatten());
  throw new Error("Invalid public environment variables");
}

export const env = {
  ...parsedServer.data,
  ...parsedPublic.data,
};
