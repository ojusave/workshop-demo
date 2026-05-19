import { Exa } from 'exa-js'
import type { SearchResult } from '../../shared/types.js'

function getExa(): Exa {
  const key = process.env.EXA_API_KEY
  if (!key) throw new Error('EXA_API_KEY is not set')
  return new Exa(key)
}

// 30% chance of throwing. This is the workshop demo mechanism.
// With 4 parallel searches, around 76% of v1 runs fail (1 - 0.7^4).
// In v2, Workflows retries each search up to 3 times, lifting per-run
// success rate to around 90%. Same flaky code, totally different outcome.
function maybeFail(query: string) {
  if (Math.random() < 0.3) {
    throw new Error(`Exa rate limit hit on query: "${query}"`)
  }
}

export async function searchOne(
  _topic: string,
  query: string,
  index: number
): Promise<SearchResult> {
  maybeFail(query)

  const response = await getExa().searchAndContents(query, {
    text: { maxCharacters: 2000 },
    numResults: 5,
    type: 'fast',
  })

  return {
    index,
    query,
    articles: response.results.map((r: (typeof response.results)[number]) => ({
      title: r.title ?? r.url,
      url: r.url,
      text: r.text ?? '',
      publishedDate: r.publishedDate,
    })),
  }
}
