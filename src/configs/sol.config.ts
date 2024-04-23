import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { DEFAULT_SEN_UTILITY_PROGRAM_ID } from '@sentre/utility'

import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  rpc: string
  statRpc: string
  bundlStorage: string
  network: WalletAdapterNetwork
  senswapAddress: string
  senFarmingProgram: string
  utilityProgram: string
  taxman: string
  fee: number
  operatorAddresses: string[]
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    // rpc: 'https://api.devnet.solana.com',
    // network: WalletAdapterNetwork.Devnet,
    // senswapAddress: '6SRa2Kc3G4wTG319G4Se6yrRWeS1A1Hj79BC3o7X9v6T',
    // senFarmingProgram: '6LaxnmWdYUAJvBJ4a1R8rrsvCRtaY7b43zKiNAU2k3Nx',
    // utilityProgram: 'AKTU61s8NJ8zJATQiceREdhXbedRnKrd1BVgnCuxmD2F',
    // bundlStorage: 'https://devnet.bundlr.network',
    rpc: 'https://mainnet.helius-rpc.com/?api-key=bd09eeb3-31c2-4466-ab34-57cb8b9f1b69',
    network: WalletAdapterNetwork.Mainnet,
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    utilityProgram: DEFAULT_SEN_UTILITY_PROGRAM_ID,
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 6, // lamports
    statRpc: 'https://stat.sentre.io/',
    bundlStorage: 'https://node1.bundlr.network',
    operatorAddresses: ['8W6QginLcAydYyMYjxuyKQN56NzeakDE3aRFrAmocS6D'],
  },

  /**
   * Production configurations
   */
  production: {
    rpc: 'https://solitary-autumn-water.solana-mainnet.quiknode.pro/05b03a0cfeb8a5ec38f4c55950eb9b9bad7c8b58/',
    network: WalletAdapterNetwork.Mainnet,
    senswapAddress: 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag',
    senFarmingProgram: 'E6Vc9wipgm8fMXHEYwgN7gYdDbyvpPBUiTNy67zPKuF4',
    utilityProgram: DEFAULT_SEN_UTILITY_PROGRAM_ID,
    taxman: '9doo2HZQEmh2NgfT3Yx12M89aoBheycYqH1eaR5gKb3e',
    fee: 10 ** 5, // lamports
    statRpc: 'https://stat.sentre.io/',
    bundlStorage: 'https://node1.bundlr.network',
    operatorAddresses: ['8W6QginLcAydYyMYjxuyKQN56NzeakDE3aRFrAmocS6D'],
  },
}

/**
 * Module exports
 */
export default conf[env]
