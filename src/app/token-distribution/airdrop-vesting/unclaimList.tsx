'use client'
import { useState } from 'react'
import { Leaf, MerkleDistributor, findReceipt } from '@sentre/utility'
import { useAsync } from 'react-use'
import dayjs from 'dayjs'
import { PublicKey } from '@solana/web3.js'

import Modal from '@/components/modal'
import { FileText } from 'lucide-react'
import { MintAmount } from '@/components/mint'

import {
  useGetMerkleMetadata,
  useReceiptByDistributorAddress,
  useUtility,
} from '@/hooks/airdrop.hook'
import { shortenAddress } from '@/helpers/utils'
import { useDistributors } from '@/providers/airdrop.provider'

type UnclaimListProps = {
  distributeAddress: string
}

const UnclaimList = ({ distributeAddress }: UnclaimListProps) => {
  const [open, setOpen] = useState(false)

  const receipts = useReceiptByDistributorAddress(distributeAddress)
  const { mint } = useDistributors()[distributeAddress]

  const getMetadata = useGetMerkleMetadata()
  const utility = useUtility()

  const { value: unclaimList } = useAsync(async () => {
    if (!utility || !receipts) return []
    const metadata = await getMetadata(distributeAddress)
    const root = MerkleDistributor.fromBuffer(Buffer.from(metadata.data))

    const result = await Promise.all(
      root.receipients.map(async (recipient) => {
        const receipt = await findReceipt(
          recipient.salt,
          new PublicKey(distributeAddress),
          recipient.authority,
          utility.program.programId,
        )
        if (!receipts[receipt.toBase58()]) return recipient
      }),
    )

    return result.filter((recipient) => !!recipient) as Leaf[]
  }, [receipts])

  return (
    <div className="tooltip" data-tip="Unclaimed list">
      <button onClick={() => setOpen(true)} className="btn btn-sm btn-ghost">
        <FileText className="h-4 w-4" />
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        <h5 className="mb-3">Unclaimed list</h5>
        <div className="mb-3 max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
          {!unclaimList || !unclaimList.length ? (
            <p className="p-3">All recipients have been claimed </p>
          ) : (
            <table className="table ">
              {/* head */}
              <thead>
                <tr>
                  <th>Wallet address</th>
                  <th>Amount</th>
                  <th>Unlock time</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {unclaimList?.map(({ amount, authority, startedAt }, i) => (
                  <tr key={i}>
                    <td>{shortenAddress(authority.toBase58())}</td>
                    <td>
                      <MintAmount
                        amount={amount}
                        mintAddress={mint.toBase58()}
                      />
                    </td>
                    <td>
                      {startedAt.isZero()
                        ? 'Immediately'
                        : dayjs(startedAt.toNumber() * 1000).format(
                            'DD/MM/YYYY, HH:mm',
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div onClick={() => setOpen(false)} className="btn">
          cancel
        </div>
      </Modal>
    </div>
  )
}

export default UnclaimList
