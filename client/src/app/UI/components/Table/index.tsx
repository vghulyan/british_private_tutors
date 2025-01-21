import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row?: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  initialPageSize?: number;
  showGlobalFilter?: boolean;
  getRowProps?: (row: any) => React.HTMLAttributes<HTMLTableRowElement>;
}

function Table({
  columns,
  data,
  initialPageSize = 10,
  showGlobalFilter = false,
  getRowProps = () => ({}),
}: TableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Compute filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Global filter
    if (showGlobalFilter && globalFilter.trim() !== "") {
      const search = globalFilter.toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(search);
        })
      );
    }

    // Column filters
    Object.keys(columnFilters).forEach((colKey) => {
      const search = columnFilters[colKey].toLowerCase();
      filtered = filtered.filter((row) => {
        const value = row[colKey];
        return value && value.toString().toLowerCase().includes(search);
      });
    });

    // Sorting
    if (sortColumn && sortDirection) {
      const col = columns.find((c) => c.key === sortColumn);
      if (col) {
        filtered.sort((a, b) => {
          const aVal = a[sortColumn];
          const bVal = b[sortColumn];

          if (aVal === bVal) return 0;
          if (sortDirection === "asc") {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal > bVal ? -1 : 1;
          }
        });
      }
    }

    return filtered;
  }, [
    data,
    columns,
    globalFilter,
    columnFilters,
    sortColumn,
    sortDirection,
    showGlobalFilter,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      // toggle direction
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(colKey);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (colKey: string) => {
    if (sortColumn !== colKey) return null;
    if (sortDirection === "asc")
      return <ChevronUp className="w-4 h-4 inline-block" />;
    if (sortDirection === "desc")
      return <ChevronDown className="w-4 h-4 inline-block" />;
    return null;
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Global Filter */}
      {showGlobalFilter && (
        <div>
          <input
            type="text"
            placeholder="Global search..."
            className="border p-2 rounded w-full"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setCurrentPage(1); // reset page
            }}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 text-left text-sm font-semibold text-gray-900"
                >
                  <div className="flex items-center space-x-1">
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="flex items-center space-x-1"
                      >
                        <span>{col.label}</span>
                        {renderSortIcon(col.key)}
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </div>
                  {col.filterable && (
                    <input
                      type="text"
                      placeholder={`Filter ${col.label}...`}
                      className="border p-1 mt-1 w-full text-sm"
                      value={columnFilters[col.key] || ""}
                      onChange={(e) => {
                        setColumnFilters((prev) => ({
                          ...prev,
                          [col.key]: e.target.value,
                        }));
                        setCurrentPage(1);
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, idx) => (
              <tr key={idx} {...getRowProps(row)} className="hover:bg-gray-50">
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="p-3 text-sm text-gray-700">
                      {col.render ? col.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-3 text-center text-sm text-gray-500"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2 items-center">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <select
            className="border p-1 text-sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Table;
