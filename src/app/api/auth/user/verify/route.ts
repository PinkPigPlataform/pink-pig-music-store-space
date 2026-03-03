import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { generateUserToken } from '@/lib/user-auth'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_STORE_URL}/sign-in?error=invalid-token`
        )
    }

    await connectMongo()
    const user = await UserModel.findOne({ verificationToken: token }).select(
        '+verificationToken'
    )

    if (!user) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_STORE_URL}/sign-in?error=invalid-token`
        )
    }

    user._verified = true
    user.verificationToken = undefined
    await user.save()

    const jwtToken = generateUserToken(user._id.toString(), user.email)
    const response = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_STORE_URL}/?verified=1`
    )
    response.cookies.set('user-token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    })

    return response
}
