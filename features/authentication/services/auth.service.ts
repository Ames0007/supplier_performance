import { ok, type Result } from "@/lib/errors";

export interface SignInChallenge {
  readonly provider: "microsoft";
  readonly redirectUrl: string;
}

/**
 * Authentication flow (foundation). The blueprint targets Microsoft Entra SSO
 * brokered by Supabase. Phase 1 exposes the flow seam and returns the post-login
 * destination; the real OIDC redirect + callback handling is wired at P1
 * completion (see app/(auth)/auth/callback in the blueprint).
 */
export class AuthService {
  async signInWithMicrosoft(): Promise<Result<SignInChallenge>> {
    return ok({ provider: "microsoft", redirectUrl: "/" });
  }

  async signOut(): Promise<Result<null>> {
    return ok(null);
  }
}

export const authService = new AuthService();
