import { pgTable, foreignKey, pgPolicy, bigint, real, timestamp, varchar, text, smallint, integer, index, uuid, boolean, jsonb, unique, serial, json, primaryKey, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { generateId } from "@/lib/id";

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 30 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  code: varchar("code", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 128 }),
  status: varchar("status", {
    length: 30,
    enum: ["todo", "in-progress", "done", "canceled"],
  })
    .notNull()
    .default("todo"),
  label: varchar("label", {
    length: 30,
    enum: ["bug", "feature", "enhancement", "documentation"],
  })
    .notNull()
    .default("bug"),
  priority: varchar("priority", {
    length: 30,
    enum: ["low", "medium", "high"],
  })
    .notNull()
    .default("low"),
  estimatedHours: real("estimated_hours").notNull().default(0),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;


export const alertType = pgEnum("alert_type", ['critical', 'warning', 'info'])
export const applicantStatus = pgEnum("applicant_status", ['applied', 'joined', 'rejected', 'accepted'])
export const complianceIssueType = pgEnum("compliance_issue_type", ['text', 'image', 'link'])
export const contentType = pgEnum("content_type", ['blog', 'video', 'email', 'youtube', 'instagram', 'linkedin', 'tiktok', 'website', 'podcast'])
export const crawlParamField = pgEnum("crawl_param_field", ['excludePaths', 'includePaths'])
export const diffType = pgEnum("diff_type", ['added', 'removed'])
export const documentType = pgEnum("document_type", ['guidelines', 'product-info'])
export const infoType = pgEnum("info_type", ['short', 'long'])
export const issueStatus = pgEnum("issue_status", ['todo', 'in_progress', 'done', 'resolved', 'archived', 'in_review', 'backlog', 'canceled', 'in_remediation', 'exception', 'invalid'])
export const notificationDigest = pgEnum("notification_digest", ['daily', 'weekly', 'monthly'])
export const organizationType = pgEnum("organization_type", ['affiliate', 'brand', 'agency'])
export const priority = pgEnum("priority", ['low', 'medium', 'high', 'urgent', 'none'])
export const riskFormat = pgEnum("risk_format", ['numeric', 'categorical'])
export const ruleScope = pgEnum("rule_scope", ['brand', 'affiliate'])
export const scanInterval = pgEnum("scan_interval", ['daily', 'weekly', 'monthly'])
export const scanStatus = pgEnum("scan_status", ['waiting', 'active', 'complete', 'error', 'review'])
export const scrapeAction = pgEnum("scrape_action", ['wait', 'click', 'write', 'press', 'scroll', 'exclude'])
export const snapshotType = pgEnum("snapshot_type", ['website', 'video', 'audio'])
export const userRole = pgEnum("user_role", ['partner', 'manager', 'admin', 'affiliate'])


