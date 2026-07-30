

import {
  ShieldAlert,
  Settings,
  UserPlus,
  UserMinus,
  Key,
  FileText,
  CreditCard,
  Building,
  Activity
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ACTION_ICON_MAP: Record<string, LucideIcon> = {
  "SECURITY_ALERT": ShieldAlert,
  "CONFIG_CHANGE": Settings,
  "USER_CREATED": UserPlus,
  "USER_DELETED": UserMinus,
  "PASSWORD_RESET": Key,
  "PROJECT_CREATED": FileText,
  "INVOICE_PAID": CreditCard,
  "TENANT_CREATED": Building,
  "DEFAULT": Activity,
};

export const ACTION_COLOR_MAP: Record<string, string> = {
  "SECURITY_ALERT": "text-status-danger-text bg-status-danger-surface ring-status-danger-border",
  "CONFIG_CHANGE": "text-status-info-text bg-status-info-surface ring-status-info-border",
  "USER_CREATED": "text-theme-accent bg-action-subtle ring-theme-accent",
  "USER_DELETED": "text-status-warning-text bg-status-warning-surface ring-status-warning-border",
  "PASSWORD_RESET": "text-status-web3-text bg-status-web3-surface ring-status-web3-border",
  "PROJECT_CREATED": "text-theme-accent bg-action-subtle ring-theme-accent",
  "INVOICE_PAID": "text-theme-accent bg-action-subtle ring-theme-accent",
  "TENANT_CREATED": "text-status-info-text bg-status-info-surface ring-status-info-border",
  "DEFAULT": "text-content-secondary bg-status-neutral-surface ring-status-neutral-border",
};
