import { buildQueries } from './queries.js'
import { searchOne } from './search.js'
import { synthesize } from './synthesize.js'
import type { ResearchEvent } from '../../shared/types.js'

export async function research(
  query: string,
  onEvent: (e: ResearchEvent) => void
): Promise<string> {
  const searches = buildQueries(query)
  onEvent({ type: 'started', query, queries: searches })

  const results = await Promise.all(
    searches.map(async (searchQuery, index) => {
      onEvent({ type: 'search:running', index })
      try {
        const result = await searchOne(query, searchQuery, index)
        onEvent({ type: 'search:done', index, articleCount: result.articles.length })
        return result
      } catch (err) {
        onEvent({ type: 'search:failed', index, error: String(err) })
        throw err
      }
    })
  )

  onEvent({ type: 'synthesizing' })
  const memo = await synthesize(query, results)
  onEvent({ type: 'done', memo })
  return memo
}