export const brandScorecardItems = pgTable("brand_scorecard_items", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "brand_risk_scorecard_items_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	brandId: varchar("brand_id").notNull(),
	type: complianceIssueType().notNull(),
	description: text().notNull(),
	risk: smallint().notNull(),
	title: text().default(' ').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "brand_risk_scorecard_items_brand_id_fkey"
		}),
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`((brand_id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);

export const complianceScans = pgTable("compliance_scans", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "compliance_scans_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	status: scanStatus().default('waiting').notNull(),
	traceUrl: text("trace_url"),
	contentId: integer("content_id").notNull(),
	snapshotId: integer("snapshot_id"),
	brandId: varchar("brand_id").notNull(),
	productIds: integer("product_ids").array(),
	documentIds: integer("document_ids").array(),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "compliance_scans_brand_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "compliance_scans_content_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.snapshotId],
			foreignColumns: [contentSnapshots.id],
			name: "compliance_scans_snapshot_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const contentScrapeActions = pgTable("content_scrape_actions", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "affiliate_scrape_actions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	affiliateId: integer("affiliate_id").notNull(),
	selector: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	value: text(),
	type: scrapeAction().notNull(),
	description: text(),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "affiliate_scrape_actions_affiliate_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const complianceIssues = pgTable("compliance_issues", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	isValid: boolean("is_valid").default(false).notNull(),
	brandId: varchar("brand_id").notNull(),
	contentId: integer("content_id").notNull(),
	issueNumber: integer("issue_number").notNull(),
	issueIdentifier: text("issue_identifier").notNull(),
	type: complianceIssueType().notNull(),
	status: issueStatus().default('todo').notNull(),
	priority: priority(),
	violatingContent: text("violating_content"),
	explanation: text(),
	risk: smallint(),
	traceUrl: text("trace_url"),
	screenshot: text(),
	userFeedback: text("user_feedback"),
	oldSnapshotId: integer("old_snapshot_id"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	context: text(),
	documentId: integer("document_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	snapshotId: integer("snapshot_id"),
	scanId: integer("scan_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	scorecardItemId: bigint("scorecard_item_id", { mode: "number" }),
	toMonitor: boolean("to_monitor"),
	affiliateId: integer("affiliate_id"),
}, (table) => [
	index("compliance_issues_brand_id_idx").using("btree", table.brandId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "compliance_issues_affiliate_id_fkey"
		}),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "compliance_issues_brand_id_fkey"
		}),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "compliance_issues_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "compliance_issues_document_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.oldSnapshotId],
			foreignColumns: [contentToSnapshot.id],
			name: "compliance_issues_old_snapshot_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.scanId],
			foreignColumns: [complianceScans.id],
			name: "compliance_issues_scan_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.scorecardItemId],
			foreignColumns: [brandScorecardItems.id],
			name: "compliance_issues_scorecard_item_id_fkey"
		}),
	foreignKey({
			columns: [table.snapshotId],
			foreignColumns: [contentSnapshots.id],
			name: "compliance_issues_snapshot_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "compliance_issues_user_id_fkey"
		}).onDelete("set null"),
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`((brand_id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);

export type ComplianceIssue = typeof complianceIssues.$inferSelect;

export const brands = pgTable("brands", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	website: varchar({ length: 128 }).notNull(),
	issueIdentifier: text("issue_identifier").notNull(),
	industry: varchar({ length: 64 }),
	logo: varchar({ length: 256 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	about: text(),
	linkDomains: text("link_domains").array(),
}, (table) => [
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`((id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);

export const contentSnapshots = pgTable("content_snapshots", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "content_snapshots_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	contentId: integer("content_id").notNull(),
	dataUrl: text("data_url"),
	type: snapshotType().notNull(),
	disclosures: jsonb().array(),
	affiliateLinks: jsonb("affiliate_links"),
}, (table) => [
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_snapshots_content_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const contentCrawlParams = pgTable("content_crawl_params", {
	affiliateId: integer("affiliate_id").primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	website: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "affiliate_crawl_params_affiliate_id_fkey"
		}).onDelete("cascade"),
	unique("affiliate_crawl_params_affiliate_id_key").on(table.affiliateId),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const contents = pgTable("contents", {
	id: serial().primaryKey().notNull(),
	url: varchar({ length: 256 }).notNull(),
	affiliateId: integer("affiliate_id").notNull(),
	contentType: contentType("content_type").default('website').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	title: text(),
	description: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "contents_affiliate_id_fkey"
		}),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const documents = pgTable("documents", {
	id: serial().primaryKey().notNull(),
	brandId: varchar("brand_id").notNull(),
	html: text().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	markdown: text(),
	name: text().notNull(),
	type: documentType().default('product-info').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "documents_brand_id_brands_id_fk"
		}),
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(((brand_id)::text = 'affil'::text) OR ((brand_id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org)))` }),
]);

