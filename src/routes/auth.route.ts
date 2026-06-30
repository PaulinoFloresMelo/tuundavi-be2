import { z } from "@hono/zod-openapi";
import { zValidator } from '@hono/zod-validator';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { factory } from '../factory'
import * as bcrypt from 'bcryptjs'


export const authRouter = factory.createApp()


const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email({
        message: "invalid email address"
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 character long"
    })
})

const registerSchema = z.object({
    email: z.string().trim().toLowerCase().email({
        message: "invalid email address"
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 character long"
    }),
    username: z.string().trim().toLowerCase().min(3, {
        message: "Username must be at least 6 character long"
    }).optional(),
})


// /api/v1/auth/login
authRouter.post("/login", zValidator("json", loginSchema),
    async(c) => {

        const db = c.get('db')
        const {email, password} = await c.req.json();
        const secret = c.env.JWT_SECRET;

        const [user] = await db
        .select()
        .from(usersTable)
        .where( eq(usersTable.email, email) )

        
        if ( !user ) {
            return c.json({message: "Credentials invalid"}, 404 )
        }
        
        // const isMatch = await Bun.password.verify(password, user.password)
        const isMatch = await bcrypt.compare(password, user.password)
        
        if ( !isMatch ) {
            return c.json({message: "Credentials invalid"}, 401 )
        }
        
        const payload = {
            id: user.id, 
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // a day
        }
        const secretKey = c.env.JWT_SECRET as string;
        const token = await sign(payload, secretKey, "HS256")

        const userResponse = {email:user.email, userId: user.id};

        return c.json({ user: userResponse, token })
    }
)

// /api/v1/auth/register
authRouter.post("/register", zValidator("json", registerSchema),
    async(c) => {
    
    const {
        email,
        password,
        firstName,
        paternalName,
        maternalName} = await c.req.json();

    const db = c.get('db')
    const [user] = await db
    .select()
    .from(usersTable)
    .where( eq(usersTable.email, email) )

    if (user) {
        return c.json({ message: "Email already registered" }, 400)
    } 
    // const hashedPassword = await Bun.password.hash(password)
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.insert(usersTable).values({
        email,
        password: hashedPassword,
        firstName: firstName,
        paternalName: paternalName,
        maternalName: maternalName
    }).returning({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName
    })

    return c.json({newUser})
})

// /api/v1/auth/check-status
authRouter.get("/check-status",
    async(c) => {
    
    const tokenToVerify = await c.req.header('Authorization')?.replace('Bearer ', '');

    if (!tokenToVerify) {
    return c.json({ error: 'Token no proporcionado' }, 401);
    }

    const secretKey = c.env.JWT_SECRET as string;
    const decodedPayload = await verify(tokenToVerify, secretKey, "HS256")
    const emailToFind = decodedPayload.email as string;
    
    const db = c.get('db')
    const [user] = await db
    .select()
    .from(usersTable)
    .where( eq(usersTable.email, emailToFind) )
    
    if ( !user ) {
        return c.json({message: "Credentials invalid"}, 404 )
    }

    const userResponse = {email:user.email, userId: user.id};
    
    const payload = {
        id: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // a day
    }
    const token = await sign(payload, secretKey)

    return c.json({ user: userResponse, token }) 
})


export default authRouter;