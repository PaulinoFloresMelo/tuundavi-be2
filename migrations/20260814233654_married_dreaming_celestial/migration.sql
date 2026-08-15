PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_localities` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`municipality_id` text NOT NULL,
	CONSTRAINT `fk_localities_municipality_id_municipalities_id_fk` FOREIGN KEY (`municipality_id`) REFERENCES `municipalities`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_localities`(`id`, `name`, `municipality_id`) SELECT `id`, `name`, `municipality_id` FROM `localities`;--> statement-breakpoint
DROP TABLE `localities`;--> statement-breakpoint
ALTER TABLE `__new_localities` RENAME TO `localities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_municipalities` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`state_id` text NOT NULL,
	CONSTRAINT `fk_municipalities_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_municipalities`(`id`, `name`, `state_id`) SELECT `id`, `name`, `state_id` FROM `municipalities`;--> statement-breakpoint
DROP TABLE `municipalities`;--> statement-breakpoint
ALTER TABLE `__new_municipalities` RENAME TO `municipalities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_terms` (
	`id` integer PRIMARY KEY,
	`variant_id` integer NOT NULL,
	`content` text NOT NULL,
	`meaning` text NOT NULL,
	`audio_url` text NOT NULL,
	`example` text NOT NULL,
	`translation_example` text NOT NULL,
	`email` text,
	`is_active` integer DEFAULT false NOT NULL,
	`state_id` text NOT NULL,
	`municipality_id` text NOT NULL,
	`locality_id` text NOT NULL,
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
INSERT INTO `__new_terms`(`id`, `variant_id`, `content`, `meaning`, `audio_url`, `example`, `translation_example`, `email`, `is_active`, `state_id`, `municipality_id`, `locality_id`, `meaning_id`, `created_at`, `updated_at`) SELECT `id`, `variant_id`, `content`, `meaning`, `audio_url`, `example`, `translation_example`, `email`, `is_active`, `state_id`, `municipality_id`, `locality_id`, `meaning_id`, `created_at`, `updated_at` FROM `terms`;--> statement-breakpoint
DROP TABLE `terms`;--> statement-breakpoint
ALTER TABLE `__new_terms` RENAME TO `terms`;--> statement-breakpoint
PRAGMA foreign_keys=ON;