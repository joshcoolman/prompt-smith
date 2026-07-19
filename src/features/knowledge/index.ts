import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import 'server-only'

export function getKnowledge(name: string): string {
  try {
    return readFileSync(join(process.cwd(), 'knowledge', `${name}.md`), 'utf-8')
  } catch {
    return ''
  }
}
