import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import {
    hashPassword,
    generateUserToken,
    generateVerificationToken,
} from '@/lib/user-auth'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password } = schema.parse(body)

        await connectMongo()

        const existing = await UserModel.findOne({ email })
        if (existing) {
            return NextResponse.json(
                { error: 'Este email já está cadastrado' },
                { status: 409 }
            )
        }

        const hashed = await hashPassword(password)
        const verificationToken = generateVerificationToken()

        await UserModel.create({
            name,
            email,
            password: hashed,
            _verified: false,
            verificationToken,
        })

        await sendVerificationEmail(email, verificationToken).catch(console.error)

        return NextResponse.json(
            { message: 'Conta criada! Verifique seu email.' },
            { status: 201 }
        )
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
