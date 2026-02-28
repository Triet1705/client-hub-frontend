import { ComponentType } from "react";
import {
  NavDashboardIcon,
  NavProjectsIcon,
  NavTasksIcon,
  NavInvoicesIcon,
  NavCommunicationIcon,
  NavAdminIcon,
  ActionEditIcon,
  ActionDeleteIcon,
  ActionPlusIcon,
  ActionSearchIcon,
  ActionViewIcon,
  ActionFilterIcon,
  FilePdfIcon,
  UploadCloudIcon,
  NotificationBellIcon,
  BlockchainPendingIcon,
  BlockchainVerificationBadge,
  CryptographicLockIcon,
  EscrowWaitingIcon,
  FundsReleasedIcon,
  WalletIcon,
  NetworkPolygonIcon,
  AiMagicIcon,
  MilestoneIcon,
  RiskWarningIcon,
  ClientHubLogo,
  EmailIcon,
  PasswordIcon,
  VisibilityOpenIcon,
  VisibilityClosedIcon,
  WorkspaceDomainIcon,
} from "./index";
export interface IconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string; // Blueprint Blue
  accentColor?: string; // Cyber Mint
  alertColor?: string;
}

export type IconName = keyof typeof ICON_REGISTRY;

export const ICON_REGISTRY = {
  "nav-dashboard": NavDashboardIcon,
  "nav-projects": NavProjectsIcon,
  "nav-tasks": NavTasksIcon,
  "nav-invoices": NavInvoicesIcon,
  "nav-communication": NavCommunicationIcon,
  "nav-admin": NavAdminIcon,
  "action-edit": ActionEditIcon,
  "action-delete": ActionDeleteIcon,
  "action-plus": ActionPlusIcon,
  "action-search": ActionSearchIcon,
  "action-view": ActionViewIcon,
  "action-filter": ActionFilterIcon,
  "action-upload": UploadCloudIcon,
  "action-notification": NotificationBellIcon,
  "file-pdf": FilePdfIcon,
  "blockchain-pending": BlockchainPendingIcon,
  "blockchain-verified": BlockchainVerificationBadge,
  "blockchain-lock": CryptographicLockIcon,
  "blockchain-escrow-waiting": EscrowWaitingIcon,
  "blockchain-funds-released": FundsReleasedIcon,
  "blockchain-wallet": WalletIcon,
  "blockchain-polygon": NetworkPolygonIcon,
  "ai-magic": AiMagicIcon,
  "status-milestone": MilestoneIcon,
  "status-risk": RiskWarningIcon,
  "logo-client-hub": ClientHubLogo,
  "control-email": EmailIcon,
  "control-password": PasswordIcon,
  "control-visibility-open": VisibilityOpenIcon,
  "control-visibility-closed": VisibilityClosedIcon,
  "control-workspace-domain": WorkspaceDomainIcon,
} as const satisfies Record<string, ComponentType<IconProps>>;

export function getIcon(name: IconName): ComponentType<IconProps> {
  const IconComponent = ICON_REGISTRY[name];

  if (!IconComponent) {
    throw new Error(
      `Icon "${name}" not found in registry. Available icons: ${Object.keys(ICON_REGISTRY).join(", ")}`,
    );
  }

  return IconComponent;
}

export function hasIcon(name: string): name is IconName {
  return name in ICON_REGISTRY;
}

export function getIconNames(): IconName[] {
  return Object.keys(ICON_REGISTRY) as IconName[];
}

export interface IconComponentProps extends IconProps {
  name: IconName;
}

export function Icon({ name, ...props }: IconComponentProps) {
  const IconComponent = ICON_REGISTRY[name];
  return <IconComponent {...props} />;
}

export const ICON_GROUPS = {
  navigation: [
    "nav-dashboard",
    "nav-projects",
    "nav-tasks",
    "nav-invoices",
    "nav-communication",
    "nav-admin",
  ] as const,

  actions: [
    "action-edit",
    "action-delete",
    "action-plus",
    "action-search",
    "action-view",
    "action-filter",
    "action-upload",
    "action-notification",
  ] as const,

  blockchain: [
    "blockchain-pending",
    "blockchain-verified",
    "blockchain-lock",
    "blockchain-wallet",
    "blockchain-polygon",
  ] as const,

  ai: ["ai-magic"] as const,

  status: ["status-milestone", "status-risk"] as const,

  files: ["file-pdf"] as const,

  branding: ["logo-client-hub"] as const,
} as const;

export type IconsByGroup<T extends keyof typeof ICON_GROUPS> =
  (typeof ICON_GROUPS)[T][number];
