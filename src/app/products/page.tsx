import type { SearchParams } from "@/types";
import * as React from "react";

import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { Shell } from "@/components/shell";
import { getValidFilters } from "@/lib/data-table";

import { FeatureFlagsProvider } from "../_components/feature-flags-provider";
import {
  getProducts,
} from "../_lib/queries";
import { productsSearchParamsCache } from "../_lib/validations";
import { ProductsTable } from "../_components/products/products-table";
interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = productsSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getProducts({
      ...search,
      filters: validFilters,
    }),
  ]);

  return (
    <Shell className="gap-2">
      <FeatureFlagsProvider>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={7}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
                "6rem",
              ]}
              shrinkZero
            />
          }
        >
          <ProductsTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  );
}
