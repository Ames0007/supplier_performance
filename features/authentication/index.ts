/** Authentication & Identity bounded context (C9) — public API barrel. */
export { AuthService, authService } from "./services/auth.service";
export type { SignInChallenge } from "./services/auth.service";
export { MicrosoftSignInButton } from "./components/MicrosoftSignInButton";
