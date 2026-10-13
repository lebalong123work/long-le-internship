import type { ChangeEvent } from "react";

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
        className="form-secondary_search"
        type="search"
        aria-label="Search users"
        maxLength={12}
        placeholder="Search List..."
        value={searchTerm}
        onChange={onSearchChange}
      />
      <button className="btn_add" type="button" onClick={onOpenAddModal}>
        Add New
      </button>
    </div>
  );
}
