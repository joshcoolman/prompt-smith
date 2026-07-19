export type Doc = { id: string; title: string; section: string; order: number; content: string }

const SECTION_ORDER = ['Start here', 'Knowledge', 'Working notes']

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function slugify(path: string): string {
  return path
    .replace(/^\//, '')
    .replace(/\.md$/i, '')
    .replace(/\//g, '-')
    .toLowerCase()
}

function parseOrder(base: string): { order: number; name: string } {
  const m = base.match(/^(\d+)[-_.]\s*(.+)$/)
  return m ? { order: parseInt(m[1]!, 10), name: m[2]! } : { order: Infinity, name: base }
}

function sectionFor(path: string): string {
  if (path.startsWith('/knowledge/')) return 'Knowledge'
  if (path === '/CLAUDE.md') return 'Working notes'
  if (path === '/README.md' || path.startsWith('/docs/')) return 'Start here'
  return 'Working notes'
}

function classify(path: string): Omit<Doc, 'content'> {
  const segs = path.split('/')
  const base = segs.pop()!.replace(/\.md$/i, '')
  const { order, name } = parseOrder(base)
  const title = /^(README|CLAUDE)$/i.test(name) ? name : titleCase(name.replace(/-/g, ' '))
  return { id: slugify([...segs, name].join('/')), section: sectionFor(path), title, order }
}

export function buildDocs(raw: Record<string, string>): Doc[] {
  return Object.entries(raw)
    .map(([path, content]) => ({ content, ...classify(path) }))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function groupBySection(docs: Doc[]): { section: string; docs: Doc[] }[] {
  const bySection = new Map<string, Doc[]>()
  for (const d of docs) {
    const list = bySection.get(d.section) ?? []
    list.push(d)
    bySection.set(d.section, list)
  }
  return SECTION_ORDER.filter((s) => bySection.has(s)).map((section) => ({
    section,
    docs: bySection.get(section) ?? [],
  }))
}
