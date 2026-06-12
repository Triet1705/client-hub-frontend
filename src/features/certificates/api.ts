import { apiClient } from "@/lib/axios";

export interface CertificateResponse {
  id: number;
  userId: string;
  projectId: string;
  projectName: string;
  tokenId: string;
  metadataUri: string;
  transactionHash: string;
  mintedAt: string;
}

export async function getUserCertificates(userId: string): Promise<CertificateResponse[]> {
  const { data } = await apiClient.get<CertificateResponse[]>(`/certificates/${userId}`);
  return data;
}
