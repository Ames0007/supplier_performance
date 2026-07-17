import { FileText, Trash2 } from "lucide-react";
import { Badge, Button, Input, Label } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { formatDate } from "@/lib/utils";
import { addDocumentAction, removeDocumentAction } from "../actions";
import type { SupplierDocument } from "../types/supplier";

/**
 * Documents foundation: metadata list + add/remove. Actual file upload to
 * Supabase Storage is wired in a later phase; a document URL may be provided now.
 */
export function SupplierDocumentsPanel({
  supplierId,
  documents,
  canManage,
}: {
  supplierId: string;
  documents: SupplierDocument[];
  canManage: boolean;
}) {
  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Certificats, attestations et pièces contractuelles apparaîtront ici."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-fg-subtle" aria-hidden="true" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-fg">{document.name}</span>
                    <Badge variant="outline">{document.docType}</Badge>
                  </div>
                  <div className="text-sm text-fg-muted">
                    Ajouté par {document.uploadedByName} · {formatDate(document.createdAt)}
                  </div>
                </div>
              </div>
              {canManage ? (
                <form action={removeDocumentAction}>
                  <input type="hidden" name="supplierId" value={supplierId} />
                  <input type="hidden" name="documentId" value={document.id} />
                  <Button type="submit" size="sm" variant="ghost" aria-label={`Supprimer ${document.name}`}>
                    <Trash2 />
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <form action={addDocumentAction} className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
          <input type="hidden" name="supplierId" value={supplierId} />
          <div className="space-y-1.5">
            <Label htmlFor="doc-name">Nom *</Label>
            <Input id="doc-name" name="name" required maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-type">Type *</Label>
            <Input id="doc-type" name="docType" required maxLength={80} placeholder="certificat, assurance…" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="doc-url">Lien (optionnel)</Label>
            <Input id="doc-url" name="url" type="url" placeholder="https://…" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">
              Ajouter le document
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
