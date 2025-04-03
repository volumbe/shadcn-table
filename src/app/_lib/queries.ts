import "server-only";

import { db } from "@/db";
import { tasks, products, Product, complianceIssues, ComplianceIssue } from "@/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lte,
  sql,
} from "drizzle-orm";

import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";
import { parseAffiliateLinks } from "./validations";
import type { GetTasksSchema, GetProductsSchema, GetIssuesSchema } from "./validations";

export async function getTasks(input: GetTasksSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const advancedTable =
          input.filterFlag === "advancedFilters" ||
          input.filterFlag === "commandFilters";

        const advancedWhere = filterColumns({
          table: tasks,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
            input.title ? ilike(tasks.title, `%${input.title}%`) : undefined,
            input.status.length > 0
              ? inArray(tasks.status, input.status)
              : undefined,
            input.priority.length > 0
              ? inArray(tasks.priority, input.priority)
              : undefined,
            input.estimatedHours.length > 0
              ? and(
                input.estimatedHours[0]
                  ? gte(tasks.estimatedHours, input.estimatedHours[0])
                  : undefined,
                input.estimatedHours[1]
                  ? lte(tasks.estimatedHours, input.estimatedHours[1])
                  : undefined,
              )
              : undefined,
            input.createdAt.length > 0
              ? and(
                input.createdAt[0]
                  ? gte(
                    tasks.createdAt,
                    (() => {
                      const date = new Date(input.createdAt[0]);
                      date.setHours(0, 0, 0, 0);
                      return date;
                    })(),
                  )
                  : undefined,
                input.createdAt[1]
                  ? lte(
                    tasks.createdAt,
                    (() => {
                      const date = new Date(input.createdAt[1]);
                      date.setHours(23, 59, 59, 999);
                      return date;
                    })(),
                  )
                  : undefined,
              )
              : undefined,
          );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
              item.desc ? desc(tasks[item.id]) : asc(tasks[item.id]),
            )
            : [asc(tasks.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(tasks)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({
              count: count(),
            })
            .from(tasks)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          return {
            data,
            total,
          };
        });

        const pageCount = Math.ceil(total / input.perPage);
        return { data, pageCount, total };
      } catch (_err) {
        return { data: [], pageCount: 0, total: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 1,
      tags: ["tasks"],
    },
  )();
}


export type GetProducts = Awaited<ReturnType<typeof getProducts>>["data"][number];

export async function getProducts(input: GetProductsSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const advancedTable =
          input.filterFlag === "advancedFilters" ||
          input.filterFlag === "commandFilters";

        const advancedWhere = filterColumns({
          table: products,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
            input.name ? ilike(products.name, `%${input.name}%`) : undefined,
            input.updatedAt.length > 0
              ? and(
                input.updatedAt[0]
                  ? gte(
                    products.updatedAt,
                    (() => {
                      const date = new Date(input.updatedAt[0]);
                      date.setHours(0, 0, 0, 0);
                      return date;
                    })(),
                  )
                  : undefined,
                input.updatedAt[1]
                  ? lte(
                    products.updatedAt,
                    (() => {
                      const date = new Date(input.updatedAt[1]);
                      date.setHours(23, 59, 59, 999);
                      return date;
                    })(),
                  )
                  : undefined,
              )
              : undefined,
          );

        const sortableColumns: (keyof Product)[] = ["id", "name", "brandId", "createdAt", "updatedAt"];

        const dbSortItems = input.sort.filter((item) => sortableColumns.includes(item.id));
        const manualSortItems = input.sort.filter((item) => !sortableColumns.includes(item.id));

        const orderBy =
          input.sort.length > 0
            ?
            dbSortItems.map((item) =>
              item.desc ? desc(products[item.id as keyof Product]) : asc(products[item.id as keyof Product]),
            )
            : [asc(products.updatedAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .query.products.findMany({
              limit: input.perPage,
              offset: offset,
              where: where,
              orderBy: orderBy,
              with: {
                brand: true,
              },
            });

          const total = await tx
            .select({
              count: count(),
            })
            .from(products)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          return {
            data,
            total,
          };
        });

        const sortedData = data.map(({ brand, ...rest }) => ({ ...rest, brandName: brand.name })).sort(
          (a, b) => {
            for (const item of manualSortItems) {
              const id = item.id as keyof typeof a;
              if (a[id] === null || b[id] === null) {
                return 0;
              }
              const aValue = a[id];
              const bValue = b[id];

              if (aValue === bValue) {
                continue;
              }

              if (typeof aValue === 'number' && typeof bValue === 'number') {
                return item.desc ? bValue - aValue : aValue - bValue;
              }

              if (typeof aValue === 'string' && typeof bValue === 'string') {
                return item.desc
                  ? bValue.localeCompare(aValue)
                  : aValue.localeCompare(bValue);
              }
            }
            return 0;
          }
        );
        const pageCount = Math.ceil(total / input.perPage);
        return { data: sortedData, pageCount, total };
      } catch (_err) {
        return { data: [], pageCount: 0, total: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 1,
      tags: ["products"],
    },
  )();
}