export const issueActivityLogs = pgTable("issue_activity_logs", {
	id: serial().primaryKey().notNull(),
	issueId: text("issue_id").notNull(),
	contentId: integer("content_id").notNull(),
	brandId: text("brand_id").notNull(),
	title: text().notNull(),
	details: text().notNull(),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(brand_id IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);

export const productDetails = pgTable("product_details", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	type: infoType().notNull(),
	description: text().notNull(),
	title: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_details_product_id_products_id_fk"
		}),
	pgPolicy("Enable read access for all", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const organizations = pgTable("organizations", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	type: organizationType().notNull(),
	name: text().notNull(),
	affiliateId: integer("affiliate_id"),
	riskFormat: riskFormat("risk_format").default('numeric').notNull(),
	paying: boolean().default(false).notNull(),
	logo: text(),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "organizations_affiliate_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("users can only interact with their organization", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(( SELECT (auth.jwt() ->> 'org_id'::text)) = id)`, withCheck: sql`(( SELECT (auth.jwt() ->> 'org_id'::text)) = id)`  }),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	brandId: varchar("brand_id").notNull(),
	name: text().notNull(),
	link: text(),
	image: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	documentId: integer("document_id"),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "products_brand_id_brands_id_fk"
		}),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "products_document_id_fkey"
		}).onDelete("set null"),
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`((brand_id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);

export type Product = typeof products.$inferSelect;

export const affiliates = pgTable("affiliates", {
	id: serial().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 128 }).notNull(),
	name: varchar({ length: 128 }).notNull(),
	website: varchar({ length: 128 }).notNull(),
	clicks: integer().default(0).notNull(),
	actions: integer().default(0).notNull(),
	fraudRisk: smallint("fraud_risk"),
	type: varchar({ length: 128 }),
	affiliateScore: smallint("affiliate_score"),
	grammarScore: smallint("grammar_score"),
	email: varchar({ length: 128 }),
	phone: varchar({ length: 128 }),
	logo: varchar({ length: 256 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	socialMediaIds: jsonb("social_media_ids"),
}, (table) => [
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const affiliateLinkSnapshots = pgTable("affiliate_link_snapshots", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "affiliate_link_snapshots_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	affiliateId: integer("affiliate_id").notNull(),
	contentId: integer("content_id").notNull(),
	brandId: varchar("brand_id").notNull(),
	productId: integer("product_id"),
	contentSnapshotId: integer("content_snapshot_id").notNull(),
	sourceUrl: text("source_url").notNull(),
	destinationUrl: text("destination_url").notNull(),
	anchors: text().array().notNull(),
	dataUrl: text("data_url"),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "affiliate_link_snapshots_affiliate_id_fkey"
		}),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "affiliate_link_snapshots_brand_id_fkey"
		}),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "affiliate_link_snapshots_content_id_fkey"
		}),
	foreignKey({
			columns: [table.contentSnapshotId],
			foreignColumns: [contentSnapshots.id],
			name: "affiliate_link_snapshots_content_snapshot_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "affiliate_link_snapshots_product_id_fkey"
		}),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const contentToSnapshot = pgTable("content_to_snapshot", {
	id: serial().primaryKey().notNull(),
	contentId: integer("content_id").notNull(),
	markdown: text(),
	html: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	affiliateLinks: json("affiliate_links"),
	screenshot: text(),
	productImages: json("product_images"),
	title: text(),
	description: text(),
	actionsScreenshot: text("actions_screenshot"),
	metadata: text(),
}, (table) => [
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_to_snapshot_content_id_contents_id_fk"
		}).onDelete("cascade"),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const users = pgTable("users", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "users__id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	propelauthId: text("propelauth_id").notNull(),
	email: text().notNull(),
	pictureUrl: text("picture_url"),
	firstName: text("first_name"),
	lastName: text("last_name"),
	starredIssueIds: text("starred_issue_ids").array().default([""]).notNull(),
});

export const comments = pgTable("comments", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "comments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	text: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	issueId: uuid("issue_id").defaultRandom().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.issueId],
			foreignColumns: [complianceIssues.id],
			name: "comments_issue_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_fkey"
		}),
]);

export const complianceSettings = pgTable("compliance_settings", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "compliance_settings_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	organizationId: text("organization_id").notNull(),
	value: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "compliance_settings_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("users can only interact with their organization", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(( SELECT (auth.jwt() ->> 'org_id'::text)) = organization_id)`, withCheck: sql`(( SELECT (auth.jwt() ->> 'org_id'::text)) = organization_id)`  }),
]);

