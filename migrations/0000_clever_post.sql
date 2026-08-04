CREATE TABLE `localities` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`municipality_id` integer NOT NULL,
	FOREIGN KEY (`municipality_id`) REFERENCES `municipalities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `municipalities` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`state_id` integer NOT NULL,
	FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`id` integer PRIMARY KEY NOT NULL,
	`meaning` text NOT NULL,
	`image_url` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `terms_meaning_unique` ON `terms` (`meaning`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text,
	`maternal_name` text,
	`paternal_name` text,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `variantsName` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` integer PRIMARY KEY NOT NULL,
	`variant_name_id` text NOT NULL,
	`meaning` text NOT NULL,
	`content` text NOT NULL,
	`audio_url` text NOT NULL,
	`example` text NOT NULL,
	`translation_example` text NOT NULL,
	`email` text,
	`is_active` integer DEFAULT false NOT NULL,
	`state_id` integer NOT NULL,
	`municipality_id` integer NOT NULL,
	`locality_id` integer NOT NULL,
	`term_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`variant_name_id`) REFERENCES `variantsName`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`municipality_id`) REFERENCES `municipalities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`locality_id`) REFERENCES `localities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON UPDATE no action ON DELETE cascade
);
