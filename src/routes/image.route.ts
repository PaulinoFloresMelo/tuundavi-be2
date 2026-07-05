import { factory } from '../factory'

export const imageRouter = factory.createApp()

// GET api/v1/images/:image
imageRouter.get('/:image', async (c) => {
  const imageName = c.req.param('image');

  const assetPath = `/static/images/${imageName}`;

  const assetUrl = new URL(assetPath, c.req.url);
  const assetRequest = new Request(assetUrl);
  const assetResponse = await c.env.ASSETS.fetch(assetRequest);

  if (assetResponse.status === 404) {
    const bucket = c.env.IMAGES_BUCKET;
    const object = await bucket.get(imageName);
    
    if(object){
  
      const body = await object.arrayBuffer();
      const contentType = imageName.endsWith('.png') ? 'image/png' :
                        imageName.endsWith('.jpg') || imageName.endsWith('.jpeg') ? 'image/jpeg' :
                        'application/octet-stream';

      return new Response(body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
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

// POST api/v1/images/upload - para subir imágenes
imageRouter.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['image']; // el nombre del campo en el formulario

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No se proporcionó un archivo válido' }, 400);
  }

  // Genera un nombre único para la imagen
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const fileName = `${timestamp}.${extension}`;

  // Guarda en R2
  const bucket = c.env.IMAGES_BUCKET;
  const arrayBuffer = await file.arrayBuffer();
  
  await bucket.put(fileName, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // Devuelve la URL pública (si tienes un dominio o usas la URL del Worker)
  const baseUrl = new URL(c.req.url);
  const imageUrl = `${baseUrl.origin}/images/${fileName}`;

  return c.json({
    message: 'Imagen subida correctamente',
    url: imageUrl,
    fileName,
  });
});

export default imageRouter