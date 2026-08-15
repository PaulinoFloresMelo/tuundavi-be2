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
meaningRouter.get('/searchWithVariants',
    async (c) => {
      // const q = c.req.param('q')
      const q = c.req.query('q');

      const db = c.get('db');

      if (!q) {
          return c.json({ success: false, message: 'El parámetro "q" es requerido' }, 400);
      }

      try {
          // Buscar el primer resultado que coincida (parcial o exacto)
          const data = await db
          .select()
          .from(meanings)
          .where(
              or(
                  like(sql`LOWER(${meanings.meaning})`, `%${q.toLowerCase()}%`)
              )
          )
          .limit(10); // puedes ajustar o quitar el límite según necesites

          if (data.length === 0) {
            return c.json(
                { success: false, message: 'Término no encontrado' },
                404
            );
          }

          const variants = await db
            .select({
              id: terms.id,
              variantId: terms.variantId,
              meaning: terms.meaning,
              content: terms.content,
              audioUrl: terms.audioUrl,
              example: terms.example,
              translationExample: terms.translationExample,
              stateId: terms.stateId,
              municipalityId: terms.municipalityId,
              localityId: terms.localityId,
              email: terms.email,
              isActive: terms.isActive,
              // Si quieres createdAt/updatedAt, agrégalos aquí
            })
            .from(terms)
            .where(eq(terms.meaningId, data[0].id));

            // 3. Armar respuesta anidada
            const term = {
              id: data[0].id,
              category: data[0].category,
              meaning: data[0].meaning,
              imageUrl: data[0].imageUrl,
              variants: variants.map(v => ({
                id: v.id,
                variantId: v.variantId,
                meaning: v.meaning,
                content: v.content,
                stateId: v.stateId,
                municipalityId: v.municipalityId,
                localityId: v.localityId,
                audioUrl: v.audioUrl,
                example: v.example,
                translationExample: v.translationExample,
                email: v.email,
                isActive: v.isActive,
              })),
            };

          // return c.json({ success: true, data: result[0] });
          return c.json({ success: true, terms: term });
      } catch (error) {
          console.error('Error al buscar término:', error);
          return c.json({ success: false, error: 'Error interno del servidor' }, 500);
      }
    }
);

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
meaningRouter.get(
  "/:id",
  async (c) => {
    const id = c.req.param('id');
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return c.json({ success: false, message: 'ID inválido' }, 400);
    }

    const db = c.get('db');

    // 1. Obtener el término
    const termResult = await db
      .select({
        id: meanings.id,
        category: meanings.category,
        meaning: meanings.meaning,
        imageUrl: meanings.imageUrl,
        // Agrega aquí otros campos que tenga meaningsTable (ej. createdAt, userId)
      })
      .from(meanings)
      .where(eq(meanings.id, idNum))
      .limit(1);

    if (!termResult || termResult.length === 0) {
      return c.json({ success: false, message: 'Término no encontrado' }, 404);
    }

    const termData = termResult[0];

    // 2. Obtener TODAS las variantes de este término
    const variants = await db
      .select({
        id: terms.id,
        variantId: terms.variantId,
        meaning: terms.meaning,
        content: terms.content,
        audioUrl: terms.audioUrl,
        example: terms.example,
        translationExample: terms.translationExample,
        stateId: terms.stateId,
        municipalityId: terms.municipalityId,
        localityId: terms.localityId,
        email: terms.email,
        isActive: terms.isActive,
        // Si quieres createdAt/updatedAt, agrégalos aquí
      })
      .from(terms)
      .where(eq(terms.meaningId, idNum));

    // 3. Armar respuesta anidada
    const term = {
      id: termData.id,
      category: termData.category,
      meaning: termData.meaning,
      imageUrl: termData.imageUrl,
      variants: variants.map(v => ({
        id: v.id,
        variantId: v.variantId,
        meaning: v.meaning,
        content: v.content,
        stateId: v.stateId,
        municipalityId: v.municipalityId,
        localityId: v.localityId,
        audioUrl: v.audioUrl,
        example: v.example,
        translationExample: v.translationExample,
        email: v.email,
        isActive: v.isActive,
      })),
    };

    return c.json(term);
  }
);


// /api/v1/terms/:id
meaningRouter.patch("/:id", zValidator('json', updateTermSchema),
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const updateData = c.req.valid('json');

        const result = await db
        .update(meanings)
        .set(updateData)
        .where(eq(meanings.id, Number(id)))
        .returning();

        if (result.length === 0) {
            return c.json({ error: 'Termino no encontrado ' }, 404);
        }

        return c.json(result[0]);
    }
);

// /api/v1/terms
meaningRouter.post("/", zValidator("json", registerTermSchema),
    async(c) => {
    
    const data = c.req.valid('json');

    const db = c.get('db')
    const [term] = await db
    .select()
    .from(meanings)
    .where( sql`LOWER(${meanings.meaning}) = LOWER(${meanings})`)

    if (term) {
        return c.json({ message: "Term already registered" }, 400)
    }

    const newTerm = await db.insert(meanings).values({
        meaning: data.meaning,
        imageUrl: data.imageUrl,
        category: data.category,
    }).returning({
        id: meanings.id,
        meaning: meanings.meaning,
        imageUrl: meanings.imageUrl,
        category: meanings.category,
    })

    return c.json(newTerm[0])
})

export default meaningRouter;