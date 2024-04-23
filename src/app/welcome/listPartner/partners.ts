'use client'

import {
  gateSvg,
  jupiterDarkSvg,
  jupiterLightSvg,
  logoNDavdarkPng,
  logoNDavlightPng,
  logoSolSvg,
  logoSolDarkSvg,
  solendLight,
  solendDark,
  superteamDark,
  superteamLight,
} from '@/static/images/welcome/partners'

type ListPartnerProps = {
  description: string
  logoLight: string
  logoDark: string
}[]

export const LIST_PARTNER: ListPartnerProps = [
  {
    description:
      'Solana is a decentralized blockchain built to enable scalable, user-friendly apps for the world.',
    logoLight: logoSolSvg,
    logoDark: logoSolDarkSvg,
  },
  {
    description:
      'Superteam Philippines is a community of founders, builders and creative artists in Philippine.',
    logoLight: superteamLight,
    logoDark: superteamDark,
  },
  {
    description:
      'NFT Davao brought local artist into life',
    logoLight: logoNDavlightPng,
    logoDark: logoNDavdarkPng,
  },
  {
    description:
      'Waste2Earn helps community create a better way to managed waste.',
    logoLight: jupiterLightSvg,
    logoDark: jupiterDarkSvg,
  },
  {
    description:
      'Your Gateway to Crypto. Trade over 1,400 cryptocurrencies safely, quickly, and easily.',
    logoLight: gateSvg,
    logoDark: gateSvg,
  },
  {
    description:
      'Solend is the autonomous interest rate machine for lending on Solana.',
    logoLight: solendLight,
    logoDark: solendDark,
  }
  
]
