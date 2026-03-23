"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { ModalShell } from "@/components/ui/modal-shell";
import { FormField } from "@/components/ui/form-field";
import { useProjectFreelancerSearchQuery } from "@/features/projects/hooks/use-projects";
import { useAsyncSearch } from "@/hooks/use-async-search";
import { cn } from "@/lib/utils";

interface AddMemberModalProps {
  isOpen: boolean;
  projectId: string;
  currentMemberIds: string[];
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (userId: string) => void;
}

export function AddMemberModal({
  isOpen,
  projectId,
  currentMemberIds,
  isPending = false,
  onClose,
  onSubmit,
}: AddMemberModalProps) {
  const { keyword, setKeyword, normalizedKeyword, canSearch, minChars, resetSearch } = useAsyncSearch({
    debounceMs: 250,
    minChars: 2,
  });
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const { data: candidates = [], isLoading: isSearching } = useProjectFreelancerSearchQuery(
    projectId,
    normalizedKeyword,
    isOpen && canSearch,
  );

  const existingMemberIdSet = React.useMemo(() => new Set(currentMemberIds), [currentMemberIds]);
  const visibleCandidates = React.useMemo(
    () => candidates.filter((candidate) => !existingMemberIdSet.has(candidate.userId)),
    [candidates, existingMemberIdSet],
  );

  React.useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    const stillVisible = visibleCandidates.some((candidate) => candidate.userId === selectedUserId);
    if (!stillVisible) {
      setSelectedUserId("");
    }
  }, [visibleCandidates, selectedUserId]);

  React.useEffect(() => {
    if (!isOpen) {
      resetSearch();
      setSelectedUserId("");
      setError(null);
    }
  }, [isOpen, resetSearch]);

  const handleSubmit = () => {
    if (!selectedUserId) {
      setError("Please choose a freelancer from search results.");
      return;
    }

    setError(null);
    onSubmit(selectedUserId);
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || !selectedUserId}
        className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Adding..." : "Add Member"}
      </button>
    </>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      isPending={isPending}
      title="Add Freelancer Member"
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <div className="space-y-5">
        <FormField label="Search freelancer by name or email" error={error ?? undefined}>
          <input
            autoFocus
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="e.g. jane or freelancer@demo.com"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </FormField>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 max-h-72 overflow-auto">
          {!canSearch ? (
            <p className="px-4 py-3 text-xs text-slate-500">Type at least {minChars} characters to search.</p>
          ) : isSearching ? (
            <p className="px-4 py-3 text-xs text-slate-500">Searching freelancers...</p>
          ) : visibleCandidates.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-500">No available freelancer found.</p>
          ) : (
            visibleCandidates.map((candidate) => {
              const isSelected = selectedUserId === candidate.userId;
              return (
                <button
                  key={candidate.userId}
                  type="button"
                  aria-pressed={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSelectedUserId(candidate.userId);
                    setError(null);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-slate-800 last:border-b-0 transition-colors flex items-start justify-between gap-3",
                    isSelected ? "bg-emerald-500/15" : "hover:bg-slate-800/60",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{candidate.fullName || candidate.email}</p>
                    <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                  </div>
                  {isSelected ? <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" /> : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </ModalShell>
  );
}
