import { NextRequest, NextResponse } from 'next/server';
import { processDeposits, processWithdrawals, processPoolMaturity } from '@/lib/cron-tasks';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    return handleCron(req);
}

export async function POST(req: NextRequest) {
    return handleCron(req);
}

async function handleCron(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const task = searchParams.get('task');
        const apiKey = req.headers.get('x-cron-key');

        // 1. Validate API Key
        if (!apiKey || apiKey !== process.env.CRON_SECRET) {
            console.warn('⚠️ [CRON] Unauthorized access attempt blocked.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Validate Task
        if (!task) {
            return NextResponse.json({ error: 'Missing task parameter' }, { status: 400 });
        }

        console.log(`🚀 [CRON] Starting task: ${task}`);

        let result;
        switch (task) {
            case 'deposit':
                result = await processDeposits();
                break;
            case 'withdrawal':
                result = await processWithdrawals();
                break;
            case 'pool':
                result = await processPoolMaturity();
                break;
            default:
                return NextResponse.json({ error: 'Invalid task type' }, { status: 400 });
        }

        console.log(`✅ [CRON] Task ${task} completed successfully.`);
        return NextResponse.json({ 
            success: true, 
            task, 
            data: result 
        });

    } catch (error: any) {
        console.error('❌ [CRON] Error:', error.message || error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal Server Error' 
        }, { status: 500 });
    }
}
