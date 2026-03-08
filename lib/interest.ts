/**
 * Calculate simple interest
 * Formula: P * R * T / 100
 * where P = principal, R = annual rate, T = time in years
 */
export function calculateSimpleInterest(
    principal: number,
    annualRate: number,
    durationMonths: number
): number {
    const timeInYears = durationMonths / 12
    return principal * (annualRate / 100) * timeInYears
}

/**
 * Get maturity date from start date and duration in months
 */
export function getMaturityDate(startDate: Date, durationMonths: number): Date {
    const maturity = new Date(startDate)
    maturity.setMonth(maturity.getMonth() + durationMonths)
    return maturity
}

/**
 * Calculate days remaining until maturity
 */
export function getDaysRemaining(endDate: Date): number {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Calculate interest earned so far (based on elapsed time)
 */
export function calculateEarnedInterest(
    principal: number,
    annualRate: number,
    startDate: Date,
    endDate: Date
): number {
    const now = new Date()
    const start = startDate.getTime()
    const end = endDate.getTime()
    const current = Math.min(now.getTime(), end)

    const elapsedYears = (current - start) / (1000 * 60 * 60 * 24 * 365)
    return principal * (annualRate / 100) * elapsedYears
}
