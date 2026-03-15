import { 
    createPublicClient, 
    createWalletClient, 
    http, 
    parseAbi, 
    formatUnits, 
    parseUnits,
    type Address,
} from 'viem'
import { bsc } from 'viem/chains'
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts'

const USDT_ABI = parseAbi([
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
])

const RPC_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
const USDT_ADDRESS = (process.env.USDT_CONTRACT_ADDRESS || '') as Address

export const publicClient = createPublicClient({
    chain: bsc,
    transport: http(RPC_URL)
})

export function generateDepositAddress(index: number): { address: string; privateKey: string } {
    const seed = process.env.HD_WALLET_SEED
    if (!seed) {
        // Fallback for development (not recommended for production)
        const account = privateKeyToAccount(`0x${'a'.repeat(64)}`) // Placeholder
        return { address: account.address, privateKey: account.publicKey }
    }

    const account = mnemonicToAccount(seed, {
        addressIndex: index,
        // Standard BIP44 path for BSC/ETH is m/44'/60'/0'/0/index
    })
    
    // Note: viem's mnemonicToAccount doesn't easily expose the private key directly without extra steps
    // But we need it for later. 
    // In production, you'd usually store the account object or derive as needed.
    return { address: account.address, privateKey: 'RE-DERIVE-ON-DEMAND' }
}

export async function sendUSDT(
    toAddress: string,
    amount: string
): Promise<{ txHash: string } | { error: string }> {
    try {
        const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY as `0x${string}`
        if (!privateKey) {
            return { error: 'Main wallet private key not configured' }
        }

        const account = privateKeyToAccount(privateKey)
        const walletClient = createWalletClient({
            account,
            chain: bsc,
            transport: http(RPC_URL)
        })

        const decimals = await publicClient.readContract({
            address: USDT_ADDRESS,
            abi: USDT_ABI,
            functionName: 'decimals',
        })

        const { request } = await publicClient.simulateContract({
            account,
            address: USDT_ADDRESS,
            abi: USDT_ABI,
            functionName: 'transfer',
            args: [toAddress as Address, parseUnits(amount, decimals)],
        })

        const hash = await walletClient.writeContract(request)
        return { txHash: hash }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { error: message }
    }
}

export async function getUSDTBalance(address: string): Promise<string> {
    try {
        const decimals = await publicClient.readContract({
            address: USDT_ADDRESS,
            abi: USDT_ABI,
            functionName: 'decimals',
        })

        const balance = await publicClient.readContract({
            address: USDT_ADDRESS,
            abi: USDT_ABI,
            functionName: 'balanceOf',
            args: [address as Address],
        })

        return formatUnits(balance, decimals)
    } catch (error) {
        console.error('Balance check error:', error)
        return '0'
    }
}
