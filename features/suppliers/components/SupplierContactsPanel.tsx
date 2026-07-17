import { Trash2 } from "lucide-react";
import { Badge, Button, Input, Label } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { addContactAction, removeContactAction } from "../actions";
import { CONTACT_KIND, type SupplierContact } from "../types/supplier";

const KIND_LABEL: Record<string, string> = {
  [CONTACT_KIND.SUPPLIER]: "Fournisseur",
  [CONTACT_KIND.INTERNAL]: "Interne",
};

export function SupplierContactsPanel({
  supplierId,
  contacts,
  canManage,
}: {
  supplierId: string;
  contacts: SupplierContact[];
  canManage: boolean;
}) {
  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <EmptyState title="Aucun contact" description="Ajoutez les contacts fournisseurs et internes." />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-fg">{contact.name}</span>
                  <Badge variant="outline">{KIND_LABEL[contact.kind]}</Badge>
                  {contact.isPrimary ? <Badge variant="info">Principal</Badge> : null}
                </div>
                <div className="text-sm text-fg-muted">
                  {[contact.role, contact.email, contact.phone].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              {canManage ? (
                <form action={removeContactAction}>
                  <input type="hidden" name="supplierId" value={supplierId} />
                  <input type="hidden" name="contactId" value={contact.id} />
                  <Button type="submit" size="sm" variant="ghost" aria-label={`Supprimer ${contact.name}`}>
                    <Trash2 />
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <form action={addContactAction} className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
          <input type="hidden" name="supplierId" value={supplierId} />
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Nom *</Label>
            <Input id="contact-name" name="name" required maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-kind">Type</Label>
            <select
              id="contact-kind"
              name="kind"
              defaultValue={CONTACT_KIND.SUPPLIER}
              className="h-9 w-full rounded-md border border-border bg-surface px-2 text-sm text-fg"
            >
              <option value={CONTACT_KIND.SUPPLIER}>Fournisseur</option>
              <option value={CONTACT_KIND.INTERNAL}>Interne</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-role">Fonction</Label>
            <Input id="contact-role" name="role" maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-email">Email</Label>
            <Input id="contact-email" name="email" type="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-phone">Téléphone</Label>
            <Input id="contact-phone" name="phone" maxLength={50} />
          </div>
          <label className="flex items-center gap-2 self-end text-sm text-fg">
            <input type="checkbox" name="isPrimary" value="on" /> Contact principal
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">
              Ajouter le contact
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
