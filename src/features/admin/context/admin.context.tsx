"use client";

import * as React from "react";

interface AdminContextValue {
  isAdmin: boolean;
}

const AdminContext = React.createContext<AdminContextValue>({ isAdmin: false });

export function AdminProvider({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  return React.useContext(AdminContext);
}
