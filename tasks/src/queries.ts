export function buildQueries(query: string): string[] {
  const q = query.trim()
  return [
    `${q} overview key facts`,
    `${q} recent news and developments`,
    `${q} expert analysis and commentary`,
    `${q} risks challenges and counterarguments`,
  ]
}
