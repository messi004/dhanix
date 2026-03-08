import prisma from './prisma'

export const DEFAULT_SETTINGS: Record<string, string> = {
    min_deposit: '10',
    max_deposit: '1000',
    min_withdraw: '10',
    max_withdraw: '1000',
    withdraw_per_day: '1',
    min_stake: '10',
    max_stake: '1000',
    interest_rate: '12',
    min_pool_duration_months: '1',
    referral_percentage: '2',
    welcome_bonus_percentage: '1',
    network_mode: 'mainnet',
}

export async function getSetting(key: string): Promise<string> {
    const setting = await prisma.settings.findUnique({ where: { key } })
    return setting?.value || DEFAULT_SETTINGS[key] || '0'
}

export async function getSettings(): Promise<Record<string, string>> {
    const settings = await prisma.settings.findMany()
    const result = { ...DEFAULT_SETTINGS }
    settings.forEach((s) => {
        result[s.key] = s.value
    })
    return result
}

export async function updateSetting(key: string, value: string): Promise<void> {
    await prisma.settings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    })
}
