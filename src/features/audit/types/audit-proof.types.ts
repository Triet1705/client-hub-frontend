export type AuditVerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "NOT_ANCHORED"
  | "TAMPERED"
  | "CHAIN_UNAVAILABLE";

export interface UserAuditProof {
  auditLogId: number | null;
  proofAvailable: boolean;
  verificationStatus: AuditVerificationStatus;
  batchStatus: string | null;
  anchoredAt: string | null;
  confirmations: number;
  chainId: number | null;
  transactionHash: string | null;
  contractAddress: string | null;
  hashVersion: string | null;
  leafHash: string | null;
  leafIndex: number;
  proof: string[];
  merkleRoot: string | null;
  confirmedBlock: string | null;
}
