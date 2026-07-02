import { factory } from '../factory'

export const imageRouter = factory.createApp()

imageRouter.get('/:image', async (c) => {
  const imageName = c.req.param('image')

  const assetPath = `/static/images/${imageName}`
  const assetRequest = new Request(new URL( assetPath, c.req.url ))

  const assetResponse = await c.env.ASSETS.fetch(assetRequest)

  // Si no existe
  if (assetResponse.status === 404) {
    return c.notFound()
  }

  // Clona la respuesta y añade cabeceras personalizadas
  const headers = new Headers(assetResponse.headers)
  headers.set('Cache-Control', 'public, max-age=86400')

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    headers,
  })
})

export default imageRouter