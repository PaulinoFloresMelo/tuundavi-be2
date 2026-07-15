import { z } from "zod";
import { validator } from 'hono/validator';
import { eq, like, or, sql } from 'drizzle-orm';
import { factory } from '../factory'
import { zValidator } from '@hono/zod-validator';
import { termsTable } from "../db/schema";
import { variantsTable } from "../db/schema";
import { usersTable } from "../db/schema";

export const termRouter = factory.createApp()

const queryValidation = validator('query', (value, c) => {
  const offset = Number(value?.offset) || 0;
  const limit = Number(value?.limit) || 99;
  const category = String(value?.category ?? '');

  if (isNaN(offset) || offset < 0) return c.json({ error: 'Offset inválido' }, 400);
  if (isNaN(limit) || limit > 100) return c.json({ error: 'Límite excede el máximo' }, 400);
  if (category === "undefined" ) return c.json({ error: 'Categoría inválida' }, 400);

  return { offset, limit, category };
});

const registerTermSchema = z.object({
    content: z.string().trim().toLowerCase(),
    meaning: z.string().trim().toLowerCase(),
    imageUrl: z.string().trim().toLowerCase(),
    audioUrl: z.string().trim().toLowerCase(),
    example: z.string().trim().toLowerCase(),
    category: z.string().trim().toLowerCase(),
    userId: z.number(),
    variantId: z.number(),
})

const updateTermSchema = z.object({
    content: z.string().trim().toLowerCase().optional(),
    meaning: z.string().trim().toLowerCase().optional(),
    imageUrl: z.string().trim().toLowerCase().optional(),
    audioUrl: z.string().trim().toLowerCase().optional(),
    example: z.string().trim().toLowerCase().optional(),
    category: z.string().trim().toLowerCase().optional(),
    userId: z.number().optional(),
    variantId: z.number().optional(),
});

export const searchTermSchema = z.object({
  q: z.string().min(1, 'El término de búsqueda es requerido'),
});

// /api/v1/terms
termRouter.get(
    "/",
    queryValidation,
    async (c) => {
        const { offset, limit, category } = c.req.valid('query');
        const db = c.get('db');

        // Construir la consulta base con joins
        let query = db.select({
            // Campos de terms
            id: termsTable.id,
            category: termsTable.category,
            content: termsTable.content,
            meaning: termsTable.meaning,
            imageUrl: termsTable.imageUrl,
            audioUrl: termsTable.audioUrl,
            example: termsTable.example,
            
            userId: usersTable.id,
            username: usersTable.firstName,
            maternalName: usersTable.maternalName,
            paternalName: usersTable.paternalName,
            
            // Datos de la variante
            variantId: variantsTable.id,
            variantName: variantsTable.name,
            variantDescription: variantsTable.description,
            localityName: variantsTable.localityName,
        })
        .from(termsTable)
        .leftJoin(usersTable, eq(termsTable.userId, usersTable.id))
        .leftJoin(variantsTable, eq(termsTable.variantId, variantsTable.id))
        .limit(limit)
        .offset(offset)
        .$dynamic();

        // Aplicar filtro por categoría si existe
        if (category && category.length > 0) {
            query = query.where(eq(termsTable.category, category));
        }

        // Ejecutar la consulta principal
        const termsWithRelations = await query;

        // Obtener el total de términos (para la paginación)
        // Nota: Podrías hacer un count aparte o usar SQL_CALC_FOUND_ROWS, 
        // pero con Drizzle lo más claro es una segunda consulta simple.
        const totalQuery = db.select({ count: sql<number>`count(*)` })
            .from(termsTable)
            .where(category ? eq(termsTable.category, category) : sql`1=1`);
        const totalResult = await totalQuery;
        const total = Number(totalResult[0]?.count ?? 0);

        // Opcional: Reestructurar la respuesta para que cada término tenga un objeto anidado
        // En lugar de campos planos, puedes agruparlos en un objeto
        const terms = termsWithRelations.map(row => ({
            id: row.id,
            category: row.category,
            content: row.content,
            meaning: row.meaning,
            imageUrl: row.imageUrl,
            audioUrl: row.audioUrl,
            example: row.example,
            user: {
                userId: row.id,
                username: row.username,
                maternalName: row.maternalName,
                paternalName: row.paternalName,
            },
            variant: {
                id: row.variantId,
                name: row.variantName,
                description: row.variantDescription,
                localityName: row.localityName,
            }
        }));

        return c.json({
            count: total,
            totalPages: Math.ceil(total / limit),
            terms,
            category
        });
    }
);

// termRouter.get(
//     "/",
//     queryValidation,
//     async(c) => {
//         const { offset, limit, category } = c.req.valid('query');
//         const db = c.get('db')

//         if (category.length !== 0) {
//             const [terms, total] = await Promise.all([

//             db.select()
//             .from(termsTable)
//             .limit(limit)
//             .offset(offset)
//             .where(eq(termsTable.category, category)),
            
//             db.select()
//             .from(termsTable)
//         ]);

