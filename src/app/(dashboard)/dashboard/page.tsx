import * as React from "react";
import { Metadata } from "next";
import { DashboardClient } from "./_components/dashboard-client";

export const metadata: Metadata = {
  title: "Client Hub | Overview",
  description: "Your workspace overview and escrow status.",
};

export default function DashboardPage() {
  return (
    <DashboardClient />
  );
}
