import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children }) {
  return <div className="p-4">{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="border-b p-4 font-semibold text-lg">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2>{children}</h2>;
}

export function DialogFooter({ children }) {
  return <div className="border-t p-4 flex justify-end gap-2">{children}</div>;
}
