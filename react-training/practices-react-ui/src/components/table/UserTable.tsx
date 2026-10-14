import { useState, type ChangeEvent } from "react";
import type { User } from "@/types/user";
import { EmptyState } from "./EmptyState";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const firstVisibleIndex = currentPage * pageSize;
  const pageUsers = users.slice(firstVisibleIndex, firstVisibleIndex + pageSize);

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.currentTarget.value));
    setPage(0);
  };

  return (
    <div className="table-scroll">
      <table className="table-user">
        <UserTableHeader />
        <tbody>
          {pageUsers.length === 0 ? (
            <EmptyState />
          ) : (
            pageUsers.map((user, index) => (
              <UserTableRow
                key={user.id}
                user={user}
                index={firstVisibleIndex + index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
      <footer className="table-pagination">
        <nav className="pagination-pages" aria-label="Table pages">
          <button
            className="pagination-arrow"
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            ‹
          </button>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              className={`pagination-page${index === currentPage ? " is-active" : ""}`}
              type="button"
              aria-current={index === currentPage ? "page" : undefined}
              onClick={() => setPage(index)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="pagination-arrow"
            type="button"
            aria-label="Next page"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
          >
            ›
          </button>
        </nav>
        <label className="page-size-wrap">
          <span className="visually-hidden">Users per page</span>
          <select
            className="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={10}>Display 10 items</option>
            <option value={20}>Display 20 items</option>
          </select>
        </label>
      </footer>
    </div>
  );
}
