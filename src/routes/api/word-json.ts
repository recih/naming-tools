import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import type { ChineseCharacter } from '@/types'

const R2_KEY = 'chinese-xinhua/word.json'

export const getWordData = createServerFn().handler(async () => {
  const data = await env.WORD_DATA.get(R2_KEY)
  if (!data) {
    throw new Error('Word data not found in R2 bucket')
  }
  return (await data.json()) as ChineseCharacter[]
})

export const Route = createFileRoute('/api/word-json')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const result = await env.WORD_DATA.get(R2_KEY)
          if (!result) {
            return new Response('Word data not found', { status: 404 })
          }
          const res = new Response(result.body)
          res.headers.set('etag', result.httpEtag)
          result.writeHttpMetadata(res.headers)
          return res
        } catch (err) {
          // grab the R2 error code
          const [msg, code] = /\((\d+)\)$/.exec((err as Error).message) || []
          if (code === '10039') return new Response(msg, { status: 416 }) // range error
          if (code === '10020') return new Response(msg, { status: 400 }) // Invalid object name
          if (code === '10002') return new Response(msg, { status: 401 })
          if (code === '10003') return new Response(msg, { status: 403 })
          if (code === '10043') return new Response(msg, { status: 503 })
          return new Response((err as Error).message, { status: 500 })
        }
      },
    },
  },
})
