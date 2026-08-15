
import { sql, defineRelations } from 'drizzle-orm';
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
  id: integer('id').primaryKey(),
  variantId: integer('variant_id')
    .notNull()
    .references(() => variants.id),
  content: text('content').notNull(),
  meaning: text('meaning').notNull(),
  audioUrl: text('audio_url').notNull(),
  example: text('example').notNull(),
  translationExample: text('translation_example').notNull(),
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
  id: integer('id').primaryKey(),
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

export const variantsRelations = defineRelations({ variants, states, variants_states, terms },
  (r) => ({
    variants: {
      states: r.many.states({
        from: r.variants.id.through(r.variants_states.variantId),
        to: r.states.id.through(r.variants_states.stateId),
      }),
      terms: r.many.terms()
    },
    states: {
      states: r.many.variants(),
    },
    terms: {
      variants: r.one.variants({
        from: r.terms.variantId,
        to: r.variants.id
      })
    },
  })
);

// export const termsRelations = relations(meaningsTable, ({ many }) => ({
//   variants: many(termsNahuatlTable),
// }));

export const statesRelations = defineRelations({ states, municipalities }, (r) => ({
  municipalities: {
    state: r.one.states({
      from: r.municipalities.stateId,
      to: r.states.id
    })
  },
  states: {
    municipalities: r.many.municipalities(),
  }
}));

export const municipalitiesRelations = defineRelations({ municipalities, localities }, (r) => ({
  localities: {
    municipality: r.one.municipalities({
      from: r.localities.municipalityId,
      to: r.municipalities.id
    })
  },
  municipalities: {
    localities: r.many.localities()
  }
}));

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertTermsNahuatl = typeof terms.$inferInsert;
export type SelectTermsNahuatl = typeof terms.$inferSelect;

export type InsertVariant = typeof variants.$inferInsert;
export type SelectVariant = typeof variants.$inferSelect;

export type InsertTerm = typeof meanings.$inferInsert;
export type SelectTerm = typeof meanings.$inferSelect;

