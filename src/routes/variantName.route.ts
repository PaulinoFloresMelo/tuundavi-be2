import { z } from "zod";
import { validator } from 'hono/validator';
import { eq } from 'drizzle-orm';
import { factory } from '../factory'
import { zValidator } from '@hono/zod-validator';
import { variants } from "../db/schema";

export const variantNameRouter = factory.createApp()

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
    name: z.string().trim().min(1),
})

const updateVariantSchema = z.object({
    name: z.string().trim().min(1).optional(),
});

// /api/v1/variantsName
variantNameRouter.get(
    "/",
    queryValidation,
    async(c) => {
        const db = c.get('db')

        const data = await db
                .select()
                .from(variants)

        return c.json({data: data})
    }
);


// /api/v1/variantsName/:id
variantNameRouter.get(
    "/:id",
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const term = await db
        .select()
        .from(variants)
        .where(eq(variants.id, parseInt(id)))

        return c.json(term[0])
});

// /api/v1/variantsName/:id
variantNameRouter.patch(
    "/:id",
    zValidator('json', updateVariantSchema),
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const updateData = c.req.valid('json');

        const result = await db
        .update(variants)
        .set(updateData)
        .where(eq(variants.id, Number(id)))
        .returning();

        if (result.length === 0) {
            return c.json({ error: 'Variante no encontrado' }, 404);
        }

        return c.json(result[0]);
    }
);

// /api/v1/variantsName
variantNameRouter.post("/", zValidator("json", registerVariantSchema),
    async(c) => {
    
    const { 
        name,
      } = c.req.valid('json');

    const db = c.get('db')

    const newVariant = await db.insert(variants).values({
        name: name,
       
    }).returning({
        id: variants.id,
        name: variants.name,
        
    })

    return c.json(newVariant[0])
})

export default variantNameRouter;