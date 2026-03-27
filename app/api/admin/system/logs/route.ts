import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'out'; // 'out' or 'error'
    const limit = searchParams.get('limit') || '100';

    try {
        // Get PM2 List to find log paths
        const { stdout: jlist } = await execAsync('pm2 jlist');
        const processes = JSON.parse(jlist);
        const cronJob = processes.find((p: any) => p.name.includes('cron'));

        if (!cronJob) {
            return NextResponse.json({ status: 'error', message: 'Cron job process not found' }, { status: 404 });
        }

        const logPath = type === 'error' 
            ? cronJob.pm2_env.pm_err_log_path 
            : cronJob.pm2_env.pm_out_log_path;

        if (!logPath) {
            return NextResponse.json({ status: 'error', message: 'Log path not found' }, { status: 404 });
        }

        // Read last N lines
        const { stdout: logs } = await execAsync(`tail -n ${limit} ${logPath}`);

        return NextResponse.json({
            status: 'success',
            data: {
                logs: logs.split('\n'),
                type,
                path: logPath
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}
