import { ComplianceIssue, Product, type Task, tasks } from "@/db/schema";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import * as z from "zod";

import { flagConfig } from "@/config/flag";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Task>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(tasks.status.enumValues)).withDefault([]),
  priority: parseAsArrayOf(z.enum(tasks.priority.enumValues)).withDefault([]),
  estimatedHours: parseAsArrayOf(z.coerce.number()).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  updatedAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createTaskSchema = z.object({
  title: z.string(),
  label: z.enum(tasks.label.enumValues),
  status: z.enum(tasks.status.enumValues),
  priority: z.enum(tasks.priority.enumValues),
  estimatedHours: z.coerce.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  label: z.enum(tasks.label.enumValues).optional(),
  status: z.enum(tasks.status.enumValues).optional(),
  priority: z.enum(tasks.priority.enumValues).optional(),
  estimatedHours: z.coerce.number().optional(),
});

export type GetTasksSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const productsSearchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Product & { brandName: string }>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  updatedAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});


export type GetProductsSchema = Awaited<
  ReturnType<typeof productsSearchParamsCache.parse>
>;

export const issuesSearchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
    flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<ComplianceIssue & { brandName: string }>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  issueNumber: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(tasks.status.enumValues)).withDefault([]),
  priority: parseAsArrayOf(z.enum(tasks.priority.enumValues)).withDefault([]),
  estimatedHours: parseAsArrayOf(z.coerce.number()).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  updatedAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type GetIssuesSchema = Awaited<
  ReturnType<typeof issuesSearchParamsCache.parse>
>;

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;


export const affiliateLinkSchema = z.object({
  original: z.string(),
  final: z.string(),
  text: z.array(z.string()).optional(),
  brandId: z.string().optional(),
});

export type AffiliateLink = z.infer<typeof affiliateLinkSchema>;


export const parseAffiliateLinks = (affiliateLinks: any): AffiliateLink[] | null => {
  if (!affiliateLinks || !Array.isArray(affiliateLinks)) {
    return null;
  }
  const parsedAffiliateLinks: AffiliateLink[] = [];
  for (const affiliateLink of affiliateLinks) {
    const parsed = affiliateLinkSchema.safeParse(affiliateLink);
    if (parsed.success) {
      parsedAffiliateLinks.push(parsed.data);
    }
  }
  return parsedAffiliateLinks;
};