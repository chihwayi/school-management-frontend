import React from 'react';
import { cn } from '../../utils';

// Props interfaces
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  onSort?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

// Subcomponents
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={cn('bg-gray-50', className)}>{children}</thead>
);

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
  <tbody className={cn('divide-y divide-gray-200 bg-white', className)}>{children}</tbody>
);

const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => (
  <tr
    className={cn(onClick ? 'cursor-pointer hover:bg-gray-50' : '', className)}
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className, sortable = false, onSort }) => (
  <th
    className={cn(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      sortable ? 'cursor-pointer hover:bg-gray-100' : '',
      className
    )}
    onClick={sortable ? onSort : undefined}
  >
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      {sortable && (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      )}
    </div>
  </th>
);

const TableCell: React.FC<TableCellProps> = ({ children, className }) => (
  <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
    {children}
  </td>
);

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data',
  description = 'No records found.',
  action
}) => (
  <div className="text-center py-12">
    <div className="mx-auto h-12 w-12 text-gray-400">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// Extend base Table with subcomponents
type TableComponent = React.FC<TableProps> & {
  Header: typeof TableHeader;
  Body: typeof TableBody;
  Row: typeof TableRow;
  HeaderCell: typeof TableHeaderCell;
  Cell: typeof TableCell;
  EmptyState: typeof EmptyState;
};

const Table: TableComponent = ({ children, className }) => (
  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table className={cn('min-w-full divide-y divide-gray-300', className)}>
      {children}
    </table>
  </div>
);

// Assign subcomponents
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;
Table.EmptyState = EmptyState;

export default Table;
