import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildDocs } from '#/features/docs/build-docs'
import { DocsViewer } from '#/components/docs-viewer'
import 'server-only'

function readIfExists(path: string): string | null {
  return existsSync(path) ? readFileSync(path, 'utf-8') : null
}

function readMarkdownDir(dirName: string): Record<string, string> {
  const root = join(process.cwd(), dirName)
  if (!existsSync(root)) return {}
  const entries: Record<string, string> = {}
  for (const file of readdirSync(root, { recursive: true }) as string[]) {
    if (!file.endsWith('.md')) continue
    entries[`/${dirName}/${file}`] = readFileSync(join(root, file), 'utf-8')
  }
  return entries
}

export default function DocsPage() {
  const raw: Record<string, string> = {}

  const readme = readIfExists(join(process.cwd(), 'README.md'))
  if (readme) raw['/README.md'] = readme

  const claude = readIfExists(join(process.cwd(), 'CLAUDE.md'))
  if (claude) raw['/CLAUDE.md'] = claude

  Object.assign(raw, readMarkdownDir('docs'))
  Object.assign(raw, readMarkdownDir('knowledge'))

  return <DocsViewer docs={buildDocs(raw)} />
}
