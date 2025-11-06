import { env } from 'cloudflare:workers';
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import type { ChineseCharacter } from '@/types';

export const getWordData = createServerFn().handler(async () => {
  const data = await env.WORD_DATA.get('chinese-xinhua/word.json');
  if (!data) {
    throw new Error('Word data not found in R2 bucket');
  }
  return await data.json() as ChineseCharacter[];
});

export const getWordDataRaw = createServerFn().handler(async () => {
  const data = await env.WORD_DATA.get('chinese-xinhua/word.json');
  if (!data) {
    throw new Error('Word data not found in R2 bucket');
  }
  return await data.text();
})

export const Route = createFileRoute('/api/word-json')({
  server: {
    handlers: {
      GET: async () => {
        const wordData = await getWordDataRaw();
        return new Response(wordData, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=31536000, immutable', // 1 year caching
          },
        });
      },
    },
  }
});
