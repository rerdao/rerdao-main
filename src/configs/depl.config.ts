import { Env, env } from './env'

/**
 * Contructor
 */
type Conf = {
  host: string
  maintaining: boolean
  notionDatabaseId: string
  youtubeTokenAPI: string
  twitterTokenAPI: string
  telegramTokenAPI: string
}

const conf: Record<Env, Conf> = {
  /**
   * Development configurations
   */
  development: {
    host: 'http://localhost:3000',
    maintaining: process.env.NEXT_PUBLIC_MAINTAINING === 'true' || false,
    notionDatabaseId: process.env.NOTION_DATABASE_ID || '',
    youtubeTokenAPI: process.env.YOUTUBE_TOKEN_API || '',
    twitterTokenAPI: process.env.TWITTER_TOKEN_API || '',
    telegramTokenAPI: process.env.TELEGRAM_TOKEN_API || '',
  },

  /**
   * Production configurations
   */
  production: {
    host: process.env.DOMAIN || '',
    maintaining: process.env.NEXT_PUBLIC_MAINTAINING === 'true' || false,
    notionDatabaseId: process.env.NOTION_DATABASE_ID || '',
    youtubeTokenAPI: process.env.YOUTUBE_TOKEN_API || '',
    twitterTokenAPI: process.env.TWITTER_TOKEN_API || '',
    telegramTokenAPI: process.env.TELEGRAM_TOKEN_API || '',
  },
}

/**
 * Module exports
 */
export default conf[env]
