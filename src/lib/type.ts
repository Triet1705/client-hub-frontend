export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  CRYPTO_ESCROW_WAITING = "CRYPTO_ESCROW_WAITING",
  DEPOSIT_DETECTED = "DEPOSIT_DETECTED",
  LOCKED = "LOCKED",
  DISPUTED = "DISPUTED",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  OVERDUE = "OVERDUE",
  EXPIRED = "EXPIRED",
}

/**
 * Task status enum - matches backend TaskStatus.java
 */
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  CANCELED = "CANCELED",
}

/**
 * Payment method enum - matches backend PaymentMethod.java
 */
export enum PaymentMethod {
  FIAT = "FIAT",
  CRYPTO_ESCROW = "CRYPTO_ESCROW",
  CRYPTO_DIRECT = "CRYPTO_DIRECT",
}

/**
 * Escrow status enum - matches backend EscrowStatus.java
 */
export enum EscrowStatus {
  NOT_STARTED = "NOT_STARTED",
  DEPOSITED = "DEPOSITED",
  RELEASED = "RELEASED",
  REFUNDED = "REFUNDED",
  DISPUTED = "DISPUTED",
}

/**
 * User role enum
 */
export enum Role {
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
  ADMIN = "ADMIN",
}

/**
 * Task priority enum
 */
export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

/**
 * Project status enum
 */
export enum ProjectStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Invoice {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  projectId?: string;
  clientId?: string;
  freelancerId?: string;
  smartContractId?: string;
  txHash?: string;
  walletAddress?: string;
  escrowStatus?: EscrowStatus;
  confirmations?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Task interface - matches backend TaskResponse.java
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectTitle?: string;
  assignedTo?: UserSummary;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User summary DTO
 */
export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role?: Role;
}

/**
 * Project interface
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  clientId: string;
  freelancerId?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

/**
 * Paginated Response
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
