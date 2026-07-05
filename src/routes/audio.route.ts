import { factory } from '../factory'
import { bodyLimit } from 'hono/body-limit';

export const audioRouter = factory.createApp()

audioRouter.use('/upload', bodyLimit({
  maxSize: 20 * 1024 * 1024, // 20 MB
}));

// GET /audio/:audioname
audioRouter.get('/:audioName', async (c) => {
  try {
    // 1. Obtener el nombre del archivo desde la URL
    const audioName = c.req.param('audioName');
    
    // 2. Validar seguridad (evitar path traversal)
    if (!audioName || audioName.includes('..') || audioName.includes('/')) {
      return c.json({ error: 'Nombre de archivo inválido' }, 400);
    }

    // 3. Construir la clave en R2 (debe coincidir con la estructura al subir)
    const key = `${audioName}`;

    // 4. Obtener el bucket de audio
    const bucket = c.env.AUDIO_BUCKET; // o IMAGES_BUCKET si usas el mismo
    if (!bucket) {
      return c.json({ error: 'Bucket no configurado' }, 500);
    }

    // 5. Intentar obtener el objeto desde R2
    const object = await bucket.get(key);

    // 6. Si no existe, devolver 404
    if (!object) {
      return c.json({ error: 'Audio no encontrado' }, 404);
    }

    // 7. Obtener el body como stream o arrayBuffer
    const body = object.body; // es un ReadableStream (si usas get sin opciones)
    
    // 8. Determinar el Content-Type (usar el guardado o detectar por extensión)
    const contentType = object.httpMetadata?.contentType || 
                        audioName.endsWith('.mp3') ? 'audio/mpeg' :
                        audioName.endsWith('.wav') ? 'audio/wav' :
                        audioName.endsWith('.ogg') ? 'audio/ogg' :
                        audioName.endsWith('.flac') ? 'audio/flac' :
                        audioName.endsWith('.aac') ? 'audio/aac' :
                        audioName.endsWith('.m4a') ? 'audio/mp4' :
                        'application/octet-stream';

    // 9. Construir la respuesta con el stream
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': object.size ? String(object.size) : '',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache de 1 año (opcional)
        'Content-Disposition': `inline; filename="${audioName}"`, // reproduce en navegador
        'Accept-Ranges': 'bytes', // permite reproducción con seek
      },
    });

  } catch (error) {
    console.error('Error al obtener audio:', error);
    return c.json({ error: 'Error interno al recuperar el archivo' }, 500);
  }
});


// POST api/v1/audio
audioRouter.post('/upload', async (c) => {
  try {
  
    // 1. Parsear el formulario multipart
    const body = await c.req.parseBody();
    const audioFile = body['audio']; // campo esperado

    // 2. Validar que sea un archivo
    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ error: 'No se proporcionó un archivo de audio válido' }, 400);
    }

    // 3. Validar tipo MIME (formatos de audio comunes)
    const allowedTypes = [
      'audio/mpeg',      // MP3
      'audio/wav',       // WAV
      'audio/ogg',       // OGG
      'audio/flac',      // FLAC
      'audio/aac',       // AAC
      'audio/mp4',       // M4A
      'audio/webm',      // WebM
    ];

    if (!allowedTypes.includes(audioFile.type)) {
      return c.json({ 
        error: `Formato no soportado. Permitidos: ${allowedTypes.join(', ')}` 
      }, 400);
    }

    // 4. Validar tamaño (opcional, ya lo hace bodyLimit)
    const maxSize = 20 * 1024 * 1024; // 20 MB
    if (audioFile.size > maxSize) {
      return c.json({ error: 'El archivo excede el límite de 20 MB' }, 400);
    }

    // 5. Leer el contenido del archivo
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 6. Generar nombre único
    const timestamp = Date.now();
    const extension = audioFile.name.split('.').pop() || 'mp3';
    const filename = `audio_${timestamp}.${extension}`;
    const key = `${filename}`;

    // 7. Guardar en R2 (o donde tengas configurado)
    const bucket = c.env.AUDIO_BUCKET; // o IMAGES_BUCKET si usas el mismo
    if (!bucket) {
      // Si no tienes R2, puedes guardar en un servicio externo (ver alternativas abajo)
      return c.json({ error: 'Bucket no configurado' }, 500);
    }

    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType: audioFile.type,
        contentDisposition: `attachment; filename="${audioFile.name}"`,
      },
    });

    // 8. Construir URL pública (si tienes acceso público configurado)
    const publicUrl = `https://tu-worker.dev/${key}`; // o usar R2 public URL

    return c.json({
      message: 'Audio subido correctamente',
      filename: audioFile.name,
      key: key,
      size: audioFile.size,
      type: audioFile.type,
      url: publicUrl,
    }, 201);

  } catch (error) {
    console.error('Error al subir audio:', error);
    return c.json({ error: 'Error interno al procesar el archivo' }, 500);
  }
});

// POST api/v1/images/upload - para subir imágenes
audioRouter.post('/upload', async (c) => {
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

export default audioRouter