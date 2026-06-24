"use client";

export function MotionGuard({ children }: { children: React.ReactNode }) {
  // If we shouldn't animate, we just render children
  // The actual animation components should check useReducedMotion as well,
  // but this is a useful wrapper if we want to conditionally render entirely different trees
  // or provide a context. For now, it's just a pass-through that can be used or we
  // just rely on framer-motion's built-in reduced motion handling.
  
  return <>{children}</>;
}
