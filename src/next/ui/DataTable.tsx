import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface DataTableProps {
  columns: { key: string; header: string; align?: "left" | "right" | "center" }[];
  rows: { key: string; cells: ReactNode[]; current?: boolean }[];
  caption: string;
}

const ALIGN_CLASS: Record<"left" | "right" | "center", string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * DataTable is a plain reference table (exp, cost, ratio) with an optional highlighted current row.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const DataTable = ({ columns, rows, caption }: DataTableProps) => (
  <table>
    <caption className="sr-only">{caption}</caption>
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              "px-2 py-2 text-xs font-normal text-tertiary",
              ALIGN_CLASS[column.align ?? "left"]
            )}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr
          key={row.key}
          aria-current={row.current ? "true" : undefined}
          className={cn(row.current && "bg-dark text-primary")}
        >
          {row.cells.map((cell, index) => (
            <td
              key={columns[index]?.key ?? index}
              className={cn(
                "border-t border-white/5 px-2 py-2 text-sm",
                ALIGN_CLASS[columns[index]?.align ?? "left"]
              )}
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default DataTable;
