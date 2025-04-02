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
  GetProducts,
  getProducts
} from "../../_lib/queries";
import { useFeatureFlags } from "../feature-flags-provider";
import { getProductsTableColumns } from "./products-table-columns";

interface ProductsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProducts>>,
    ]
  >;
}

export function ProductsTable({ promises }: ProductsTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

  const [
    { data, pageCount },
  ] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<GetProducts> | null>(null);

  const columns = React.useMemo(
    () =>
      getProductsTableColumns({
        setRowAction,
      }),
    [],
  );

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
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
