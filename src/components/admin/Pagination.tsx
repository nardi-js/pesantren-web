import React, { ReactNode } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end of visible range
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push("...");
        }
      }

      // Add visible page range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const PageButton = ({
    children,
    onClick,
    disabled = false,
    active = false,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${
          active
            ? "bg-sky-600 text-white"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "border border-slate-300 dark:border-slate-600"
        }
      `}
    >
      {children}
    </button>
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-700 dark:text-slate-300">
        Showing page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-1">
        {showFirstLast && (
          <PageButton
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </PageButton>
        )}

        {showPrevNext && (
          <PageButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
        )}

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === "number" ? (
              <PageButton
                onClick={() => onPageChange(page)}
                active={page === currentPage}
              >
                {page}
              </PageButton>
            ) : (
              <span className="px-3 py-2 text-slate-500">{page}</span>
            )}
          </React.Fragment>
        ))}

        {showPrevNext && (
          <PageButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        )}

        {showFirstLast && (
          <PageButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </PageButton>
        )}
      </div>
    </div>
  );
}
