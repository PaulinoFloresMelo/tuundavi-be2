CREATE TABLE `localities` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`municipality_id` integer NOT NULL,
	CONSTRAINT `fk_localities_municipality_id_municipalities_id_fk` FOREIGN KEY (`municipality_id`) REFERENCES `municipalities`(`id`)
);
--> statement-breakpoint
CREATE TABLE `meanings` (
	`id` integer PRIMARY KEY,
	`meaning` text NOT NULL UNIQUE,
	`image_url` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `municipalities` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`state_id` integer NOT NULL,
	CONSTRAINT `fk_municipalities_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`)
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`id` integer PRIMARY KEY,
	`variant_id` integer NOT NULL,
	`content` text NOT NULL,
	`meaning` text NOT NULL,
	`audio_url` text NOT NULL,
	`example` text NOT NULL,
	`translation_example` text NOT NULL,
	`email` text,
	`is_active` integer DEFAULT false NOT NULL,
	`state_id` integer NOT NULL,
	`municipality_id` integer NOT NULL,
	`locality_id` integer NOT NULL,
	`meaning_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	CONSTRAINT `fk_terms_variant_id_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`),
	CONSTRAINT `fk_terms_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`),
	CONSTRAINT `fk_terms_municipality_id_municipalities_id_fk` FOREIGN KEY (`municipality_id`) REFERENCES `municipalities`(`id`),
	CONSTRAINT `fk_terms_locality_id_localities_id_fk` FOREIGN KEY (`locality_id`) REFERENCES `localities`(`id`),
	CONSTRAINT `fk_terms_meaning_id_meanings_id_fk` FOREIGN KEY (`meaning_id`) REFERENCES `meanings`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY,
	`first_name` text,
	`maternal_name` text,
	`paternal_name` text,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variants_states` (
	`variant_id` integer NOT NULL,
	`state_id` integer NOT NULL,
	CONSTRAINT `variants_states_pk` PRIMARY KEY(`variant_id`, `state_id`),
	CONSTRAINT `fk_variants_states_variant_id_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`),
	CONSTRAINT `fk_variants_states_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`)
);
