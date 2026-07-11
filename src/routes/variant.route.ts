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
    name: z.string().trim().toLowerCase(),
    description: z.string().trim().toLowerCase(),
    localityName: z.string().trim().toLowerCase(),
})

const updateVariantSchema = z.object({
    name: z.string().trim().toLowerCase().optional(),
    description: z.string().trim().toLowerCase().optional(),
    localityName: z.string().trim().toLowerCase().optional(),
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

// /api/v1/varints
variantRouter.post("/", zValidator("json", registerVariantSchema),
    async(c) => {
    
    const { 
        name,
        description, 
        localityName,
      } = await c.req.json();

    const db = c.get('db')
    const [variant] = await db
    .select()
    .from(variantsTable)
    .where( eq(variantsTable.name, name) )

    if (variant) {
        return c.json({ message: "Variant already registered" }, 400)
    }

    const newVariant = await db.insert(variantsTable).values({
        name: name,
        description: description,
        localityName: localityName,
    }).returning({
        id: variantsTable.id,
        name: variantsTable.name,
        localityName: variantsTable.localityName,
    })

    return c.json(newVariant[0])
})

export default variantRouter;