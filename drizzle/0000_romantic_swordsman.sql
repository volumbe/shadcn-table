-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."alert_type" AS ENUM('critical', 'warning', 'info');--> statement-breakpoint
CREATE TYPE "public"."applicant_status" AS ENUM('applied', 'joined', 'rejected', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."compliance_issue_type" AS ENUM('text', 'image', 'link');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('blog', 'video', 'email', 'youtube', 'instagram', 'linkedin', 'tiktok', 'website', 'podcast');--> statement-breakpoint
CREATE TYPE "public"."crawl_param_field" AS ENUM('excludePaths', 'includePaths');--> statement-breakpoint
CREATE TYPE "public"."diff_type" AS ENUM('added', 'removed');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('guidelines', 'product-info');--> statement-breakpoint
CREATE TYPE "public"."info_type" AS ENUM('short', 'long');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('todo', 'in_progress', 'done', 'resolved', 'archived', 'in_review', 'backlog', 'canceled', 'in_remediation', 'exception', 'invalid');--> statement-breakpoint
CREATE TYPE "public"."notification_digest" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('affiliate', 'brand', 'agency');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'urgent', 'none');--> statement-breakpoint
CREATE TYPE "public"."risk_format" AS ENUM('numeric', 'categorical');--> statement-breakpoint
CREATE TYPE "public"."rule_scope" AS ENUM('brand', 'affiliate');--> statement-breakpoint
CREATE TYPE "public"."scan_interval" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('waiting', 'active', 'complete', 'error', 'review');--> statement-breakpoint
CREATE TYPE "public"."scrape_action" AS ENUM('wait', 'click', 'write', 'press', 'scroll', 'exclude');--> statement-breakpoint
CREATE TYPE "public"."snapshot_type" AS ENUM('website', 'video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('partner', 'manager', 'admin', 'affiliate');--> statement-breakpoint
CREATE SEQUENCE "public"."affiliate_scrape_actions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."affiliates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."content_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."content_to_snapshot_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."contents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."issue_activity_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."product_details_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."users__id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."compliance_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."compliance_scans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."brand_risk_scorecard_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."affiliate_link_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;
*/