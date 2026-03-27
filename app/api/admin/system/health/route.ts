import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export async function GET() {
    try {
        // 1. Check Database Status
        let dbStatus = 'OFFLINE';
        try {
            await prisma.$queryRaw`SELECT 1`;
            dbStatus = 'ONLINE';
        } catch (error) {
            console.error('Database Health Check Failed:', error);
        }

        // 2. Get PM2 Process Info
        let pm2Output = [];
        try {
            const { stdout } = await execAsync('pm2 jlist');
            pm2Output = JSON.parse(stdout);
        } catch (error) {
            console.error('PM2 Connectivity Failed:', error);
        }

        // 3. System Metrics
        const systemMetrics = {
            uptime: os.uptime(),
            platform: os.platform(),
            arch: os.arch(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            loadAverage: os.loadavg(),
            nodeVersion: process.version,
        };

        // 4. Format Cron Job Status
        const cronJobs = pm2Output
            .filter((p: any) => p.name.includes('cron'))
            .map((p: any) => ({
                id: p.pm_id,
                name: p.name,
                status: p.pm2_env.status,
                cpu: p.monit.cpu,
                memory: p.monit.memory,
                uptime: Math.floor((Date.now() - p.pm2_env.pm_uptime) / 1000),
                restarts: p.pm2_env.restart_time,
            }));

        return NextResponse.json({
            status: 'success',
            data: {
                database: dbStatus,
                system: systemMetrics,
                cronJobs: cronJobs,
                allProcesses: pm2Output.map((p: any) => ({
                    id: p.pm_id,
                    name: p.name,
                    status: p.pm2_env.status,
                })),
                timestamp: new Date().toISOString(),
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}
