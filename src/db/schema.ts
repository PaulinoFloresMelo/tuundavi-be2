
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

export const usersRelations = relations(usersTable, ({ many }) => ({
  terms: many(termsTable),
}))

export const variantsTable = sqliteTable('variants', {
  id: integer('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  localityName: text('locality_name'),
});

export const variantsRelations = relations(variantsTable, ({ many }) => ({
  terms: many(termsTable),
}))

export const termsTable = sqliteTable('terms', {
  id: integer('id').primaryKey(),
  content: text('content').unique().notNull(),
  meaning: text('meaning').unique().notNull(),
  imageUrl: text('image_url').notNull(),
  audioUrl: text('audio_url').notNull(),
  example: text('example').notNull(),
  category: text('category').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  variantId: integer('variant_id')
    .notNull()
    .references(() => variantsTable.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export const termsRelations = relations(termsTable, ({ one }) => ({
  // term: one(usersTable, {
  //   fields: [termsTable.userId],
  //   references: [usersTable.id],
  // }),
  user: one(usersTable, {
    fields: [termsTable.userId],
    references: [usersTable.id],
  }),
  variant: one(variantsTable, {
    fields: [termsTable.variantId],
    references: [variantsTable.id],
  }),
}))

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertVariant = typeof variantsTable.$inferInsert;
export type SelectVariant = typeof variantsTable.$inferSelect;

export type InsertTerm = typeof termsTable.$inferInsert;
export type SelectTerm = typeof termsTable.$inferSelect;

