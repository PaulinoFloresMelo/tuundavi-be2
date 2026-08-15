import { z } from "zod";
import { validator } from 'hono/validator';
import { eq } from 'drizzle-orm';
import { factory } from '../factory'
import { zValidator } from '@hono/zod-validator';
import { terms } from "../db/schema";
import { text } from 'drizzle-orm/sqlite-core';

export const termNahuatlRouter = factory.createApp()

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
    variantId: z.number().min(1),
    meaning: z.string().trim().min(1).toLowerCase(),
    content: z.string().trim().min(1).toLowerCase(),
    audioUrl: z.string().trim().min(1),
    example: z.string().trim().min(1),
    translationExample: z.string().min(1).trim(),
    email: z.string().trim().optional(),
    stateId: z.string().min(1),
    municipalityId: z.string().min(1),
    localityId: z.string().min(1),
    meaningId: z.number().min(1),
})

const updateVariantSchema = z.object({
    variantId: z.number().min(1).optional(),
    meaning: z.string().trim().min(1).toLowerCase().optional(),
    content: z.string().trim().toLowerCase().min(1).optional(),
    audioUrl: z.string().trim().min(1).optional(),
    example: z.string().trim().min(1).optional(),
    translationExample: z.string().trim().min(1).optional(),
    email: z.string().min(5).trim().optional(),
    stateId:z.string().min(1).optional(),
    municipalityId: z.string().min(1).optional(),
    localityId: z.string().min(1).optional(),
    meaningId: z.number().min(1).optional(),
});

// /api/v1/variant
termNahuatlRouter.get(
    "/",
    queryValidation,
    async(c) => {
        const db = c.get('db')

        const variants = await db
                .select()
                .from(terms)

        return c.json({data: variants})
    }
);


// /api/v1/variant/:id
termNahuatlRouter.get(
    "/:id",
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const term = await db
        .select()
        .from(terms)
        .where(eq(terms.id, parseInt(id)))

        return c.json(term[0])
});

// /api/v1/variant/:id
termNahuatlRouter.patch(
    "/:id",
    zValidator('json', updateVariantSchema),
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const updateData = c.req.valid('json');

        const result = await db
        .update(terms)
        .set(updateData)
        .where(eq(terms.id, Number(id)))
        .returning();

        if (result.length === 0) {
            return c.json({ error: 'Variante no encontrado' }, 404);
        }

        return c.json(result[0]);
    }
);

// /api/v1/variants
termNahuatlRouter.post("/", zValidator("json", registerVariantSchema),
    async(c) => {
    
    const data = c.req.valid('json');

    try {
        const db = c.get('db')

        const newVariant = await db.insert(terms).values({

            variantId: data.variantId,
            content: data.content,
            meaning: data.meaning,
            audioUrl: data.audioUrl,
            example: data.example,
            translationExample: data.translationExample,
            email: data.email ?? null,
            stateId: data.stateId,
            municipalityId: data.municipalityId,
            localityId: data.localityId,
            meaningId: data.meaningId ?? null
        }).returning({
            id: terms.id,
            variantId: terms.variantId,
            meaning: terms.meaning,
            audioUrl: terms.audioUrl,
            example: terms.example,
            translationExample: terms.translationExample,
            email: terms.email,
            stateId: terms.stateId,
            municipalityId: terms.municipalityId,
            localityId: terms.localityId,
            meaningId: terms.meaningId
        })

        return c.json(newVariant[0])
    } catch (error) {
        return c.json({
            error: 'Internal Server Error',
            message: error,
            stack: error
        }, 500);
    }
})

export default termNahuatlRouter;