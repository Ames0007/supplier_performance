import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <main className="flex flex-1 items-center justify-center p-6">{children}</main>
      <footer className="border-t border-border p-4 text-center text-sm text-fg-subtle">
        © UM6P · Confidentialité · v1.0
      </footer>
    </div>
  );
}
