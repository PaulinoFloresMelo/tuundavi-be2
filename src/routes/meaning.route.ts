import { z } from "zod";
import { validator } from 'hono/validator';
import { eq, like, or, sql } from 'drizzle-orm';
import { factory } from '../factory'
import { zValidator } from '@hono/zod-validator';
import { meanings} from "../db/schema";
import { terms } from "../db/schema";

// export const termRouter = factory.createApp()
export const meaningRouter = factory.createApp()

const queryValidation = validator('query', (value, c) => {
  const offset = Number(value?.offset) || 0;
  const limit = Number(value?.limit) || 99;
  const category = String(value?.category ?? '');
  const letter = String(value?.letter ?? '');

  if (isNaN(offset) || offset < 0) return c.json({ error: 'Offset inválido' }, 400);
  if (isNaN(limit) || limit > 100) return c.json({ error: 'Límite excede el máximo' }, 400);
  if (category === "undefined" ) return c.json({ error: 'Categoría inválida' }, 400);
  if (letter === "undefined" ) return c.json({ error: 'Letra inválida' }, 400);

  return { offset, limit, category, letter };
});

const registerTermSchema = z.object({
    meaning: z.string().trim().min(1).toLowerCase(),
    imageUrl: z.string().trim().min(1).toLowerCase(),
    category: z.string().trim().min(1).toLowerCase(),
    meaningId: z.number().min(1)
})

const updateTermSchema = z.object({
    meaning: z.string().trim().min(1).toLowerCase().optional(),
    imageUrl: z.string().trim().min(1).toLowerCase().optional(),
    category: z.string().trim().min(1).toLowerCase().optional(),
    meaningId: z.number().min(1).optional()
});

export const searchTermSchema = z.object({
  q: z.string().min(1, 'El término de búsqueda es requerido'),
});


// /api/v1/terms
meaningRouter.get(
  "/",
  queryValidation,
  async (c) => {
    const { offset, limit, category, letter } = c.req.valid('query');
    const db = c.get('db');

    // ---------- CONSTRUIR FILTROS DINÁMICOS ----------
    const filters: any[] = [];

    if (category && category.length > 0) {
      filters.push(eq(meanings.category, category));
    }

    if (letter && letter.length === 1) {
      filters.push(
        sql`LOWER(${meanings.meaning}) LIKE LOWER(${letter + '%'})`
      );
    }

    // ---------- CONSULTA PRINCIPAL (solo términos) ----------
    let query = db
      .select({
        id: meanings.id,
        category: meanings.category,
        meaning: meanings.meaning,
        imageUrl: meanings.imageUrl,
      })
      .from(meanings)
      .limit(limit)
      .offset(offset)
      .$dynamic();

    if (filters.length > 0) {
      query = query.where(sql`${sql.join(filters, sql` AND `)}`);
    }

    const terms = await query;

    // ---------- CONTEO TOTAL (con los mismos filtros) ----------
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(meanings)
      .$dynamic();

    if (filters.length > 0) {
      countQuery = countQuery.where(sql`${sql.join(filters, sql` AND `)}`);
    }

    const totalResult = await countQuery;
    const total = Number(totalResult[0]?.count ?? 0);

    // ---------- RESPUESTA ----------
    return c.json({
      count: total,
      pages: Math.ceil(total / limit),
      terms: terms,
      category: category || null,
      letter: letter || null,
    });
  }
);

// GET /api/v1/terms/searchWithVariants?q=mi-contenido
// meaningRouter.get('/searchWithVariants',
//     async (c) => {
//       // const q = c.req.param('q')
//       const q = c.req.query('q');

//       const db = c.get('db');

//       if (!q) {
//           return c.json({ success: false, message: 'El parámetro "q" es requerido' }, 400);
//       }

//       try {
//           // Buscar el primer resultado que coincida (parcial o exacto)
//           const data = await db
//           .select()
//           .from(meanings)
//           .where(
//               or(
//                   like(sql`LOWER(${meanings.meaning})`, `%${q.toLowerCase()}%`)
//               )
//           )
//           .limit(10); // puedes ajustar o quitar el límite según necesites

//           if (data.length === 0) {
//             return c.json(
//                 { success: false, message: 'Término no encontrado' },
//                 404
//             );
//           }

//           const variants = await db
//             .select({
//               id: terms.id,
//               variantId: terms.variantId,
//               meaning: terms.meaning,
//               content: terms.content,
//               audioUrl: terms.audioUrl,
//               example: terms.example,
//               translationExample: terms.translationExample,
//               stateId: terms.stateId,
//               municipalityId: terms.municipalityId,
//               localityId: terms.localityId,
//               email: terms.email,
//               isActive: terms.isActive,
//               // Si quieres createdAt/updatedAt, agrégalos aquí
//             })
//             .from(terms)
//             .where(eq(terms.meaningId, data[0].id));

//             // 3. Armar respuesta anidada
//             const term = {
//               id: data[0].id,
//               category: data[0].category,
//               meaning: data[0].meaning,
//               imageUrl: data[0].imageUrl,
//               variants: variants.map(v => ({
//                 id: v.id,
//                 variantId: v.variantId,
//                 meaning: v.meaning,
//                 content: v.content,
//                 stateId: v.stateId,
//                 municipalityId: v.municipalityId,
//                 localityId: v.localityId,
//                 audioUrl: v.audioUrl,
//                 example: v.example,
//                 translationExample: v.translationExample,
//                 email: v.email,
//                 isActive: v.isActive,
//               })),
//             };

//           // return c.json({ success: true, data: result[0] });
//           return c.json({ success: true, terms: term });
//       } catch (error) {
//           console.error('Error al buscar término:', error);
//           return c.json({ success: false, error: 'Error interno del servidor' }, 500);
//       }
//     }
// );

// GET /api/v1/terms/search?q=mi-contenido
meaningRouter.get('/search', 
    async (c) => {
        // const q = c.req.param('q')
        const q = c.req.query('q');
  
        const db = c.get('db');

        if (!q) {
            return c.json({ success: false, message: 'El parámetro "q" es requerido' }, 400);
        }

        try {
            // Buscar el primer resultado que coincida (parcial o exacto)
            const terms = await db
            .select()
            .from(meanings)
            .where(
                or(
                    // like(sql`LOWER(${meanings.content})`, `%${q.toLowerCase()}%`),
                    like(sql`LOWER(${meanings.meaning})`, `%${q.toLowerCase()}%`)
                )
            )
            .limit(10); // puedes ajustar o quitar el límite según necesites

            if (terms.length === 0) {
            return c.json(
                { success: false, message: 'Término no encontrado' },
                404
            );
            }

            // return c.json({ success: true, data: result[0] });
            return c.json({ success: true, terms: terms });
        } catch (error) {
            console.error('Error al buscar término:', error);
            return c.json({ success: false, error: 'Error interno del servidor' }, 500);
        }
    }
);

// /api/v1/terms/:id
meaningRouter.get("/:id", async (c) => {
  const id = c.req.param('id');
  const db = c.get('db');

  const meaning = await db.query.meanings.findFirst({
    where: { id : id },
    with: {
      // terms: true,   // <-- Incluye los terminos relacionados
      terms: {
        with: {
          locality: true, // <-- Aquí está la clave
        },
      }
    },
  });

  if (!meaning) {
    return c.json({ error: 'Palabra en español no encontrada' }, 404);
  }

  return c.json(meaning);
});


export default meaningRouter;