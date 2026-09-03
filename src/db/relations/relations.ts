import { defineRelations } from 'drizzle-orm';
import { 
  variants, 
  states, 
  variants_states, 
  terms,
  municipalities,
  localities,
  meanings
 } from '../schema';

const variantsRelations = defineRelations(
  { variants, states, variants_states, terms },
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

const statesRelations = defineRelations(
  { states, municipalities }, 
  (r) => ({

    municipalities: {
      state: r.one.states({
        from: r.municipalities.stateId,
        to: r.states.id
      })
    },
    states: {
      municipalities: r.many.municipalities(),
    }}
  )
);


const municipalitiesRelations = defineRelations(
  { municipalities, localities }, 
  (r) => ({
    localities: {
      municipality: r.one.municipalities({
        from: r.localities.municipalityId,
        to: r.municipalities.id
      })
    },
    municipalities: {
      localities: r.many.localities()
    }
  })
);

const meaningsRelations = defineRelations(
  { meanings, terms }, 
  (r) => ({
    terms: {
      meaning: r.one.meanings({
        from: r.terms.meaningId,
        to: r.meanings.id
      })
    },
    meanings: {
      terms: r.many.terms()
    }
  })
);

export const relations = {
  ...variantsRelations,
  ...statesRelations,
  ...municipalitiesRelations,
  ...meaningsRelations
};