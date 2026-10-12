import type { ChangeEvent, InputHTMLAttributes } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type: "text" | "email" | "tel";
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
}

export function FormField({
  label,
  name,
  type,
  value,
  onChange,
  error,
  placeholder,
  required = true,
  autoComplete,
}: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <input
        className="form-input"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span className="form-error-msg" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
