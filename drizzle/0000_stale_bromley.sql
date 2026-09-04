CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bank_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`bank_name` text NOT NULL,
	`branch` text,
	`account_name` text NOT NULL,
	`account_number` text NOT NULL,
	`iban` text,
	`swift` text,
	`currency` text NOT NULL,
	`bank_address` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`address` text,
	`phone` text,
	`email` text,
	`website` text,
	`tax_number` text,
	`commercial_registration` text,
	`default_currency` text DEFAULT 'USD' NOT NULL,
	`default_port` text,
	`default_incoterm` text,
	`default_payment_terms` text,
	`default_down_payment` real DEFAULT 25 NOT NULL,
	`marble_enabled` integer DEFAULT true NOT NULL,
	`marble_opacity` real DEFAULT 5 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`contact_person` text,
	`email` text,
	`phone` text,
	`billing_address` text,
	`shipping_address` text,
	`city` text,
	`country` text NOT NULL,
	`postal_code` text,
	`vat_number` text,
	`default_port` text,
	`default_payment_terms` text,
	`default_currency` text DEFAULT 'USD' NOT NULL,
	`notes` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text,
	`shipment_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`storage_key` text,
	`size` integer,
	`uploaded_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`product_id` text,
	`description` text NOT NULL,
	`finish` text,
	`size` text,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`unit_price_minor` integer NOT NULL,
	`hs_code` text,
	`crates` integer,
	`weight_kg` real,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoice_sequences` (
	`id` text PRIMARY KEY NOT NULL,
	`prefix` text NOT NULL,
	`year_prefix` text NOT NULL,
	`current_number` integer NOT NULL,
	`reset_annually` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`type` text DEFAULT 'PROFORMA' NOT NULL,
	`invoice_date` text NOT NULL,
	`customer_id` text NOT NULL,
	`currency` text NOT NULL,
	`port_loading` text,
	`port_discharge` text,
	`origin_country` text,
	`destination_country` text,
	`container_quantity` integer DEFAULT 0 NOT NULL,
	`container_type` text,
	`gross_weight_kg` real,
	`net_weight_kg` real,
	`crates` integer,
	`shipping_method` text,
	`incoterm` text,
	`freight_per_container_minor` integer DEFAULT 0 NOT NULL,
	`other_charges_minor` integer DEFAULT 0 NOT NULL,
	`discount_minor` integer DEFAULT 0 NOT NULL,
	`tax_rate` real DEFAULT 0 NOT NULL,
	`down_payment_percent` real DEFAULT 25 NOT NULL,
	`payment_terms` text,
	`notes` text,
	`validity_days` integer DEFAULT 30 NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`bank_account_id` text,
	`paid_minor` integer DEFAULT 0 NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (`number`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`payment_date` text NOT NULL,
	`method` text NOT NULL,
	`bank_account_id` text,
	`reference` text,
	`notes` text,
	`type` text DEFAULT 'PARTIAL' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`finish` text NOT NULL,
	`size` text NOT NULL,
	`unit` text NOT NULL,
	`default_price_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`weight_kg` real,
	`crate_info` text,
	`available` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`stone_type` text NOT NULL,
	`material` text,
	`origin` text DEFAULT 'Egypt' NOT NULL,
	`description` text,
	`hs_code` text,
	`default_unit` text DEFAULT 'm²' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`invoice_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`shipping_line` text,
	`booking_number` text,
	`container_numbers` text,
	`seal_numbers` text,
	`port_loading` text,
	`port_discharge` text,
	`etd` text,
	`eta` text,
	`vessel` text,
	`voyage` text,
	`bill_of_lading` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipments_number_unique` ON `shipments` (`number`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'VIEWER' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);