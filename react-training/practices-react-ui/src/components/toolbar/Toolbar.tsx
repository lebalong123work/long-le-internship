import type { ChangeEvent } from "react";
import "@/styles/index.css";

interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenAddModal: () => void;
}

export function Toolbar({
  searchTerm,
  onSearchChange,
  onOpenAddModal,
}: ToolbarProps) {
  return (
    <div className="form-secondary">
      <input
        className="form-secondary__search"
        type="search"
        aria-label="Search users"
        placeholder="Search users..."
        value={searchTerm}
        onChange={onSearchChange}
      />
      <button className="btn__add" type="button" onClick={onOpenAddModal}>
        Add New
      </button>
    </div>
  );
}
