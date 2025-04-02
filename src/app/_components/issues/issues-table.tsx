"use client";

import type { DataTableRowAction } from "@/types/data-table";
import * as React from "react";

import { DataTable } from "@/components/data-table";
import { useDataTable } from "@/hooks/use-data-table";

import { DataTableAdvancedToolbar } from "@/components/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table-filter-list";
import { DataTableFilterMenu } from "@/components/data-table-filter-menu";
import { DataTableSortList } from "@/components/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import type {
  GetIssues,
  getIssues,
  getIssueStatusCounts
} from "../../_lib/queries";
import { useFeatureFlags } from "../feature-flags-provider";
import { getIssuesTableColumns } from "./issues-table-columns";

interface IssuesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getIssues>>,
      Awaited<ReturnType<typeof getIssueStatusCounts>>,
    ]
  >;
}

export function IssuesTable({ promises }: IssuesTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

  const [
    { data, pageCount, total },
    statusCounts,
  ] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<GetIssues> | null>(null);

  const columns = React.useMemo(
    () =>
      getIssuesTableColumns({
        statusCounts,
        setRowAction,
      }),
    [statusCounts],
  );

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    rowCount: total,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable
        table={table}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} align="start" />
            {filterFlag === "advancedFilters" ? (
              <DataTableFilterList
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
                align="start"
              />
            ) : (
              <DataTableFilterMenu
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
              />
            )}
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        )}
      </DataTable>
    </>
  );
}
