import React from "react";

export function Button({ children, onClick, variant = "default", size = "base", className = "", disabled = false }) {
  const baseStyles = "rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizes = {
    base: "text-base",
    sm: "text-sm px-3 py-1.5",
  };
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || ""} ${sizes[size] || ""} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
