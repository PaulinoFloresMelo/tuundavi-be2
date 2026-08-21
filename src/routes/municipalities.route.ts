import { factory } from '../factory'
import { municipalities } from '../db/schema';

export const municipalityRouter = factory.createApp()


// /api/v1/municipalities
municipalityRouter.get(
    "/",
    async(c) => {
        const db = c.get('db')

        const data = await db
                .select()
                .from(municipalities)

        return c.json({data: data})
    }
);

// /api/v1/municipalities/:id
municipalityRouter.get("/:id", async (c) => {
  const id = c.req.param('id');
  // const variantId = c.req.query('variantId');
  const db = c.get('db');

  const state = await db.query.municipalities.findFirst({
    where: { id : id },
    with: {
      localities: true,   // <-- Incluye los municipios relacionados
    },
  });

  if (!state) {
    return c.json({ error: 'Estado no encontrada' }, 404);
  }

  return c.json(state);
});

export default municipalityRouter;