import Link from "next/link";
import { Button, Input, Label } from "@/components/ui";
import type { Supplier, SupplierCategory } from "../types/supplier";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-border bg-surface px-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

/**
 * Shared create/edit supplier form (server-rendered; submits to a server action).
 * `code` is only editable on create — it is the supplier's stable identifier.
 */
export function SupplierForm({
  mode,
  action,
  categories,
  supplier,
  cancelHref,
}: {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  categories: SupplierCategory[];
  supplier?: Supplier;
  cancelHref: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-5">
      {mode === "edit" && supplier ? <input type="hidden" name="id" value={supplier.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "create" ? (
          <Field>
            <Label htmlFor="code">Code fournisseur *</Label>
            <Input id="code" name="code" required maxLength={50} placeholder="SUP-1005" />
          </Field>
        ) : null}
        <Field>
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" name="name" required defaultValue={supplier?.name} maxLength={200} />
        </Field>
        <Field>
          <Label htmlFor="legalName">Raison sociale</Label>
          <Input id="legalName" name="legalName" defaultValue={supplier?.legalName ?? ""} maxLength={200} />
        </Field>
        <Field>
          <Label htmlFor="categoryId">Catégorie</Label>
          <select id="categoryId" name="categoryId" defaultValue={supplier?.categoryId ?? ""} className={SELECT_CLASS}>
            <option value="">—</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <Label htmlFor="country">Pays</Label>
          <Input id="country" name="country" defaultValue={supplier?.country ?? ""} maxLength={100} />
        </Field>
        <Field>
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={supplier?.city ?? ""} maxLength={100} />
        </Field>
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={supplier?.email ?? ""} />
        </Field>
        <Field>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} maxLength={50} />
        </Field>
        <Field>
          <Label htmlFor="taxId">Identifiant fiscal</Label>
          <Input id="taxId" name="taxId" defaultValue={supplier?.taxId ?? ""} maxLength={50} />
        </Field>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit">{mode === "create" ? "Créer le fournisseur" : "Enregistrer"}</Button>
        <Button asChild variant="ghost">
          <Link href={cancelHref}>Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
