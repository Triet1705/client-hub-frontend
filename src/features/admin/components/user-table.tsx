"use client";

import * as React from "react";
import { useAdminUsersQuery } from "@/features/admin/hooks/use-admin";
import type { Role } from "@/features/auth/types/auth.types";
import { UserDetailSlideover } from "./user-detail-slideover";
import { RoleBadge } from "./role-badge";
import { Pagination } from "@/components/ui/pagination";
import { format } from "date-fns";
import type { AdminUser } from "../types/admin.types";

interface UserTableProps {
  keyword: string;
  role: Role | "ALL";
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function UserTable({ keyword, role, status }: UserTableProps) {
  const [page, setPage] = React.useState(0);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null);

  const { data, isLoading } = useAdminUsersQuery({
    page,
    size: 20,
    keyword: keyword || undefined,
    role: role === "ALL" ? undefined : role,
    active: status === "ALL" ? undefined : status === "ACTIVE",
    sortBy: "createdAt",
    sortDir: "desc",
  });


  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Registered</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No users found matching the current filters.
                  </td>
                </tr>
              ) : (
                data?.content.map((u) => (
                  <tr key={u.id} className="group bg-slate-800/20 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="px-6 py-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                          {(u.fullName || u.email).substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{u.fullName || "—"}</p>
                          <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                        </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{u.tenantId || "default"}</td>
                    <td className="px-6 py-4">
                      {u.active ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-500 tracking-wider uppercase">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-600" />
                          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                        className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-2">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={setPage}
            label="users"
          />
        </div>
      )}
      {selectedUser && (
        <UserDetailSlideover 
          userId={selectedUser.id} 
          isOpen={!!selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}
