"use client";

import { useRef } from "react";
import { LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu({ displayName, email }: { displayName: string; email: string }) {
  const signOutForm = useRef<HTMLFormElement>(null);

  return (
    <>
      {/* Real sign-out: POST to the route handler that clears the Supabase session. */}
      <form ref={signOutForm} action="/auth/signout" method="post" className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu utilisateur"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar name={displayName} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="text-sm font-semibold text-fg">{displayName}</div>
            <div className="font-normal text-fg-muted">{email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserRound /> Profil
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              signOutForm.current?.requestSubmit();
            }}
          >
            <LogOut /> Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
