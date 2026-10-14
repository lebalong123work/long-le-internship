import { useState, type ChangeEvent } from "react";
import filterIcon from "@/assets/images/managers/filter.svg";

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
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="form-secondary">
      <div className="list-heading">
        <h2 className="list-heading_title">User catalogue</h2>
        <span className="list-heading_badge">New users</span>
      </div>
      <div className="form-secondary_controls">
        <label className="column-select-wrap">
          <span className="visually-hidden">Select a column to search</span>
          <select className="column-select" defaultValue="all">
            <option value="all">Select column</option>
            <option value="email">Username</option>
            <option value="first_name">First Name</option>
            <option value="last_name">Last Name</option>
            <option value="phone_number">Phone Number</option>
          </select>
          <span className="column-select_sort" aria-hidden="true">
            ↕
          </span>
        </label>
        <input
          className="form-secondary_search"
          type="search"
          aria-label="Search users"
          placeholder="Search List..."
          value={searchTerm}
          onChange={onSearchChange}
        />
        <div className="filter-control">
          <button
            className={`filter-button${filtersOpen ? " is-active" : ""}`}
            type="button"
            aria-label="Toggle filters"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((isOpen) => !isOpen)}
          >
            <img src={filterIcon} alt="" />
          </button>
          {filtersOpen && <span className="filter-popover">User filters</span>}
        </div>
        <button className="btn_add" type="button" onClick={onOpenAddModal}>
          Add New
        </button>
      </div>
    </div>
  );
}
