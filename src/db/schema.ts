
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';


export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name'),
  maternalName: text('maternal_name'),
  paternalName: text('paternal_name'),
  email: text('email').unique().notNull(),
  password: text('password').notNull()
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  terms: many(termsTable),
}))

export const termsTable = sqliteTable('terms', {
  id: integer('id').primaryKey(),
  content: text('content').unique().notNull(),
  imageUrl: text('image_url').notNull(),
  audioUrl: text('audio_url').notNull(),
  example: text('example').notNull(),
  category: text('category').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export const termsRelations = relations(termsTable, ({ one }) => ({
  term: one(usersTable, {
    fields: [termsTable.userId],
    references: [usersTable.id],
  }),
}))


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertTerm = typeof termsTable.$inferInsert;
export type SelectTerm = typeof termsTable.$inferSelect;

