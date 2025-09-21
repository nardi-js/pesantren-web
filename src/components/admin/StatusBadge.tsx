import React from "react";

interface StatusBadgeProps {
  status:
    | "published"
    | "draft"
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "inactive"
    | "completed"
    | "failed";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined";
}

export function StatusBadge({
  status,
  size = "sm",
  variant = "default",
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      published: {
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        outline:
          "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400",
      },
      draft: {
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        outline:
          "border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400",
      },
      pending: {
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        outline:
          "border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400",
      },
      approved: {
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        outline:
          "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400",
      },
      rejected: {
        color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
        outline:
          "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400",
      },
      active: {
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        outline:
          "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400",
      },
      inactive: {
        color:
          "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300",
        outline:
          "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400",
      },
      completed: {
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        outline:
          "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400",
      },
      failed: {
        color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
        outline:
          "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400",
      },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const getSizeClasses = (size: string) => {
    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    };
    return sizes[size as keyof typeof sizes] || sizes.sm;
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const colorClasses =
    variant === "outlined"
      ? `border ${config.outline} bg-transparent`
      : config.color;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${colorClasses}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
