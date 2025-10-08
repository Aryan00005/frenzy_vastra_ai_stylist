import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DataTable = ({ 
  title, 
  data, 
  columns, 
  onExport,
  loading = false,
  showPagination = true,
  itemsPerPage = 10 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const totalPages = Math.ceil(data?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data]?.sort((a, b) => {
      const aValue = a?.[sortColumn];
      const bValue = b?.[sortColumn];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue)?.toLowerCase();
      const bString = String(bValue)?.toLowerCase();

      if (sortDirection === 'asc') {
        return aString?.localeCompare(bString);
      } else {
        return bString?.localeCompare(aString);
      }
    });
  }, [data, sortColumn, sortDirection]);

  const paginatedData = sortedData?.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages?.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-sm text-text-secondary">
          Showing {startIndex + 1} to {Math.min(endIndex, data?.length)} of {data?.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            iconName="ChevronLeft"
          />
          
          {pages?.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            iconName="ChevronRight"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-48 h-6 bg-muted rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)]?.map((_, index) => (
            <div key={index} className="flex space-x-4">
              {columns?.map((_, colIndex) => (
                <div key={colIndex} className="flex-1 h-4 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns?.map((column) => (
                <th
                  key={column?.key}
                  className={`text-left py-3 px-4 font-medium text-text-secondary ${
                    column?.sortable ? 'cursor-pointer hover:text-primary' : ''
                  }`}
                  onClick={column?.sortable ? () => handleSort(column?.key) : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column?.label}</span>
                    {column?.sortable && (
                      <div className="flex flex-col">
                        <Icon
                          name="ChevronUp"
                          size={12}
                          color={
                            sortColumn === column?.key && sortDirection === 'asc' ?'var(--color-primary)' :'var(--color-text-secondary)'
                          }
                        />
                        <Icon
                          name="ChevronDown"
                          size={12}
                          color={
                            sortColumn === column?.key && sortDirection === 'desc' ?'var(--color-primary)' :'var(--color-text-secondary)'
                          }
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((row, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                {columns?.map((column) => (
                  <td key={column?.key} className="py-3 px-4 text-sm">
                    {column?.render ? column?.render(row?.[column?.key], row) : row?.[column?.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default DataTable;