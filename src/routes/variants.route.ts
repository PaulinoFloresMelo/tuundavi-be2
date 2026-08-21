import { factory } from '../factory'
import { variants } from '../db/schema';

export const variantRouter = factory.createApp()


// /api/v1/variants
variantRouter.get(
    "/",
    async(c) => {
        const db = c.get('db')

        const data = await db
                .select()
                .from(variants)

        return c.json({data: data})
    }
);

// /api/v1/variants/:id
variantRouter.get("/:id", async (c) => {
  const id = c.req.param('id');
  const db = c.get('db');

  const variant = await db.query.variants.findFirst({
    where: { id: parseInt(id) },
    with: {
      states: true,   // <-- Incluye los estados relacionados
    },
  });

  if (!variant) {
    return c.json({ error: 'Variante no encontrada' }, 404);
  }

  return c.json(variant);
});

export default variantRouter;