export type GetIssues = Awaited<ReturnType<typeof getIssues>>["data"][number];


export async function getIssues(input: GetIssuesSchema) {
  try {
    const offset = (input.page - 1) * input.perPage;
    const advancedTable =
      input.filterFlag === "advancedFilters" ||
      input.filterFlag === "commandFilters";

    const advancedWhere = filterColumns({
      table: complianceIssues,
      filters: input.filters,
      joinOperator: input.joinOperator,
    });

    console.log(input.brandId);
    const where = advancedTable
      ? advancedWhere
      : and(
        input.brandId ? eq(complianceIssues.brandId, input.brandId) : undefined,
        input.status.length > 0
              ? inArray(tasks.status, input.status)
              : undefined,
        input.priority.length > 0
          ? inArray(complianceIssues.priority, input.priority)
          : undefined,
        input.issueNumber ? ilike(complianceIssues.issueNumber, `%${input.issueNumber}%`) : undefined,
        input.createdAt.length > 0
          ? and(
            input.createdAt[0]
              ? gte(
                complianceIssues.createdAt,
                (() => {
                  const date = new Date(input.createdAt[0]);
                  date.setHours(0, 0, 0, 0);
                  return date;
                })(),
              )
              : undefined,
            input.createdAt[1]
              ? lte(
                complianceIssues.createdAt,
                (() => {
                  const date = new Date(input.createdAt[1]);
                  date.setHours(23, 59, 59, 999);
                  return date;
                })(),
              )
              : undefined,
          )
          : undefined,
      );

    const sortableColumns: (keyof ComplianceIssue)[] = ["id", "risk", "issueNumber", "status", "scorecardItemId", "documentId", "contentId", "context", "affiliateId", "brandId", "createdAt", "updatedAt"];

    const dbSortItems = input.sort.filter((item) => sortableColumns.includes(item.id));
    const manualSortItems = input.sort.filter((item) => !sortableColumns.includes(item.id));

    const orderBy =
      input.sort.length > 0
        ?
        dbSortItems.map((item) =>
          item.desc ? desc(complianceIssues[item.id as keyof ComplianceIssue]) : asc(complianceIssues[item.id as keyof ComplianceIssue]),
        )
        : [asc(complianceIssues.updatedAt)];

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .query.complianceIssues.findMany({
          limit: input.perPage,
          offset: offset,
          where: where,
          orderBy: orderBy,
          with: {
            content: {
              with: {
                affiliate: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            brand: {
              columns: {
                id: true,
                name: true,
              },
            },
            document: {
              columns: {
                name: true,
                type: true,
              },
            },
            user: true,
            complianceScan: {
              columns: {
                id: true,
                createdAt: true,
                completedAt: true,
              },
            },
            contentSnapshot: {
              columns: {
                disclosures: true,
                affiliateLinks: true,
                createdAt: true,
              },
            },
            brandScorecardItem: true,
          },
        });

      const total = await tx
        .select({
          count: count(),
        })
        .from(complianceIssues)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return {
        data,
        total,
      };
    });

    const sortedData = data.map(({ brand, content, contentSnapshot, brandScorecardItem, document, user, complianceScan, ...rest }) => {
      const affiliateLinks = parseAffiliateLinks(contentSnapshot?.affiliateLinks)?.filter((link) => link.brandId === brand.id);
      const monetized = (affiliateLinks && affiliateLinks?.length > 0) ?? null;
      return {
        ...rest,
        formattedId: `${rest.issueIdentifier}-${rest.issueNumber}`,
        brandName: brand.name,
        contentURL: content.url,
        contentTitle: content.title,
        monetized,
        affiliateName: content.affiliate.name,
        affiliateId: content.affiliate.id,
        scorecardItemTitle: brandScorecardItem?.title ?? null,
        scorecardItemDescription: brandScorecardItem?.description ?? null,
        user: user ?? undefined,
        userName: user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : undefined,
        snapshotCreatedAt: contentSnapshot?.createdAt ?? undefined,
        documentName: document?.name ?? undefined,
        documentType: document?.type ?? undefined,
        scanStartedAt: complianceScan?.createdAt ?? undefined,
      };
    }).sort(
      (a, b) => {
        for (const item of manualSortItems) {
          const id = item.id as keyof typeof a;
          if (a[id] === null || b[id] === null) {
            return 0;
          }
          const aValue = a[id];
          const bValue = b[id];

          if (aValue === bValue) {
            continue;
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return item.desc ? bValue - aValue : aValue - bValue;
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return item.desc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }
        }
        return 0;
      }
    );
    const pageCount = Math.ceil(total / input.perPage);
    return { data: sortedData, pageCount, total };
  } catch (_err) {
    console.error(_err);
    return { data: [], pageCount: 0, total: 0 };
  }
}


