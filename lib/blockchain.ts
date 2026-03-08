import { ethers } from 'ethers'

const USDT_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
]

export function getProvider(): ethers.providers.JsonRpcProvider {
    const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
    return new ethers.providers.JsonRpcProvider(rpcUrl)
}

export function getUSDTContract(signerOrProvider?: ethers.Signer | ethers.providers.Provider) {
    const contractAddress = process.env.USDT_CONTRACT_ADDRESS || ''
    const provider = signerOrProvider || getProvider()
    return new ethers.Contract(contractAddress, USDT_ABI, provider)
}

export function generateDepositAddress(index: number): { address: string; privateKey: string } {
    const seed = process.env.HD_WALLET_SEED
    if (!seed) {
        // For development, generate a random wallet
        const wallet = ethers.Wallet.createRandom()
        return { address: wallet.address, privateKey: wallet.privateKey }
    }

    const hdNode = ethers.utils.HDNode.fromMnemonic(seed)
    // BIP44 path: m/44'/60'/0'/0/index
    const path = `m/44'/60'/0'/0/${index}`
    const child = hdNode.derivePath(path)
    return { address: child.address, privateKey: child.privateKey }
}

export async function sendUSDT(
    toAddress: string,
    amount: string
): Promise<{ txHash: string } | { error: string }> {
    try {
        const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY
        if (!privateKey) {
            return { error: 'Main wallet private key not configured' }
        }

        const provider = getProvider()
        const wallet = new ethers.Wallet(privateKey, provider)
        const contract = getUSDTContract(wallet)

        const decimals = await contract.decimals()
        const amountWei = ethers.utils.parseUnits(amount, decimals)

        const tx = await contract.transfer(toAddress, amountWei)
        const receipt = await tx.wait()

        return { txHash: receipt.transactionHash }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { error: message }
    }
}

export async function getUSDTBalance(address: string): Promise<string> {
    try {
        const contract = getUSDTContract()
        const balance = await contract.balanceOf(address)
        const decimals = await contract.decimals()
        return ethers.utils.formatUnits(balance, decimals)
    } catch {
        return '0'
    }
}
