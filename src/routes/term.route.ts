import { z } from "zod";
import { eq } from 'drizzle-orm';
import { factory } from '../factory'
import { zValidator } from '@hono/zod-validator';
import { termsTable } from "../db/schema";

export const termRouter = factory.createApp()

const registerTermSchema = z.object({
    content: z.string().trim().toLowerCase(),
    imageUrl: z.string().trim().toLowerCase(),
    audioUrl: z.string().trim().toLowerCase(),
    example: z.string().trim().toLowerCase(),
    userId: z.number(),
})


// /api/v1/terms
termRouter.get(
    "/",
    async(c) => {
        const db = c.get('db')
        const terms = await db
        .select()
        .from(termsTable)
        .limit(3);

        return c.json({terms})
});


// /api/v1/terms/:id
termRouter.get(
    "/:id",
    async(c) => {
        const id = c.req.param('id')
        
        const db = c.get('db')
        const term = await db
        .select()
        .from(termsTable)
        .where(eq(termsTable.id, parseInt(id)))

        return c.json(term[0])
});

// /api/v1/terms/term-register
termRouter.post("/term-register", zValidator("json", registerTermSchema),
    async(c) => {
    
    const { 
        content, 
        imageUrl,
        audioUrl,
        example,
        userId,  } = await c.req.json();

    const db = c.get('db')
    const [term] = await db
    .select()
    .from(termsTable)
    .where( eq(termsTable.content, content) )

    if (term) {
        return c.json({ message: "Term already registered" }, 400)
    }

    const newTerm = await db.insert(termsTable).values({
        content: content,
        imageUrl: imageUrl,
        audioUrl: audioUrl,
        example: example,
        userId: userId,
    }).returning({
        id: termsTable.id,
        content: termsTable.content,
        imageUrl: termsTable.imageUrl,
        audioUrl: termsTable.audioUrl,
        example: termsTable.example,
        userId: termsTable.userId,
    })

    return c.json({newTerm})
})

export default termRouter;