export async function getIssueStatusCounts(input: GetIssuesSchema) {
  try {
    const advancedTable =
      input.filterFlag === "advancedFilters" ||
      input.filterFlag === "commandFilters";

    const advancedWhere = filterColumns({
      table: complianceIssues,
      filters: input.filters,
      joinOperator: input.joinOperator,
    });

    const where = advancedTable
      ? advancedWhere
      : and(
        input.issueNumber ? ilike(complianceIssues.issueNumber, `%${input.issueNumber}%`) : undefined,
        input.updatedAt.length > 0
          ? and(
            input.updatedAt[0]
              ? gte(
                complianceIssues.updatedAt,
                (() => {
                  const date = new Date(input.updatedAt[0]);
                  date.setHours(0, 0, 0, 0);
                  return date;
                })(),
              )
              : undefined,
            input.updatedAt[1]
              ? lte(
                complianceIssues.updatedAt,
                (() => {
                  const date = new Date(input.updatedAt[1]);
                  date.setHours(23, 59, 59, 999);
                  return date;
                })(),
              )
              : undefined,
          )
          : undefined,
      );

    const sortableColumns: (keyof ComplianceIssue)[] = ["id", "risk", "issueNumber", "status", "scorecardItemId", "documentId", "contentId", "context", "affiliateId", "brandId", "createdAt", "updatedAt"];

    const dbSortItems = input.sort.filter((item) => sortableColumns.includes(item.id));
    const manualSortItems = input.sort.filter((item) => !sortableColumns.includes(item.id));

    const orderBy =
      input.sort.length > 0
        ?
        dbSortItems.map((item) =>
          item.desc ? desc(complianceIssues[item.id as keyof ComplianceIssue]) : asc(complianceIssues[item.id as keyof ComplianceIssue]),
        )
        : [asc(complianceIssues.updatedAt)];

    return await db
      .select({
        status: complianceIssues.status,
        count: count(),
      })
      .from(complianceIssues)
      .where(where)
      .groupBy(complianceIssues.status)
      .having(gt(count(complianceIssues.status), 0))
      .then((res) =>
        res.reduce(
          (acc, { status, count }) => {
            acc[status] = count;
            return acc;
          }, {
            todo: 0,
            'in_progress': 0,
            'in_review': 0,
            'in_remediation': 0,
            resolved: 0,
            invalid: 0,
            exception: 0,
            backlog: 0,
            archived: 0,
            canceled: 0,
            done: 0,
          } as Record<ComplianceIssue["status"], number>,
        ),
      );
  } catch (_err) {
    console.error(_err);
    return {
      todo: 0,
      'in_progress': 0,
      'in_review': 0,
      'in_remediation': 0,
      resolved: 0,
      invalid: 0,
      exception: 0,
      backlog: 0,
      archived: 0,
      canceled: 0,
      done: 0,
    } as Record<ComplianceIssue["status"], number>;
  }
}


export async function getTaskStatusCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            status: tasks.status,
            count: count(),
          })
          .from(tasks)
          .groupBy(tasks.status)
          .having(gt(count(tasks.status), 0))
          .then((res) =>
            res.reduce(
              (acc, { status, count }) => {
                acc[status] = count;
                return acc;
              },
              {
                todo: 0,
                "in-progress": 0,
                done: 0,
                canceled: 0,
              },
            ),
          );
      } catch (_err) {
        return {
          todo: 0,
          "in-progress": 0,
          done: 0,
          canceled: 0,
        };
      }
    },
    ["task-status-counts"],
    {
      revalidate: 3600,
    },
  )();
}

export async function getTaskPriorityCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            priority: tasks.priority,
            count: count(),
          })
          .from(tasks)
          .groupBy(tasks.priority)
          .having(gt(count(), 0))
          .then((res) =>
            res.reduce(
              (acc, { priority, count }) => {
                acc[priority] = count;
                return acc;
              },
              {
                low: 0,
                medium: 0,
                high: 0,
              },
            ),
          );
      } catch (_err) {
        return {
          low: 0,
          medium: 0,
          high: 0,
        };
      }
    },
    ["task-priority-counts"],
    {
      revalidate: 3600,
    },
  )();
}

export async function getEstimatedHoursRange() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            min: sql<number>`min(${tasks.estimatedHours})`,
            max: sql<number>`max(${tasks.estimatedHours})`,
          })
          .from(tasks)
          .then((res) => res[0] ?? { min: 0, max: 0 });
      } catch (_err) {
        return { min: 0, max: 0 };
      }
    },
    ["estimated-hours-range"],
    {
      revalidate: 3600,
    },
  )();
}
