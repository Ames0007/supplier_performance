import { describe, it, expect } from "vitest";
import { evaluateAccess, isPublicPath } from "./access-policy";

describe("route access policy", () => {
  it("redirects an unauthenticated user from a protected route to /sign-in (with returnTo)", () => {
    const decision = evaluateAccess({ pathname: "/administration/users", authenticated: false });
    expect(decision.action).toBe("redirect");
    expect(decision.to).toBe("/sign-in?returnTo=%2Fadministration%2Fusers");
  });

  it("allows an unauthenticated user on public paths (login, OAuth, health)", () => {
    expect(evaluateAccess({ pathname: "/sign-in", authenticated: false }).action).toBe("allow");
    expect(evaluateAccess({ pathname: "/auth/callback", authenticated: false }).action).toBe("allow");
    expect(evaluateAccess({ pathname: "/api/health", authenticated: false }).action).toBe("allow");
    expect(evaluateAccess({ pathname: "/api/v1/live", authenticated: false }).action).toBe("allow");
    expect(evaluateAccess({ pathname: "/api/v1/ready", authenticated: false }).action).toBe("allow");
  });

  it("redirects an authenticated user away from /sign-in", () => {
    expect(evaluateAccess({ pathname: "/sign-in", authenticated: true })).toEqual({
      action: "redirect",
      to: "/",
    });
  });

  it("allows an authenticated user on protected routes", () => {
    expect(evaluateAccess({ pathname: "/administration", authenticated: true }).action).toBe("allow");
  });

  it("classifies public vs protected paths", () => {
    expect(isPublicPath("/auth/signout")).toBe(true);
    expect(isPublicPath("/sign-in")).toBe(true);
    expect(isPublicPath("/administration")).toBe(false);
    expect(isPublicPath("/")).toBe(false);
  });
});
