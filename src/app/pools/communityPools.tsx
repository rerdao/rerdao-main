'use client'
import { Fragment, useMemo } from 'react'
import classNames from 'classnames'

import PoolRow from './poolRow'
import Empty from '@/components/empty'

import { ExtendedPoolData } from '@/hooks/pool.hook'
import solConfig from '@/configs/sol.config'

export type CommunityPoolsProps = {
  pools: ExtendedPoolData[]
}

export default function CommunityPools({ pools }: CommunityPoolsProps) {
  const communityPools = useMemo(
    () =>
      pools.filter(
        ({ authority }) =>
          !solConfig.operatorAddresses.includes(authority.toBase58()),
      ),
    [pools],
  )

  return (
    <Fragment>
      <thead>
        <tr className="bg-base-200">
          <th></th>
          <th></th>
          <th className="font-bold">COMMUNITY POOLS</th>
          <th>TVL</th>
          <th>Volume 24h</th>
          <th>Fee</th>
          <th>My Contribution</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {communityPools.map((pool, i) => (
          <PoolRow key={pool.address} index={i + 1} pool={pool} />
        ))}
        <tr className={classNames({ hidden: !!communityPools.length })}>
          <td colSpan={8}>
            <Empty />
          </td>
        </tr>
      </tbody>
    </Fragment>
  )
}
