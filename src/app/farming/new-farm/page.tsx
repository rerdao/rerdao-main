'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { utils } from '@coral-xyz/anchor'
import { PublicKey } from '@metaplex-foundation/js'

import { ChevronLeft } from 'lucide-react'
import MintSelect from './mintSelect'
import AddReward, { EMPTY_REWARD } from './addReward'
import AddTime from './addTime'
import BoostNFT from './boostNFT'

import { BoostData, Reward, useInitializeFarm } from '@/hooks/farming.hook'
import { isAddress } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useMints } from '@/hooks/spl.hook'
import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import { decimalize } from '@/helpers/decimals'

export default function NewFarm() {
  const [loading, setLoading] = useState(false)
  const [mintFarm, setMintFarm] = useState('')
  const [tokenRewards, setTokenRewards] = useState<Reward[]>([EMPTY_REWARD])
  const [time, setTime] = useState({ startAt: Date.now(), endAt: 0 })
  const [boostsData, setBoostsData] = useState<BoostData[]>([])
  const { back, push } = useRouter()
  const { publicKey } = useWallet()
  const pushMessage = usePushMessage()

  const mints = useMints(tokenRewards.map(({ mintAddress }) => mintAddress))
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const accounts = useAllTokenAccounts()

  const initializeFarm = useInitializeFarm(
    mintFarm,
    time.startAt,
    time.endAt,
    boostsData,
    tokenRewards,
  )
  const onInitFarm = useCallback(async () => {
    try {
      setLoading(true)
      const { txId, farmAddress } = await initializeFarm()
      pushMessage(
        'alert-success',
        'Successfully add new Farm. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(txId || ''), '_blank'),
        },
      )
      push(`/farming/farm-details?farmAddress=${farmAddress}`)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [initializeFarm, push, pushMessage])

  const errorMsg = useMemo(() => {
    if (!publicKey) return 'Please connect wallet first!'
    if (!isAddress(mintFarm)) return 'Select input mint'

    for (const index in tokenRewards) {
      const { mintAddress, budget } = tokenRewards[index]
      if (!isAddress(mintAddress)) return 'Select reward mint'
      if (!Number(budget)) return 'Enter budget amount'
      const ata = utils.token.associatedAddress({
        mint: new PublicKey(mintAddress),
        owner: publicKey,
      })
      const { amount } = accounts[ata.toBase58()] || { amount: 0 }
      const dBudget = decimalize(budget, decimals[index])
      if (amount.lt(dBudget)) return 'Insufficient balance'
    }

    if (!Number(time.endAt)) return 'Select end time'

    for (const boost of boostsData) {
      if (!isAddress(boost.collection)) return 'Select NFT collection'
      if (!boost.percentage) return 'Enter NFT coefficient'
    }
  }, [
    publicKey,
    mintFarm,
    time.endAt,
    tokenRewards,
    accounts,
    decimals,
    boostsData,
  ])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full flex items-center justify-between">
        <button onClick={back} className="btn btn-circle btn-sm">
          <ChevronLeft />
        </button>
        <h5>New Farm</h5>
      </div>
      <div className="col-span-full mt-2">
        <MintSelect mintAddress={mintFarm} onMintAddress={setMintFarm} />
      </div>
      <div className="col-span-full">
        <AddReward rewards={tokenRewards} onRewards={setTokenRewards} />
      </div>
      <div className="col-span-full">
        <AddTime time={time} onTime={setTime} />
      </div>
      <div className="col-span-full">
        <BoostNFT boostsData={boostsData} onBoostsData={setBoostsData} />
      </div>
      <div className="col-span-full">
        <button
          disabled={!!errorMsg}
          onClick={onInitFarm}
          className="btn btn-primary btn-block"
        >
          {loading && <span className="loading loading-spinner loading-xs" />}
          {errorMsg ? errorMsg : 'Add'}
        </button>
      </div>
    </div>
  )
}
