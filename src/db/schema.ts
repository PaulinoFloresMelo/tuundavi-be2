
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';


export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name'),
  maternalName: text('maternal_name'),
  paternalName: text('paternal_name'),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
});

export const variantsTable = sqliteTable('variants', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  meaning: text('meaning').notNull(),
  content: text('content').notNull(),
  audioUrl: text('audio_url').notNull(),
  example: text('example').notNull(),
  translationExample: text('translation_example').notNull(),
  state:text('state').notNull(),
  municipality: text('municipality').notNull(),
  locality: text('locality').notNull(),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  termId: integer('term_id')
    .notNull()
    .references(() => termsTable.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export const variantsRelations = relations(variantsTable, ({ one }) => ({
  term: one(termsTable, {
    fields: [variantsTable.termId],
    references: [termsTable.id],
  }),
}));

export const termsTable = sqliteTable('terms', {
  id: integer('id').primaryKey(),
  meaning: text('meaning').unique().notNull(),
  imageUrl: text('image_url').notNull(),
  category: text('category').notNull(),
});

export const termsRelations = relations(termsTable, ({ many }) => ({
  variants: many(variantsTable),
}));

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertVariant = typeof variantsTable.$inferInsert;
export type SelectVariant = typeof variantsTable.$inferSelect;

export type InsertTerm = typeof termsTable.$inferInsert;
export type SelectTerm = typeof termsTable.$inferSelect;

