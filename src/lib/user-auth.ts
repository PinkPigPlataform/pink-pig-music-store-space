import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET!

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export function generateUserToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyUserToken(
    token: string
): { id: string; email: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; email: string }
    } catch {
        return null
    }
}

export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

export function buildOAuthState(origin: string): string {
    const payload = JSON.stringify({
        nonce: crypto.randomBytes(16).toString('hex'),
        origin,
    })
    const encoded = Buffer.from(payload).toString('base64url')
    const sig = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(encoded)
        .digest('hex')
    return `${encoded}.${sig}`
}

export function verifyOAuthState(
    state: string
): { nonce: string; origin: string } | null {
    try {
        const dotIndex = state.lastIndexOf('.')
        if (dotIndex === -1) return null
        const encoded = state.slice(0, dotIndex)
        const sig = state.slice(dotIndex + 1)
        const expected = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(encoded)
            .digest('hex')
        if (sig !== expected) return null
        return JSON.parse(Buffer.from(encoded, 'base64url').toString())
    } catch {
        return null
    }
}
