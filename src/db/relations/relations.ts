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

// const meaningsRelations = defineRelations(
//   { meanings, terms }, 
//   (r) => ({
//     terms: {
//       meaning: r.one.meanings({
//         from: r.terms.meaningId,
//         to: r.meanings.id
//       })
//     },
//     meanings: {
//       terms: r.many.terms()
//     }
//   })
// );

const meaningsRelations = defineRelations(
  { meanings, terms, localities }, // <-- Agregamos localities aquí
  (r) => ({
    terms: {
      meaning: r.one.meanings({
        from: r.terms.meaningId,
        to: r.meanings.id
      }),
      // 👇 NUEVA RELACIÓN: de terms hacia localities
      locality: r.one.localities({
        from: r.terms.localityId,   // campo en terms
        to: r.localities.id         // campo en localities
      })
    },
    meanings: {
      terms: r.many.terms()
    },
    // 👇 Relación inversa (opcional, pero recomendada)
    localities: {
      terms: r.many.terms() // si quieres consultar localidad -> términos
    }
  })
);

export const relations = {
  ...variantsRelations,
  ...statesRelations,
  ...municipalitiesRelations,
  ...meaningsRelations
};