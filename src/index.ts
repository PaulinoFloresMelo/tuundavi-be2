
import { authRouter } from './routes/auth.route';
import { meaningRouter } from './routes/meaning.route';
import { termNahuatlRouter } from './routes/terms-nahuatl.route';
import { variantRouter } from './routes/variants.route';
import { variantStateRouter } from './routes/variantState.route';
import { stateRouter } from './routes/states.route';
import { imageRouter } from './routes/image.route';
import { audioRouter } from './routes/audio.route';
import { cors } from 'hono/cors';
import { factory } from './factory'

// import imageRouter from './routes/image.route';
import { dbMiddleware } from './middlewares/db'

const app = factory.createApp()

const allowedOrigins = ['http://localhost:4200', 'https://paulinofloresmelo.github.io'];

// CORS should be called before the route
app.use('/api/*', cors({ 
  origin: '*', 
  // origin: (origin) => {
  //   if (allowedOrigins.includes(origin || '')) {
  //     return origin;
  //   }
  //   return 'http://localhost:4200'; // fallback
  // },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use('*', dbMiddleware)

app.route('/api/v1/auth', authRouter)
app.route('/api/v1/meanings', meaningRouter)
app.route('/api/v1/termsNahuatl', termNahuatlRouter)
app.route('/api/v1/variants', variantRouter)
app.route('/api/v1/variantsState', variantStateRouter)
app.route('/api/v1/states', stateRouter)
app.route('/api/v1/images', imageRouter)
app.route('/api/v1/audio', audioRouter)


// Habilitar CORS para todas las rutas con todos los orígenes, métodos y encabezados
app.get('/', (c) => c.text('Hello Bun!'));

export default { 
  port: 3000, 
  fetch: app.fetch, 
} 
