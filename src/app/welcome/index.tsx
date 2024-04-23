'use client'
import Description from './description'
import ListApp from './listApp'
import ListPartner from './listPartner'
import ListSocial from './listSocial'
import Banner from './banner'

import './index.scss'

export default function Welcome() {
  return (
    <div className="welcome-container no-scrollbar overflow-x-hidden">
      <section className="absolute top-0 left-0 w-full z-10 p-2">
        <p className="bg-teal-300 rounded-box px-4 py-2 w-full text-center text-black">
          RER DAO is rewarding early adopters with an exciting airdrop! Stay tuned for more groundbreaking features to come.
        </p>
      </section>
      <section className="w-full">
        <Banner />
      </section>
      <section className="w-full">
        <Description />
      </section>
      <section className="w-full">
        <ListApp />
      </section>
      <section className="w-full">
        <ListPartner />
      </section>
      <section className="w-full">
        <ListSocial />
      </section>
      <section className="pos-center p-6">
        <p className="opacity-60 text-black">
          RER DAO © 2024, All Rights Reserved.
        </p>
      </section>
    </div>
  )
}
