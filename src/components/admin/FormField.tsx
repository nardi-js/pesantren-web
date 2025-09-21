import React, { useId } from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string; // optional explicit id for control
  describedByExtra?: string; // allow external describedBy chaining
}

export function FormField({
  label,
  children,
  hint,
  error,
  required,
  id,
  describedByExtra,
}: FormFieldProps) {
  const reactId = useId();
  const inputId = id || `ff-${reactId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [error ? errorId : null, !error && hint ? hintId : null, describedByExtra]
      .filter(Boolean)
      .join(" ") || undefined;

  let control = children;
  if (React.isValidElement(children) && children.type !== React.Fragment) {
    const existingId = (children.props as Record<string, unknown>).id as
      | string
      | undefined;
    const controlProps: Record<string, unknown> = {
      id: existingId || inputId,
      "aria-describedby": describedBy,
      "aria-invalid": !!error || undefined,
    };
    if (required) {
      controlProps.required = true;
      controlProps["aria-required"] = "true";
    }
    control = React.cloneElement(children as React.ReactElement, controlProps);
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {control}
      {hint && !error && (
        <p
          id={hintId}
          className="text-[11px] text-slate-500 dark:text-slate-400"
        >
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
