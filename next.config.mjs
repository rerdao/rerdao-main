/** @type {import('next').NextConfig} */
import configMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

const withMDX = configMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
})

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  output: 'export',
  images: { unoptimized: true },
  webpack(config, {}) {
    // Fix Solana warning of "Module not found"
    // https://nextjs.org/docs/messages/module-not-found
    config.externals = config.externals.concat([
      'pino-pretty',
      'lokijs',
      'encoding',
    ])
    return config
  },
}

export default withMDX(nextConfig)
