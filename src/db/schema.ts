
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';

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

export const terms = sqliteTable('terms', {
  id: text('id').notNull().primaryKey(),
  variantId: integer('variant_id')
    .notNull()
    .references(() => variants.id),
  content: text('content').notNull(),
  audioUrl: text('audio_url').notNull(),
  example: text('example'),
  translationExample: text('translation_example'),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),

  stateId: text('state_id')
    .notNull()
    .references(() => states.id),

  municipalityId: text('municipality_id')
    .notNull()
    .references(() => municipalities.id),

  localityId: text('locality_id')
    .notNull()
    .references(() => localities.id),

  meaningId: integer('meaning_id')
    .references(() => meanings.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export const variants = sqliteTable('variants', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
})

export const states = sqliteTable('states', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
})

export const municipalities = sqliteTable('municipalities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  stateId: text('state_id')
    .notNull()
    .references(() => states.id),
})

export const localities = sqliteTable('localities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  municipalityId: text('municipality_id')
    .notNull()
    .references(() => municipalities.id),
})

export const meanings = sqliteTable('meanings', {
  id: text('id').primaryKey(),
  meaning: text('meaning').unique().notNull(),
  imageUrl: text('image_url').notNull(),
  category: text('category').notNull(),
});

// Tabla intermedia (puente)
export const variants_states = sqliteTable(
  'variants_states',
  {
    variantId: integer('variant_id')
      .notNull()
      .references(() => variants.id),
    stateId: integer('state_id')
      .notNull()
      .references(() => states.id),
  },
  (table) => ({
    // Clave primaria compuesta (evita duplicados)
    pk: primaryKey({ columns: [table.variantId, table.stateId] }),
  })
);


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertTermsNahuatl = typeof terms.$inferInsert;
export type SelectTermsNahuatl = typeof terms.$inferSelect;

export type InsertVariant = typeof variants.$inferInsert;
export type SelectVariant = typeof variants.$inferSelect;

export type InsertTerm = typeof meanings.$inferInsert;
export type SelectTerm = typeof meanings.$inferSelect;

