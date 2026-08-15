PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_localities` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`municipality_id` integer NOT NULL,
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
	`state_id` integer NOT NULL,
	CONSTRAINT `fk_municipalities_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_municipalities`(`id`, `name`, `state_id`) SELECT `id`, `name`, `state_id` FROM `municipalities`;--> statement-breakpoint
DROP TABLE `municipalities`;--> statement-breakpoint
ALTER TABLE `__new_municipalities` RENAME TO `municipalities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_states` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_states`(`id`, `name`) SELECT `id`, `name` FROM `states`;--> statement-breakpoint
DROP TABLE `states`;--> statement-breakpoint
ALTER TABLE `__new_states` RENAME TO `states`;--> statement-breakpoint
PRAGMA foreign_keys=ON;