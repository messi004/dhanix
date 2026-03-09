import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const settings = await getSettings()
        return NextResponse.json({ settings })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
