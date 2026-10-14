import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { Overlay } from "@/components/common/Overlay";
import type { User } from "@/types/user";
import { FormField } from "./FormField";

type UserFormValues = Omit<User, "id">;

interface UserFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData: User | null;
  onClose: () => void;
  onSubmit: (data: UserFormValues) => void;
}

const emptyValues: UserFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  phone_number: "",
};

export function UserFormModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <UserFormContent
        key={`${mode}:${initialData?.id ?? "new"}`}
        mode={mode}
        initialData={initialData}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Overlay>
  );
}

interface UserFormContentProps {
  mode: UserFormModalProps["mode"];
  initialData: UserFormModalProps["initialData"];
  onClose: UserFormModalProps["onClose"];
  onSubmit: UserFormModalProps["onSubmit"];
}

function UserFormContent({
  mode,
  initialData,
  onClose,
  onSubmit,
}: UserFormContentProps) {
  const [values, setValues] = useState<UserFormValues>(() => ({
    email: initialData?.email ?? emptyValues.email,
    first_name: initialData?.first_name ?? emptyValues.first_name,
    last_name: initialData?.last_name ?? emptyValues.last_name,
    phone_number: initialData?.phone_number ?? emptyValues.phone_number,
  }));

  const handleChange =
    (field: keyof UserFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form
      className="form-primary form-update"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
      onSubmit={handleSubmit}
    >
      <button
        className="close-btn"
        type="button"
        aria-label="Close user form"
        onClick={onClose}
      >
        Close
      </button>
      <h2 className="title form-title" id="user-form-title">
        {mode === "create" ? "Create User" : "Edit User"}
      </h2>
      <FormField
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange("email")}
        placeholder="Enter email"
        maxLength={40}
        autoComplete="email"
      />
      <FormField
        label="First Name"
        name="first_name"
        type="text"
        value={values.first_name}
        onChange={handleChange("first_name")}
        placeholder="Enter first name"
        autoComplete="given-name"
      />
      <FormField
        label="Last Name"
        name="last_name"
        type="text"
        value={values.last_name}
        onChange={handleChange("last_name")}
        placeholder="Enter last name"
        autoComplete="family-name"
      />
      <FormField
        label="Phone Number"
        name="phone_number"
        type="tel"
        value={values.phone_number}
        onChange={handleChange("phone_number")}
        placeholder="Enter phone number"
        maxLength={10}
        autoComplete="tel"
      />
      <Button className="form-submit" type="submit" variant="primary">
        {mode === "create" ? "Create User" : "Update User"}
      </Button>
    </form>
  );
}
