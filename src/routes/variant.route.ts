import { z } from "zod";
import { validator } from 'hono/validator';
import { eq } from 'drizzle-orm';
import { factory } from '../factory'
import { zValidator } from '@hono/zod-validator';
import { variantsTable } from "../db/schema";

export const variantRouter = factory.createApp()

const queryValidation = validator('query', (value, c) => {
  const offset = Number(value?.offset) || 0;
  const limit = Number(value?.limit) || 99;
  const category = String(value?.category ?? '');

  if (isNaN(offset) || offset < 0) return c.json({ error: 'Offset inválido' }, 400);
  if (isNaN(limit) || limit > 100) return c.json({ error: 'Límite excede el máximo' }, 400);
  if (category === "undefined" ) return c.json({ error: 'Categoría inválida' }, 400);

  return { offset, limit, category };
});

const registerVariantSchema = z.object({
    name: z.string().trim().min(1).toLowerCase(),
    content: z.string().trim().min(1).toLowerCase(),
    audioUrl: z.string().trim().min(1).toLowerCase(),
    example: z.string().trim().min(1).toLowerCase(),
    translationExample: z.string().min(1).trim().toLowerCase(),
    state:z.string().trim().min(1).toLowerCase(),
    municipality: z.string().min(1).trim().toLowerCase(),
    locality: z.string().trim().min(1).toLowerCase(),
    termId: z.number().min(1),
})

const updateVariantSchema = z.object({
    name: z.string().trim().toLowerCase().min(1).optional(),
    content: z.string().trim().toLowerCase().min(1).optional(),
    audioUrl: z.string().trim().toLowerCase().min(1).optional(),
    example: z.string().trim().toLowerCase().min(1).optional(),
    translationExample: z.string().trim().min(1).toLowerCase().optional(),
    state:z.string().trim().min(1).toLowerCase().optional(),
    municipality: z.string().trim().min(1).toLowerCase().optional(),
    locality: z.string().trim().min(1).toLowerCase().optional(),
    termId: z.number().min(1).optional(),
});

// /api/v1/variant
variantRouter.get(
    "/",
    queryValidation,
    async(c) => {
        const db = c.get('db')

        const variants = await db
                .select()
                .from(variantsTable)

        return c.json({data: variants})
    }
);


// /api/v1/variant/:id
variantRouter.get(
    "/:id",
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const term = await db
        .select()
        .from(variantsTable)
        .where(eq(variantsTable.id, parseInt(id)))

        return c.json(term[0])
});

// /api/v1/variant/:id
variantRouter.patch(
    "/:id",
    zValidator('json', updateVariantSchema),
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const updateData = c.req.valid('json');

        const result = await db
        .update(variantsTable)
        .set(updateData)
        .where(eq(variantsTable.id, Number(id)))
        .returning();

        if (result.length === 0) {
            return c.json({ error: 'Variante no encontrado' }, 404);
        }

        return c.json(result[0]);
    }
);

// /api/v1/variants
variantRouter.post("/", zValidator("json", registerVariantSchema),
    async(c) => {
    
    const { 
        name,
        content,
        audioUrl,
        example,
        translationExample,
        state,
        municipality,
        locality,
        termId
      } = await c.req.json();

    const db = c.get('db')

    const newVariant = await db.insert(variantsTable).values({
        name: name,
        content: content,
        audioUrl: audioUrl,
        example: example,
        translationExample: translationExample,
        state: state,
        municipality: municipality,
        locality: locality,
        termId: termId
    }).returning({
        id: variantsTable.id,
        name: variantsTable.name,
        audioUrl: variantsTable.audioUrl,
        example: variantsTable.example,
        translationExample: variantsTable.translationExample,
        state: variantsTable.state,
        municipality: variantsTable.municipality,
        locality: variantsTable.locality,
        termId: variantsTable.termId
    })

    return c.json(newVariant[0])
})

export default variantRouter;