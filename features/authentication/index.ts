/** Authentication & Identity bounded context (C9) — public API barrel. */
export { MicrosoftSignInButton } from "./components/MicrosoftSignInButton";
export { resolveCurrentSession, registerSessionResolver } from "./services/resolver";
export { resolveSessionFromIdentity } from "./services/session.service";
export type { SessionResolutionDeps } from "./services/session.service";
export { getCurrentIdentity } from "./services/identity";
export type { AuthIdentity } from "./services/identity";
