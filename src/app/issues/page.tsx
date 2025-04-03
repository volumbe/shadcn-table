import type { SearchParams } from "@/types";
import * as React from "react";

import { DataTableSkeleton } from "@/components/data-table-skeleton";
import { Shell } from "@/components/shell";
import { getValidFilters } from "@/lib/data-table";

import { FeatureFlagsProvider } from "../_components/feature-flags-provider";
import {
  getIssues,
  getIssueStatusCounts,
} from "../_lib/queries";
import { issuesSearchParamsCache } from "../_lib/validations";
import { IssuesTable } from "../_components/issues/issues-table";
interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = issuesSearchParamsCache.parse(searchParams);
    
  console.log(search);
  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([  
    getIssues({
      ...search,
      filters: validFilters,
    }),
    getIssueStatusCounts({
      ...search,
      filters: validFilters,
    }),
  ]);

  return (
    <Shell>
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
          <IssuesTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  );
}
