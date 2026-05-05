"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "../hooks/use-notifications";
import {
  NavTasksIcon,
  NavProjectsIcon,
  NavInvoicesIcon,
  NavCommunicationIcon,
  ActionViewIcon,
} from "@/components/icons";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function getIconForType(type: string) {
  switch (type) {
    case "NEW_COMMENT":
      return <NavCommunicationIcon className="w-5 h-5 text-emerald-400" />;
    case "TASK_ASSIGNED":
    case "TASK_COMPLETED":
      return <NavTasksIcon className="w-5 h-5 text-blue-400" />;
    case "PROJECT_COMPLETED":
    case "PROJECT_INVITE":
      return <NavProjectsIcon className="w-5 h-5 text-purple-400" />;
    case "INVOICE_PAID":
    case "INVOICE_STATUS_CHANGE":
      return <NavInvoicesIcon className="w-5 h-5 text-amber-400" />;
    default:
      return <Bell className="w-5 h-5 text-slate-400" />;
  }
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { data: pageData, isLoading } = useNotificationsQuery(false);
  const markRead = useMarkReadMutation();
  const markAllRead = useMarkAllReadMutation();

  const notifications = pageData?.content || [];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleNotificationClick = (id: number, referenceType: string | null, referenceId: string | null, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
    
    onClose();

    if (referenceType && referenceId) {
      switch (referenceType) {
        case "TASK":
          router.push(`/tasks?taskId=${referenceId}`);
          break;
        case "PROJECT":
          router.push(`/projects/${referenceId}`);
          break;
        case "INVOICE":
          router.push(`/invoices/${referenceId}`);
          break;
        default:
          break;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[32rem]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <h3 className="font-bold text-white">Notifications</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending || notifications.every(n => n.read)}
              className="text-xs text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                <Bell className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(
                    notification.id, 
                    notification.referenceType, 
                    notification.referenceId,
                    notification.read
                  )}
                  className={cn(
                    "w-full text-left p-4 hover:bg-slate-800/30 transition-colors flex items-start gap-3 relative group",
                    !notification.read ? "bg-slate-800/10" : ""
                  )}
                >
                  {!notification.read && (
                    <div className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                    !notification.read ? "bg-slate-800 border-slate-700" : "bg-transparent border-slate-800"
                  )}>
                    {getIconForType(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={cn(
                      "text-sm leading-snug",
                      !notification.read ? "text-slate-200 font-medium" : "text-slate-400"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {notification.referenceId && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <ActionViewIcon className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
