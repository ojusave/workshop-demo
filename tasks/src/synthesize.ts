import Anthropic from '@anthropic-ai/sdk'
import type { SearchResult } from '../../shared/types.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function synthesize(
  query: string,
  results: SearchResult[]
): Promise<string> {
  const sources = results
    .flatMap((r) => r.articles)
    .map((a, i) => `[${i + 1}] ${a.title}\n${a.url}\n${a.text}`)
    .join('\n\n---\n\n')

  const prompt = `Write a research memo on the following topic for an individual investor.

Topic: ${query}

Use this exact markdown structure:

# Research Memo

## Snapshot
Extract these from the sources. If a value is not in the sources, write "N/A". Do not invent numbers.
- **Current price:** $X.XX (Y% today)
- **Market cap:** $X
- **P/E (trailing):** X
- **52-week range:** $X to $Y
- **Analyst target:** $X (N analysts)
- **Consensus rating:** Buy / Hold / Sell

## Summary
Two or three sentences. Lead with the most material point.

## Bull Case
Three bullets. Each one sentence. Cite sources inline with [N].

## Bear Case
Three bullets. Each one sentence. Cite sources inline with [N].

## Analyst Consensus
One paragraph. Reference the analyst target and rating from the Snapshot. Add color from any analyst commentary in the sources.

## Recent News
Two short paragraphs covering the most material recent developments. Cite specific dates and figures from sources.

## Competitive Position
One paragraph on market position and key peers.

## Sources
Numbered list of sources actually cited above. Format: [N] Title (URL)

Rules:
- Terse, analytical tone. No marketing language. No phrases like "it is important to note."
- Do not invent numbers or dates. If a value is not in the sources, say "N/A".
- If sources conflict, note the conflict.
- Never use em dashes. Use colons instead.
- This is NOT investment advice. Do not say buy/sell/hold yourself, only report what analysts said.

Sources:

${sources}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Expected text response')
  return block.text
}
