
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
  variantNameId: integer('variant_name_id')
    .notNull()
    .references(() => variantsNameTable.id),
  meaning: text('meaning').notNull(),
  content: text('content').notNull(),
  audioUrl: text('audio_url').notNull(),
  example: text('example').notNull(),
  translationExample: text('translation_example').notNull(),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),

  stateId: integer('state_id')
    .notNull()
    .references(() => statesTable.id),

  municipalityId: integer('municipality_id')
    .notNull()
    .references(() => municipalitiesTable.id),

  localityId: integer('locality_id')
    .notNull()
    .references(() => localitiesTable.id),

  termId: integer('term_id')
    .references(() => termsTable.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export const variantsNameTable = sqliteTable('variantsName', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
})

export const statesTable = sqliteTable('states', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
})

export const municipalitiesTable = sqliteTable('municipalities', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  stateId: integer('state_id')
    .notNull()
    .references(() => statesTable.id),
})

export const localitiesTable = sqliteTable('localities', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  municipalityId: integer('municipality_id')
    .notNull()
    .references(() => municipalitiesTable.id),
})

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

export const statesRelations = relations(statesTable, ({ many }) => ({
  municipalities: many(municipalitiesTable),
}));

export const municipalitiesRelations = relations(municipalitiesTable, ({ many }) => ({
  municipalities: many(localitiesTable),
}));

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertVariant = typeof variantsTable.$inferInsert;
export type SelectVariant = typeof variantsTable.$inferSelect;

export type InsertTerm = typeof termsTable.$inferInsert;
export type SelectTerm = typeof termsTable.$inferSelect;

