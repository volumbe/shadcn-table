import { relations } from "drizzle-orm/relations";
import { brands, brandScorecardItems, complianceScans, contents, contentSnapshots, affiliates, contentScrapeActions, complianceIssues, documents, contentToSnapshot, users, contentCrawlParams, products, productDetails, organizations, affiliateLinkSnapshots, comments, complianceSettings, organizationToUser, organizationToBrand, affiliateToDocument, brandToAffiliate, contentToProduct, contentToBrand } from "./schema";

export const brandScorecardItemsRelations = relations(brandScorecardItems, ({one, many}) => ({
	brand: one(brands, {
		fields: [brandScorecardItems.brandId],
		references: [brands.id]
	}),
	complianceIssues: many(complianceIssues),
}));

export const brandsRelations = relations(brands, ({many}) => ({
	brandScorecardItems: many(brandScorecardItems),
	complianceScans: many(complianceScans),
	complianceIssues: many(complianceIssues),
	documents: many(documents),
	products: many(products),
	affiliateLinkSnapshots: many(affiliateLinkSnapshots),
	organizationToBrands: many(organizationToBrand),
	affiliateToDocuments: many(affiliateToDocument),
	brandToAffiliates: many(brandToAffiliate),
	contentToProducts: many(contentToProduct),
	contentToBrands: many(contentToBrand),
}));

export const complianceScansRelations = relations(complianceScans, ({one, many}) => ({
	brand: one(brands, {
		fields: [complianceScans.brandId],
		references: [brands.id]
	}),
	content: one(contents, {
		fields: [complianceScans.contentId],
		references: [contents.id]
	}),
	contentSnapshot: one(contentSnapshots, {
		fields: [complianceScans.snapshotId],
		references: [contentSnapshots.id]
	}),
	complianceIssues: many(complianceIssues),
	contentToBrands: many(contentToBrand),
}));

export const contentsRelations = relations(contents, ({one, many}) => ({
	complianceScans: many(complianceScans),
	complianceIssues: many(complianceIssues),
	contentSnapshots: many(contentSnapshots),
	affiliate: one(affiliates, {
		fields: [contents.affiliateId],
		references: [affiliates.id]
	}),
	affiliateLinkSnapshots: many(affiliateLinkSnapshots),
	contentToSnapshots: many(contentToSnapshot),
	contentToProducts: many(contentToProduct),
	contentToBrands: many(contentToBrand),
}));

export const contentSnapshotsRelations = relations(contentSnapshots, ({one, many}) => ({
	complianceScans: many(complianceScans),
	complianceIssues: many(complianceIssues),
	content: one(contents, {
		fields: [contentSnapshots.contentId],
		references: [contents.id]
	}),
	affiliateLinkSnapshots: many(affiliateLinkSnapshots),
	contentToBrands: many(contentToBrand),
}));

export const contentScrapeActionsRelations = relations(contentScrapeActions, ({one}) => ({
	affiliate: one(affiliates, {
		fields: [contentScrapeActions.affiliateId],
		references: [affiliates.id]
	}),
}));

export const affiliatesRelations = relations(affiliates, ({many}) => ({
	contentScrapeActions: many(contentScrapeActions),
	complianceIssues: many(complianceIssues),
	contentCrawlParams: many(contentCrawlParams),
	contents: many(contents),
	organizations: many(organizations),
	affiliateLinkSnapshots: many(affiliateLinkSnapshots),
	affiliateToDocuments: many(affiliateToDocument),
	brandToAffiliates: many(brandToAffiliate),
	contentToBrands: many(contentToBrand),
}));

export const complianceIssuesRelations = relations(complianceIssues, ({one, many}) => ({
	affiliate: one(affiliates, {
		fields: [complianceIssues.affiliateId],
		references: [affiliates.id]
	}),
	brand: one(brands, {
		fields: [complianceIssues.brandId],
		references: [brands.id]
	}),
	content: one(contents, {
		fields: [complianceIssues.contentId],
		references: [contents.id]
	}),
	document: one(documents, {
		fields: [complianceIssues.documentId],
		references: [documents.id]
	}),
	contentToSnapshot: one(contentToSnapshot, {
		fields: [complianceIssues.oldSnapshotId],
		references: [contentToSnapshot.id]
	}),
	complianceScan: one(complianceScans, {
		fields: [complianceIssues.scanId],
		references: [complianceScans.id]
	}),
	brandScorecardItem: one(brandScorecardItems, {
		fields: [complianceIssues.scorecardItemId],
		references: [brandScorecardItems.id]
	}),
	contentSnapshot: one(contentSnapshots, {
		fields: [complianceIssues.snapshotId],
		references: [contentSnapshots.id]
	}),
	user: one(users, {
		fields: [complianceIssues.userId],
		references: [users.id]
	}),
	comments: many(comments),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	complianceIssues: many(complianceIssues),
	brand: one(brands, {
		fields: [documents.brandId],
		references: [brands.id]
	}),
	products: many(products),
	affiliateToDocuments: many(affiliateToDocument),
}));

