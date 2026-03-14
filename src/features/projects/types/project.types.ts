export enum ProjectStatus {
    PLANNING = "PLANNING",
    IN_PROGRESS = "IN_PROGRESS",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export type PaymentMethod = "FIAT" | "CRYPTO_ESCROW" | "CRYPTO_DIRECT";

export interface Project {
    id: string;
    title: string;
    description: string | null;
    status: ProjectStatus;
    budget: string | null;
    deadline: string | null;    // ISO date yyyy-MM-dd from backend LocalDate
    createdAt: string;          // Instant → ISO-8601 string
    updatedAt: string;          // Instant → ISO-8601 string

    ownerId: string;            // UUID serialized as string
    ownerEmail: string;
    ownerName: string;
    paymentMethod?: PaymentMethod;
}

export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

export interface ProjectRequestPayload {
    title: string;
    description?: string;
    budget?: string;
    deadline?: string;          // ISO date yyyy-MM-dd
    status?: ProjectStatus;
}

export interface ProjectMember {
    userId: string;
    email: string;
    fullName: string;
    role: "CLIENT" | "FREELANCER" | "ADMIN";
    addedAt?: string;
}

export interface ProjectFreelancerCandidate {
    userId: string;
    email: string;
    fullName: string;
    role: "FREELANCER";
}

export interface ProjectInvoice {
    id: string;
    invoiceNumber?: string;
    amount: string;
    status: string;             // DRAFT | SENT | PAID | OVERDUE | LOCKED
    createdAt?: string;
}