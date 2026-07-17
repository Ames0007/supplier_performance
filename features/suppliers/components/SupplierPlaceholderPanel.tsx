import { Clock } from "lucide-react";
import { EmptyState } from "@/components/feedback";

/** 360° tabs whose domains arrive in later phases (performance, risk, POs…). */
export function SupplierPlaceholderPanel({ title, phase }: { title: string; phase: string }) {
  return (
    <EmptyState
      icon={Clock}
      title={title}
      description={`Cette section sera disponible dans une phase ultérieure (${phase}).`}
    />
  );
}
