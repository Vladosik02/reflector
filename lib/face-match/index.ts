import { env } from "@/lib/env";
import { mockProvider } from "./mock";
import type { FaceMatchProvider } from "./types";

export function getFaceMatchProvider(): FaceMatchProvider {
  switch (env.FACE_MATCH_PROVIDER) {
    case "mock":
      return mockProvider;
    default:
      throw new Error(`Unknown FACE_MATCH_PROVIDER: ${env.FACE_MATCH_PROVIDER}`);
  }
}

export type { FaceMatchProvider, Match, MatchRequest, MatchResponse, MatchSource } from "./types";
