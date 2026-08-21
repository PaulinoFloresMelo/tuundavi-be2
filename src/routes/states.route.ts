import { factory } from '../factory'
import { eq, like } from 'drizzle-orm';
import { variants, municipalities } from '../db/schema';
import { any } from 'zod';

export const stateRouter = factory.createApp()


// /api/v1/states
stateRouter.get(
    "/",
    async(c) => {
        const db = c.get('db')

        const data = await db
                .select()
                .from(variants)

        return c.json({data: data})
    }
);

// /api/v1/states/:id
stateRouter.get("/:id", async (c) => {
  const id = c.req.param('id');
  const variantId = c.req.query('variantId');
  const db = c.get('db');

  const state = await db.query.states.findFirst({
    where: { id },
    with: {
      municipalities: true,   // <-- Incluye los municipios relacionados
    },
  });

  if (!state) {
    return c.json({ error: 'Estado no encontrada' }, 404);
  }

  if (variantId) {
    state.municipalities = state.municipalities.filter(
      (municipio) => municipio.id.startsWith(variantId)  // o .name.startsWith(variantId)
    );
  }

  return c.json(state);
});

export default stateRouter;