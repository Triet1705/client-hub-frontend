"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserCertificates } from "../api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ExternalLink, Award, FileText, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function CertificatesView() {
  const { user } = useAuthStore();
  
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: () => getUserCertificates(user?.id as string),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-surface-1/50 border border-surface-2 rounded-xl h-64" />
        ))}
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="bg-surface-1 border border-surface-2 p-12 flex flex-col items-center justify-center text-center rounded-xl">
        <div className="h-16 w-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
          <Award className="h-8 w-8 text-foreground/50" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">No Certificates Yet</h3>
        <p className="text-foreground/60 max-w-md">
          Complete projects and receive payments through the platform to automatically mint your Soulbound Work Certificates.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => (
        <div key={cert.id} className="bg-surface-1 border border-surface-2 overflow-hidden hover:border-primary/50 transition-colors group rounded-xl">
          <div className="pb-4 border-b border-surface-2/50 bg-surface-2/20 p-6">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs font-mono text-foreground/50 bg-surface-2 px-2 py-1 rounded-md">
                Demo Record
              </span>
            </div>
            <h3 className="text-lg mt-4 text-foreground truncate font-semibold">
              {cert.projectName}
            </h3>
            <p className="text-foreground/60 text-sm flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(cert.mintedAt), "MMM d, yyyy")}
            </p>
          </div>
          <div className="pt-4 space-y-4 p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/60 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5"/> Token ID</span>
                <span className="font-mono text-foreground">{cert.tokenId}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/60 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5"/> Metadata</span>
                <Link 
                  href={`https://ipfs.io/ipfs/${cert.metadataUri.replace('ipfs://', '')}`} 
                  target="_blank"
                  className="flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  View JSON <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-surface-2 px-4 py-2 text-sm text-foreground/70">
              Demo/off-chain certificate record. On-chain verification is hidden until real SBT minting is enabled.
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