export const organizationToUser = pgTable("organization_to_user", {
	organizationId: text("organization_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "organization_to_user_organization_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "organization_to_user_user_id_fkey"
		}),
	primaryKey({ columns: [table.organizationId, table.userId], name: "organization_to_user_pkey"}),
]);

export const organizationToBrand = pgTable("organization_to_brand", {
	organizationId: text("organization_id").notNull(),
	brandId: varchar("brand_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "organization_to_Brand_brand_id_fkey"
		}),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "organization_to_Brand_organization_id_fkey"
		}),
	primaryKey({ columns: [table.organizationId, table.brandId], name: "organization_to_Brand_pkey"}),
	pgPolicy("users can only interact with their organization", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(( SELECT (auth.jwt() ->> 'org_id'::text)) = organization_id)`, withCheck: sql`(( SELECT (auth.jwt() ->> 'org_id'::text)) = organization_id)`  }),
]);

export const affiliateToDocument = pgTable("affiliate_to_document", {
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	brandId: varchar("brand_id").notNull(),
	documentId: integer("document_id").notNull(),
	scannedAt: timestamp("scanned_at", { withTimezone: true }),
	affiliateId: integer("affiliate_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "affiliate_to_document_affiliate_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "affiliate_to_document_brand_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "affiliate_to_document_document_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.brandId, table.documentId, table.affiliateId], name: "affiliate_to_document_pkey"}),
]);

export const brandToAffiliate = pgTable("brand_to_affiliate", {
	brandId: varchar("brand_id").notNull(),
	affiliateId: integer("affiliate_id").notNull(),
	isPartner: boolean("is_partner").default(false).notNull(),
	compatabilityScore: smallint("compatability_score"),
	riskScore: smallint("risk_score"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "brand_to_affiliate_affiliate_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "brand_to_affiliate_brand_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.brandId, table.affiliateId], name: "brand_to_affiliate_brand_id_affiliate_id_pk"}),
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`((brand_id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);

export const contentToProduct = pgTable("content_to_product", {
	contentId: integer("content_id").notNull(),
	brandId: varchar("brand_id", { length: 256 }).notNull(),
	productId: integer("product_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	affiliateLinks: jsonb("affiliate_links").array(),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "content_to_product_brand_id_brands_id_fk"
		}),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_to_product_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "content_to_product_product_id_products_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.contentId, table.productId], name: "content_to_product_product_id_content_id_pk"}),
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`((brand_id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);

export const contentToBrand = pgTable("content_to_brand", {
	contentId: integer("content_id").notNull(),
	brandId: varchar("brand_id", { length: 256 }).notNull(),
	monetized: boolean(),
	riskScore: numeric("risk_score"), 
	scannedAt: timestamp("scanned_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	latestScanId: integer("latest_scan_id"),
	scrapedAt: timestamp("scraped_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	latestSnapshotId: integer("latest_snapshot_id"),
	affiliateId: integer("affiliate_id"),
}, (table) => [
	foreignKey({
			columns: [table.affiliateId],
			foreignColumns: [affiliates.id],
			name: "content_to_brand_affiliate_id_fkey"
		}),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "content_to_brand_brand_id_brands_id_fk"
		}),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_to_brand_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.latestScanId],
			foreignColumns: [complianceScans.id],
			name: "content_to_brand_latest_scan_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.latestSnapshotId],
			foreignColumns: [contentSnapshots.id],
			name: "content_to_brand_latest_snapshot_id_fkey"
		}),
	primaryKey({ columns: [table.contentId, table.brandId], name: "content_to_brand_brand_id_content_id_pk"}),
	pgPolicy("Policy with security definer functions", { as: "permissive", for: "all", to: ["authenticated"], using: sql`((brand_id)::text IN ( SELECT get_brands_for_org(( SELECT (auth.jwt() ->> 'org_id'::text))) AS get_brands_for_org))` }),
]);
