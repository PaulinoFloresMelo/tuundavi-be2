PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_terms` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` integer NOT NULL,
	`content` text NOT NULL,
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
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`municipality_id`) REFERENCES `municipalities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`locality_id`) REFERENCES `localities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`meaning_id`) REFERENCES `meanings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_terms`("id", "variant_id", "content", "audio_url", "example", "translation_example", "email", "is_active", "state_id", "municipality_id", "locality_id", "meaning_id", "created_at", "updated_at") SELECT "id", "variant_id", "content", "audio_url", "example", "translation_example", "email", "is_active", "state_id", "municipality_id", "locality_id", "meaning_id", "created_at", "updated_at" FROM `terms`;--> statement-breakpoint
DROP TABLE `terms`;--> statement-breakpoint
ALTER TABLE `__new_terms` RENAME TO `terms`;--> statement-breakpoint
PRAGMA foreign_keys=ON;