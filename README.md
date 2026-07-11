```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
# tuundavi-be2

```txt
npx wrangler deploy 
```

```txt
npx drizzle-kit generate
```

```txt
npx drizzle-kit migrate
```
```txt
npx drizzle-kit push
```