export const contentToSnapshotRelations = relations(contentToSnapshot, ({one, many}) => ({
	complianceIssues: many(complianceIssues),
	content: one(contents, {
		fields: [contentToSnapshot.contentId],
		references: [contents.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	complianceIssues: many(complianceIssues),
	comments: many(comments),
	organizationToUsers: many(organizationToUser),
}));

export const contentCrawlParamsRelations = relations(contentCrawlParams, ({one}) => ({
	affiliate: one(affiliates, {
		fields: [contentCrawlParams.affiliateId],
		references: [affiliates.id]
	}),
}));

export const productDetailsRelations = relations(productDetails, ({one}) => ({
	product: one(products, {
		fields: [productDetails.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productDetails: many(productDetails),
	brand: one(brands, {
		fields: [products.brandId],
		references: [brands.id]
	}),
	document: one(documents, {
		fields: [products.documentId],
		references: [documents.id]
	}),
	affiliateLinkSnapshots: many(affiliateLinkSnapshots),
	contentToProducts: many(contentToProduct),
}));

export const organizationsRelations = relations(organizations, ({one, many}) => ({
	affiliate: one(affiliates, {
		fields: [organizations.affiliateId],
		references: [affiliates.id]
	}),
	complianceSettings: many(complianceSettings),
	organizationToUsers: many(organizationToUser),
	organizationToBrands: many(organizationToBrand),
}));

export const affiliateLinkSnapshotsRelations = relations(affiliateLinkSnapshots, ({one}) => ({
	affiliate: one(affiliates, {
		fields: [affiliateLinkSnapshots.affiliateId],
		references: [affiliates.id]
	}),
	brand: one(brands, {
		fields: [affiliateLinkSnapshots.brandId],
		references: [brands.id]
	}),
	content: one(contents, {
		fields: [affiliateLinkSnapshots.contentId],
		references: [contents.id]
	}),
	contentSnapshot: one(contentSnapshots, {
		fields: [affiliateLinkSnapshots.contentSnapshotId],
		references: [contentSnapshots.id]
	}),
	product: one(products, {
		fields: [affiliateLinkSnapshots.productId],
		references: [products.id]
	}),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	complianceIssue: one(complianceIssues, {
		fields: [comments.issueId],
		references: [complianceIssues.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const complianceSettingsRelations = relations(complianceSettings, ({one}) => ({
	organization: one(organizations, {
		fields: [complianceSettings.organizationId],
		references: [organizations.id]
	}),
}));

export const organizationToUserRelations = relations(organizationToUser, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationToUser.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [organizationToUser.userId],
		references: [users.id]
	}),
}));

export const organizationToBrandRelations = relations(organizationToBrand, ({one}) => ({
	brand: one(brands, {
		fields: [organizationToBrand.brandId],
		references: [brands.id]
	}),
	organization: one(organizations, {
		fields: [organizationToBrand.organizationId],
		references: [organizations.id]
	}),
}));

export const affiliateToDocumentRelations = relations(affiliateToDocument, ({one}) => ({
	affiliate: one(affiliates, {
		fields: [affiliateToDocument.affiliateId],
		references: [affiliates.id]
	}),
	brand: one(brands, {
		fields: [affiliateToDocument.brandId],
		references: [brands.id]
	}),
	document: one(documents, {
		fields: [affiliateToDocument.documentId],
		references: [documents.id]
	}),
}));

export const brandToAffiliateRelations = relations(brandToAffiliate, ({one}) => ({
	affiliate: one(affiliates, {
		fields: [brandToAffiliate.affiliateId],
		references: [affiliates.id]
	}),
	brand: one(brands, {
		fields: [brandToAffiliate.brandId],
		references: [brands.id]
	}),
}));

export const contentToProductRelations = relations(contentToProduct, ({one}) => ({
	brand: one(brands, {
		fields: [contentToProduct.brandId],
		references: [brands.id]
	}),
	content: one(contents, {
		fields: [contentToProduct.contentId],
		references: [contents.id]
	}),
	product: one(products, {
		fields: [contentToProduct.productId],
		references: [products.id]
	}),
}));

export const contentToBrandRelations = relations(contentToBrand, ({one}) => ({
	affiliate: one(affiliates, {
		fields: [contentToBrand.affiliateId],
		references: [affiliates.id]
	}),
	brand: one(brands, {
		fields: [contentToBrand.brandId],
		references: [brands.id]
	}),
	content: one(contents, {
		fields: [contentToBrand.contentId],
		references: [contents.id]
	}),
	complianceScan: one(complianceScans, {
		fields: [contentToBrand.latestScanId],
		references: [complianceScans.id]
	}),
	contentSnapshot: one(contentSnapshots, {
		fields: [contentToBrand.latestSnapshotId],
		references: [contentSnapshots.id]
	}),
}));