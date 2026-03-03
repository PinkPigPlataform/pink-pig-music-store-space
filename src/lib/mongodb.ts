import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI must be defined in environment variables')
}

interface MongooseCache {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined
}

let cached = global.mongoose ?? { conn: null, promise: null }
global.mongoose = cached

export async function connectMongo(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME,
            bufferCommands: false,
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}