//         return c.json({
//             count: total.length, totalPages: Math.ceil(total.length / limit), terms}) 
//         }

//         const [terms, total] = await Promise.all([

//             db.select()
//             .from(termsTable)
//             .limit(limit)
//             .offset(offset),
            
//             db.select()
//             .from(termsTable)
//         ]);

//         return c.json({
//             count: total.length, pages: Math.ceil(total.length / limit), terms})         
//     }
// );

// GET /api/v1/terms/search?q=mi-contenido
termRouter.get('/search', 
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
            .from(termsTable)
            .where(
                or(
                    like(sql`LOWER(${termsTable.content})`, `%${q.toLowerCase()}%`),
                    like(sql`LOWER(${termsTable.meaning})`, `%${q.toLowerCase()}%`)
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
termRouter.get(
    "/:id",
    async (c) => {
        const id = c.req.param('id');

        // Validación extra para evitar NaN
        const idNum = parseInt(id);
        if (isNaN(idNum)) {
            return c.json({ success: false, message: 'ID inválido' }, 400);
        }

        const db = c.get('db');

        // Consulta con joins
        const result = await db
            .select({
                // Campos de terms
                id: termsTable.id,
                category: termsTable.category,
                content: termsTable.content,
                meaning: termsTable.meaning,
                imageUrl: termsTable.imageUrl,
                audioUrl: termsTable.audioUrl,
                example: termsTable.example,
                // ... otros campos que tengas en terms
                
                // Datos del usuario
                userId: usersTable.id,
                username: usersTable.firstName,
                paternalName: usersTable.paternalName,
                maternalName: usersTable.maternalName,
                
                 // Datos de la variante
                variantId: variantsTable.id,
                variantName: variantsTable.name,
                variantDescription: variantsTable.description,
                localityName: variantsTable.localityName,
                // ... otros campos de variants
            })
            .from(termsTable)
            .leftJoin(usersTable, eq(termsTable.userId, usersTable.id))
            .leftJoin(variantsTable, eq(termsTable.variantId, variantsTable.id))
            .where(eq(termsTable.id, idNum));

        if (!result || result.length === 0) {
            return c.json({ success: false, message: 'Término no encontrado' }, 404);
        }

        // 3. Estructurar la respuesta con objetos anidados
        const row = result[0];
        const term = {
            id: row.id,
            category: row.category,
            content: row.content,
            meaning: row.meaning,
            imageUrl: row.imageUrl,
            audioUrl: row.audioUrl,
            example: row.example,
            user: row.userId ? {
                id: row.userId,
                username: row.username,
                paternalName: row.paternalName,
                maternalName: row.maternalName,
            } : null, // si no hay usuario, devolvemos null
            variant: row.variantId ? {
                id: row.variantId,
                name: row.variantName,
                description: row.variantDescription,
                localityName: row.localityName,
            } : null,
        };

        return c.json(term);
    }
);
// termRouter.get(
//     "/:id",
//     async(c) => {
//         const id = c.req.param('id')

//         // Validación extra para evitar NaN
//         const idNum = parseInt(id);
//         if (isNaN(idNum)) {
//             return c.json({ success: false, message: 'ID inválido' }, 400);
//         }
        
//         const db = c.get('db')
//         const term = await db
//         .select()
//         .from(termsTable)
//         .where(eq(termsTable.id, parseInt(id)))

//         if (!term.length) {
//             return c.json({ success: false, message: 'Término no encontrado' }, 404);
//         }

//         return c.json(term[0])
// });

// /api/v1/terms/:id
termRouter.patch(
    "/:id",
    zValidator('json', updateTermSchema),
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const updateData = c.req.valid('json');

        const result = await db
        .update(termsTable)
        .set(updateData)
        .where(eq(termsTable.id, Number(id)))
        .returning();

        if (result.length === 0) {
            return c.json({ error: 'Usuario no encontrado' }, 404);
        }

        return c.json(result[0]);
    }
);

// /api/v1/terms
termRouter.post("/", zValidator("json", registerTermSchema),
    async(c) => {
    
    const { 
        content,
        meaning, 
        imageUrl,
        audioUrl,
        example,
        userId,
        variantId,
        category
      } = await c.req.json();

    const db = c.get('db')
    const [term] = await db
    .select()
    .from(termsTable)
    .where( eq(termsTable.content, content) )

    if (term) {
        return c.json({ message: "Term already registered" }, 400)
    }

    const newTerm = await db.insert(termsTable).values({
        content: content,
        meaning: meaning,
        imageUrl: imageUrl,
        audioUrl: audioUrl,
        example: example,
        category: category,
        userId: userId,
        variantId: variantId,
    }).returning({
        id: termsTable.id,
        content: termsTable.content,
        meaning: termsTable.meaning,
        imageUrl: termsTable.imageUrl,
        audioUrl: termsTable.audioUrl,
        example: termsTable.example,
        category: termsTable.category,
        userId: termsTable.userId,
        cariantId: termsTable.variantId,
    })

    return c.json(newTerm[0])
})

export default termRouter;