import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'

export async function POST(request: Request): Promise<NextResponse> {
    const { session, response } = await requireAdmin()
    if (response) return response

    const body = (await request.json()) as HandleUploadBody

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    tokenPayload: JSON.stringify({
                        userId: session?.user?.id,
                    }),
                }
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Log only; database record is created by client call to POST /api/admin/files
                console.log('Upload completed:', blob, tokenPayload)
            },
        })

        return NextResponse.json(jsonResponse)
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        )
    }
}
