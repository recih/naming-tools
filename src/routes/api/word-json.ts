import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/word-json')({
  server: {
    handlers: {
      GET: async ({ context }) => {
        // Get R2 binding from context
        const env = context.cloudflare?.env
        if (!env?.WORD_DATA) {
          return new Response('R2 bucket not configured', { status: 500 })
        }

        // Fetch from R2
        const object = await env.WORD_DATA.get('word.json')
        if (!object) {
          return new Response('File not found', { status: 404 })
        }

        // Return with aggressive caching headers
        return new Response(object.body, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        })
      },
    },
  },
})
