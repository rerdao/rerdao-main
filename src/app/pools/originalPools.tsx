'use client'
import { Fragment, useMemo } from 'react'
import classNames from 'classnames'

import { BadgeCheck } from 'lucide-react'
import PoolRow from './poolRow'
import Empty from '@/components/empty'

import { ExtendedPoolData } from '@/hooks/pool.hook'
import solConfig from '@/configs/sol.config'

export type OriginalPoolsProps = {
  pools: ExtendedPoolData[]
}

export default function OriginalPools({ pools }: OriginalPoolsProps) {
  const originalPools = useMemo(
    () =>
      pools.filter(({ authority }) =>
        solConfig.operatorAddresses.includes(authority.toBase58()),
      ),
    [pools],
  )

  return (
    <Fragment>
      <thead>
        <tr className="bg-base-200">
          <th className="text-accent flex flex-row justify-center">
            <BadgeCheck className="w-4 h-5" />
          </th>
          <th></th>
          <th className="text-accent font-bold">ORIGINAL POOLS</th>
          <th>TVL</th>
          <th>Volume 24h</th>
          <th>Fee</th>
          <th>My Contribution</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {originalPools.map((pool, i) => (
          <PoolRow key={pool.address} index={i + 1} pool={pool} />
        ))}
        <tr className={classNames({ hidden: !!originalPools.length })}>
          <td colSpan={8}>
            <Empty />
          </td>
        </tr>
      </tbody>
    </Fragment>
  )
}
