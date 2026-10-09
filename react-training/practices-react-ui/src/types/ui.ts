import React from "react";
export interface UserRecord {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export type ButtonVariant = "primary" | "add" | "danger" | "neutral";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface UserFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: UserRecord | null;
  onClose: () => void;
  onSubmit: (data: Omit<UserRecord, "id">) => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  userName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export interface ToastProps {
  isOpen: boolean;
  variant: "success" | "error";
  message: string;
  onClose: () => void;
}
