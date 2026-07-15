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
      return c.json({ message: 'Nombre de archivo inválido' }, 400);
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
    return c.json({ message: 'Error interno al recuperar el archivo' }, 500);
  }
});


// POST api/v1/audio
audioRouter.post('/upload', async (c) => {
  try {
  
    // 1. Parsear el formulario multipart
    const body = await c.req.parseBody();
    const audioFile = body['audio']; // campo esperado
     // Luego validas la extensión como fallback

    // 2. Validar que sea un archivo
    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ message: 'No se proporcionó un archivo de audio válido' }, 400);
    }

    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/mp4',
      'audio/x-m4a',
      'audio/m4a',
      'audio/webm',
    ];

    if (!allowedMimeTypes.includes(audioFile.type)) {
      return c.json({
        message: `Formato no soportado. MIME recibido: ${audioFile.type}. Permitidos: ${allowedMimeTypes.join(', ')}`,
      }, 400);
    }

    // 4. Validar tamaño (opcional, ya lo hace bodyLimit)
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (audioFile.size > maxSize) {
      return c.json({ error: 'El archivo excede el límite de 5 MB' }, 400);
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
      fileName: key,
      url: publicUrl,
    }, 201);

  } catch (error) {
    console.error('Error al subir audio:', error);
    return c.json({ message: 'Error interno al procesar el archivo' }, 500);
  }
});

export default audioRouter