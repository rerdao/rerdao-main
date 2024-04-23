import axios from 'axios'

import deplConfig from '@/configs/depl.config'

export const DATA_SOCIAL = [
  { name: 'twitter', numInteraction: () => getFollowsTwitter() },
  { name: 'telegram', numInteraction: () => getJoinersTelegram() },
  { name: 'youtube', numInteraction: () => getSubYoutube() },
  { name: 'github', numInteraction: () => getRepoGithub() },
  { name: 'discord', numInteraction: () => getJoinersDiscord() },
]

export const getNumInteractSocials = (socialName: string) => {
  for (const social of DATA_SOCIAL) {
    if (social.name === socialName) {
      return social.numInteraction()
    }
  }
  return null
}

const getSubYoutube = async () => {
  try {
    const youtubeTokenAPI = deplConfig.youtubeTokenAPI
    const youtubeUser = 'UC7P7lwc-6sLEr0yLzWfFUyg'
    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeUser}&key=${youtubeTokenAPI}`,
    )
    const subYtb = parseInt(data['items'][0].statistics.subscriberCount)

    return subYtb
  } catch {
    return 0
  }
}

const getFollowsTwitter = async () => {
  try {
    const twitterTokenAPI = deplConfig.twitterTokenAPI
    const twitterUser = 'SentreProtocol'
    const { data } = await axios.get(
      `https://api.twitter.com/1.1/users/show.json?screen_name=${twitterUser}`,
      {
        headers: {
          Authorization: 'Bearer ' + twitterTokenAPI,
        },
      },
    )
    const followers = data.followers_count

    return followers
  } catch {
    return 0
  }
}

const getJoinersTelegram = async () => {
  try {
    const telegramTokenAPI = deplConfig.telegramTokenAPI
    const telegramUser = '@SentreAnnouncements'
    const { data } = await axios.get(
      `https://api.telegram.org/bot${telegramTokenAPI}/getChatMembersCount?chat_id=${telegramUser}`,
    )
    const joiners = data.result

    return joiners
  } catch {
    return 0
  }
}

const getJoinersDiscord = async () => {
  try {
    const discordID = 'VD7UBAp2HN'
    const { data } = await axios.get(
      `https://discord.com/api/v9/invites/${discordID}?with_counts=true&with_expiration=true`,
    )
    const joiners = data.approximate_member_count

    return joiners
  } catch {
    return 0
  }
}

const getRepoGithub = async () => {
  try {
    const githubUser = 'DescartesNetwork'
    const { data } = await axios.get(
      `https://api.github.com/users/${githubUser}`,
    )
    const repositories = data.public_repos

    return repositories
  } catch {
    return 0
  }
}
