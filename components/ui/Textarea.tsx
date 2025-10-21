import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxCharCount?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      showCharCount = false,
      maxCharCount,
      disabled,
      id,
      value,
      ...props
    },
    ref,
  ) => {
    const textareaId =
      id || props.name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral"
          >
            {label}
            {props.required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-[100px] rounded-lg border-2 border-neutral/20 bg-white px-4 py-3 text-base text-neutral transition-colors",
            "placeholder:text-neutral/50",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "disabled:cursor-not-allowed disabled:bg-neutral/5 disabled:opacity-50",
            "resize-y",
            error &&
              "border-error-500 focus:border-error-500 focus:ring-error-500/20",
            className,
          )}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
                ? `${textareaId}-helper`
                : undefined
          }
          value={value}
          {...props}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-error-500"
                role="alert"
              >
                {error}
              </p>
            )}
            {helperText && !error && (
              <p
                id={`${textareaId}-helper`}
                className="text-sm text-neutral/70"
              >
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && maxCharCount !== undefined && (
            <p
              className={cn(
                "text-sm text-neutral/70",
                currentLength > maxCharCount && "text-error-500",
              )}
            >
              {currentLength}/{maxCharCount}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
