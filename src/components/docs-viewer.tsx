'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Menu, X } from 'lucide-react'
import { appMeta } from '#/app-meta'
import { groupBySection, type Doc } from '#/features/docs/build-docs'

// The URL hash is the single source of truth for which doc is open, which means
// reading it has to survive server rendering: the server has no window, so
// reading it during render would emit the default doc on the server and the
// hashed doc on the client — different text, hydration failure. Deep-linking
// /docs#some-doc and refreshing hit exactly that.
//
// useSyncExternalStore exists for this: React renders getServerSnapshot on the
// server and again during hydration (so both agree), then immediately re-renders
// with the real hash. No state to keep in sync, and no setState in an effect
// (which `react-hooks/set-state-in-effect` rejects — the naive useEffect version
// of this fix fails lint).
function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash.replace(/^#/, '')
const getServerHash = () => ''

export function DocsViewer({ docs }: { docs: Doc[] }) {
  const sections = groupBySection(docs)
  const defaultId = sections[0]?.docs[0]?.id ?? docs[0]?.id ?? ''
  const hashId = useSyncExternalStore(subscribeToHash, getHash, getServerHash)
  const [navOpen, setNavOpen] = useState(false)

  const activeId = docs.some((d) => d.id === hashId) ? hashId : defaultId

  function select(id: string) {
    setNavOpen(false)
    // replaceState keeps a long docs-browsing session from filling the back
    // button, but it does not fire hashchange — so tell the store ourselves.
    window.history.replaceState(null, '', `#${id}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    window.scrollTo({ top: 0 })
  }

  const active = docs.find((d) => d.id === activeId) ?? docs[0]
  if (!active) {
    return (
      <main className="bg-bg text-text-muted flex min-h-screen items-center justify-center">
        No documents found.
      </main>
    )
  }

  const nav = (
    <nav className="flex flex-col gap-7">
      {sections.map(({ section, docs: items }) => (
        <div key={section} className="flex flex-col gap-0.5">
          <p className="text-text-faint mb-2 px-3 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
            {section}
          </p>
          {items.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => select(d.id)}
              className={`block w-full rounded-md px-3 py-1.5 text-left text-[13px] transition ${
                d.id === active.id
                  ? 'bg-surface-raised text-text font-medium'
                  : 'text-text-muted hover:text-text hover:bg-surface-sunken'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
      ))}
    </nav>
  )

  return (
    <main className="bg-bg text-text flex min-h-screen">
      <aside className="border-border bg-surface sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-y-auto border-r px-5 pt-9 pb-12 sm:block">
        <Link
          href="/"
          className="text-text-muted hover:text-accent mb-9 block px-3 font-mono text-xs tracking-tight transition-colors"
        >
          {appMeta.name}
        </Link>
        {nav}
      </aside>
      <div className="min-w-0 flex-1">
        <article className="mx-auto max-w-[760px] px-6 pt-12 pb-28 sm:px-10 sm:pt-20">
          <div className="mb-10 flex items-center gap-3 sm:hidden">
            <button
              type="button"
              aria-label="Open docs menu"
              onClick={() => setNavOpen(true)}
              className="border-border text-text-body rounded-md border p-2"
            >
              <Menu size={16} />
            </button>
            <span className="text-text text-sm font-medium">{active.title}</span>
          </div>
          <div className="prose compact">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.content}</ReactMarkdown>
          </div>
        </article>
      </div>
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 sm:hidden" onClick={() => setNavOpen(false)}>
          <div
            className="border-border bg-surface h-full w-72 max-w-[80%] overflow-y-auto border-r p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-text text-sm font-semibold">Docs</span>
              <button
                type="button"
                aria-label="Close docs menu"
                onClick={() => setNavOpen(false)}
                className="border-border text-text-body rounded-md border p-2"
              >
                <X size={16} />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </main>
  )
}
