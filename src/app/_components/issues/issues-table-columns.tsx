"use client";

import { ComplianceIssue, complianceIssues, products, type Product } from "@/db/schema";
import type { DataTableRowAction } from "@/types/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CalendarIcon, CircleDashed, Clock, Ellipsis, Check, Text } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/handle-error";

import { updateTask } from "../../_lib/actions";
import { getPriorityIcon, getStatusIcon } from "../../_lib/utils";
import { GetIssues } from "../../_lib/queries";
import Link from "next/link";
interface GetIssuesTableColumnsProps {
  statusCounts: Record<ComplianceIssue["status"], number>;
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<GetIssues> | null>>;
}

export function getIssuesTableColumns({ statusCounts, setRowAction }: GetIssuesTableColumnsProps): ColumnDef<GetIssues>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "formattedId",
      accessorKey: "formattedId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issue ID" />,
      cell: ({ row }) => {
        const formattedId = row.original.formattedId;

        return (
          <div className="flex items-center gap-2">
            <span className="max-w-[31.25rem] truncate font-medium">{formattedId}</span>
          </div>
        );
      },
      meta: {
        label: "Issue ID",
        placeholder: "Search issues...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "traceUrl",
      accessorKey: "traceUrl",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trace URL" />,
      cell: ({ row }) => {
        const traceUrl = row.original.traceUrl;

        return (
          <div className="flex items-center gap-2">
            <Link target="_blank" href={traceUrl ?? ""} className="max-w-[8rem] truncate font-medium">{traceUrl}</Link>
          </div>
        );
      },
      meta: {
        label: "Trace URL",
      },
      enableColumnFilter: false,
    },
    {
      id: "isValid",
      accessorKey: "isValid",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Is Valid" />,
      cell: ({ row }) => {
        const isValid = row.original.isValid;

        return (
          <div className="flex items-center gap-2">
            <span className="max-w-[31.25rem] truncate font-medium">{isValid ? "Yes" : "No"}</span>
          </div>
        );
      },
      meta: {
        label: "Is Valid",
        variant: "boolean",
        icon: Check,
      },
      enableColumnFilter: true,
      enableSorting: false,
    },
    {
      id: "screenshot",
      accessorKey: "screenshot",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Has Screenshot" />,
      cell: ({ row }) => {
        const hasScreenshot = row.original.screenshot !== null;

        return (
          <div className="flex items-center gap-2">
            <span className="max-w-[31.25rem] truncate font-medium">{hasScreenshot ? "Yes" : "No"}</span>
          </div>
        );
      },
      meta: {
        label: "Has Screenshot",
        variant: "text",
        icon: Text,
      },
      enableSorting: false,
    },
    {
      id: "violatingContent",
      accessorKey: "violatingContent",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Violating Quote" />,
      cell: ({ row }) => {
        const violatingContent = row.original.violatingContent;

        return (
          <p className="line-clamp-4 max-w-[31.25rem] truncate text-xs">
            {violatingContent}
          </p>
        );
      },
      meta: {
        label: "Violating Quote",
        placeholder: "Search quote...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "explanation",
      accessorKey: "explanation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Explanation" />,
      cell: ({ row }) => {
        const explanation = row.original.explanation;

        return (
          <p className="line-clamp-4 max-w-[31.25rem] truncate text-xs">
            {explanation}
          </p>
        );
      },
      meta: {
        label: "Explanation",
        placeholder: "Search explanation...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "contentId",
      accessorKey: "contentId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Content ID" />,
      cell: ({ row }) => {
        const contentId = row.original.contentId;

        return (
          <p className="line-clamp-4 max-w-[31.25rem] truncate text-xs">
            {contentId}
          </p>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ cell }) => {
        const status = complianceIssues.status.enumValues.find(
          (status) => status === cell.getValue<ComplianceIssue["status"]>(),
        );

        if (!status) return null;

        return (
          <Badge variant="outline" className="py-1 [&>svg]:size-3.5">
            <span className="capitalize">{status}</span>
          </Badge>
        );
      },
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: complianceIssues.status.enumValues.map((status) => ({
          label: status.charAt(0).toUpperCase() + status.slice(1),
          value: status,
          count: statusCounts[status],
        })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Detected" />,
      cell: ({ row }) => formatDate(row.original.createdAt),
      meta: {
        label: "Detected",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },
  ];
}
