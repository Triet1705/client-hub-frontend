

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
  "SECURITY_ALERT": "text-rose-400 bg-rose-500/10 ring-rose-500/30",
  "CONFIG_CHANGE": "text-blue-400 bg-blue-500/10 ring-blue-500/30",
  "USER_CREATED": "text-emerald-400 bg-emerald-500/10 ring-emerald-500/30",
  "USER_DELETED": "text-amber-400 bg-amber-500/10 ring-amber-500/30",
  "PASSWORD_RESET": "text-indigo-400 bg-indigo-500/10 ring-indigo-500/30",
  "PROJECT_CREATED": "text-emerald-400 bg-emerald-500/10 ring-emerald-500/30",
  "INVOICE_PAID": "text-emerald-400 bg-emerald-500/10 ring-emerald-500/30",
  "TENANT_CREATED": "text-blue-400 bg-blue-500/10 ring-blue-500/30",
  "DEFAULT": "text-slate-400 bg-slate-500/10 ring-slate-500/30",
};
