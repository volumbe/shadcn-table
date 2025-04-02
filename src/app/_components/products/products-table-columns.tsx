"use client";

import { type Product } from "@/db/schema";
import type { DataTableRowAction } from "@/types/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CalendarIcon,
  CircleDashed,
  Clock,
  Ellipsis,
  Text,
} from "lucide-react";
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
import { GetProducts } from "../../_lib/queries";
interface GetProductsTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<GetProducts> | null>
  >;
}

export function getProductsTableColumns({
  setRowAction,
}: GetProductsTableColumnsProps): ColumnDef<GetProducts>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.original.name;

        return (
          <div className="flex items-center gap-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {name}
            </span>
          </div>
        );
      },
      meta: {
        label: "Name",
        placeholder: "Search names...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "brandName",
      accessorKey: "brandName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      cell: ({ row }) => {
        const brand = row.original.brandName;

        return (
          <div className="flex items-center gap-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {brand}-{row.original.brandId}
            </span>
          </div>
        );
      },
      meta: {
        label: "Brand",
        placeholder: "Search brands...",
        variant: "text",
        icon: Text,
      },
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) => formatDate(row.original.updatedAt),
      meta: {
        label: "Updated At",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },
  ];
}
