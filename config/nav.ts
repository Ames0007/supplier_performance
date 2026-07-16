import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardCheck,
  FileText,
  Grid3x3,
  Home,
  LayoutGrid,
  ScrollText,
  Settings,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { PERMISSIONS, type PermissionCode } from "@/lib/auth";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  /** Item is hidden unless the user holds this permission (or any of `permissionsAny`). */
  readonly permission?: PermissionCode;
  readonly permissionsAny?: PermissionCode[];
  /** Implemented in Phase 1? Deferred items render disabled with a "Bientôt" tag. */
  readonly enabled: boolean;
}

export interface NavGroup {
  readonly label: string;
  readonly items: NavItem[];
}

/** Top-level entry (no group). */
export const NAV_HOME: NavItem = { label: "Accueil", href: "/", icon: Home, enabled: true };

/** Primary navigation (UX_FOUNDATIONS §F2 — permission-filtered, grouped). */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Fournisseurs",
    items: [
      { label: "Fournisseurs", href: "/suppliers", icon: Building2, permission: PERMISSIONS.SUPPLIERS_READ, enabled: false },
      { label: "Risque", href: "/risk", icon: ShieldAlert, permission: PERMISSIONS.SUPPLIERS_READ_ALL, enabled: false },
      { label: "Portefeuille", href: "/portfolio", icon: Briefcase, permission: PERMISSIONS.DASHBOARDS_VIEW_EXECUTIVE, enabled: false },
    ],
  },
  {
    label: "Performance",
    items: [
      { label: "Évaluations", href: "/evaluations", icon: ClipboardCheck, permission: PERMISSIONS.EVALUATIONS_READ_OWN, enabled: false },
      { label: "Commandes", href: "/purchase-orders", icon: ShoppingCart, permission: PERMISSIONS.PURCHASE_ORDERS_READ, enabled: false },
      { label: "Plans d'amélioration", href: "/improvement-plans", icon: TrendingUp, permissionsAny: [PERMISSIONS.EVALUATIONS_READ_ALL, PERMISSIONS.EVALUATIONS_READ_OWN], enabled: false },
    ],
  },
  {
    label: "Gouvernance",
    items: [
      { label: "Comité", href: "/committee", icon: Users, permission: PERMISSIONS.COMMITTEE_ACCESS, enabled: false },
      { label: "Matrice d'évaluation", href: "/matrix", icon: Grid3x3, permission: PERMISSIONS.MATRIX_READ, enabled: false },
    ],
  },
  {
    label: "Analyses",
    items: [
      { label: "Analytique", href: "/analytics", icon: BarChart3, permission: PERMISSIONS.DASHBOARDS_VIEW, enabled: false },
      { label: "Rapports", href: "/reports", icon: FileText, permission: PERMISSIONS.DASHBOARDS_VIEW, enabled: false },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Vue d'ensemble", href: "/administration", icon: LayoutGrid, permissionsAny: [PERMISSIONS.ADMIN_USERS_MANAGE, PERMISSIONS.ADMIN_ROLES_MANAGE, PERMISSIONS.ADMIN_SETTINGS_MANAGE, PERMISSIONS.AUDIT_READ], enabled: true },
      { label: "Utilisateurs & Rôles", href: "/administration/users", icon: UsersRound, permission: PERMISSIONS.ADMIN_USERS_MANAGE, enabled: true },
      { label: "Journal d'audit", href: "/administration/audit", icon: ScrollText, permission: PERMISSIONS.AUDIT_READ, enabled: true },
      { label: "Paramètres", href: "/administration/settings", icon: Settings, permission: PERMISSIONS.ADMIN_SETTINGS_MANAGE, enabled: false },
    ],
  },
];
