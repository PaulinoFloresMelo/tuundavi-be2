import { factory } from '../factory'

export const imageRouter = factory.createApp()

imageRouter.get('/:image', async (c) => {
  const imageName = c.req.param('image');

  const assetPath = `/static/images/${imageName}`;

  const assetUrl = new URL(assetPath, c.req.url);
  const assetRequest = new Request(assetUrl);
  const assetResponse = await c.env.ASSETS.fetch(assetRequest);

  if (assetResponse.status === 404) {
    return c.notFound();
  }

  if (!assetResponse.ok) {
    return c.json('Error al obtener imagen');
  }

  const headers = new Headers(assetResponse.headers);
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    headers,
  });
});

export default imageRouter