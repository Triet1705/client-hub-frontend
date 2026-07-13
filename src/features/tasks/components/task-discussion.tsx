"use client";

import { ContextualDiscussion } from "@/features/communication/components/contextual-discussion";

interface TaskDiscussionProps {
  taskId: string;
}

export function TaskDiscussion({ taskId }: TaskDiscussionProps) {
  return (
    <ContextualDiscussion
      targetType="TASK"
      targetId={taskId}
      emptyTitle="No discussion yet"
      emptyDescription="Start a conversation about this task. The assignee or project owner will be notified."
      className="-m-6 h-full"
    />
  );
}
