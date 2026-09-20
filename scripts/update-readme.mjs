import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import ws from 'ws'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const README_PATH = process.env.README_PATH || 'README.md'
const SITE_URL = (process.env.SITE_URL || 'https://ricehubx.vercel.app').replace(/\/$/, '')

const DESC_MAX = 280
const LABEL_MAX = 80
const OTHER = 'Other'

const START_MARKER = '<!-- RICES:START -->'
const END_MARKER = '<!-- RICES:END -->'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_KEY (or VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: { transport: ws },
})

async function fetchRices() {
  const { data, error } = await supabase
    .from('rices')
    .select('title, slug, author, github_url, wm, distro, description, thumbnail_url, image_url')
    .eq('status', 'approved')

  if (error) throw error
  return data
}

// Explicit locale: the default follows the OS (LANG=C sorts "Hyprland" before "bspwm").
const compare = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), 'en')
const otherLast = (a, b) => (a === OTHER) - (b === OTHER) || compare(a, b)

function groupByWm(rices) {
  const grouped = {}
  for (const rice of rices) (grouped[rice.wm || OTHER] ??= []).push(rice)
  return grouped
}

// User-submitted text is untrusted: everything that reaches the README goes through escapeHtml
// (HTML context) or escapeMd (markdown headings), links must be https, and whitespace is
// flattened so nothing can break out of its block.
const flatten = (text) => String(text).replace(/\s+/g, ' ').trim()
const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)
const escapeMd = (text) => text.replace(/[!-/:-@[-`{-~]/g, '\\$&')
const escapeHtml = (text) =>
  flatten(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function httpsUrl(url) {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

function repoNameFromUrl(url) {
  try {
    return new URL(url).pathname.replace(/^\/|\/$/g, '').split('/').slice(0, 2).join('/')
  } catch {
    return url
  }
}

// GitHub's heading ids: lowercase, drop punctuation, spaces to hyphens, repeats get -1, -2...
// Must be called once per heading, in document order.
function headingIds() {
  const seen = new Map()
  return (text) => {
    const base = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N} _-]/gu, '').replace(/ /g, '-')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

// Shown, in italics, when a submission has no description. Deterministic per rice so the
// README never changes between runs unless the data does.
const BIOS = [
  (desk) =>
    `${desk}. The repository gathers the configuration files, themes and helper scripts behind this setup, so you can see how every piece fits together, borrow the parts you like or adapt the whole thing to your own machine.`,
  (desk) =>
    `Dotfiles for the ${desk}. Inside you will find the configs that shape the look and the workflow shown in the screenshot, a good starting point to study, remix and make your own.`,
  (desk) =>
    `Explore the ${desk}. Browse the repository to see the configuration, colors and small tweaks behind the screenshot, and pick up ideas for your own setup.`,
]

function fallbackBio(rice) {
  const seed = [...(rice.slug || rice.title || '')].reduce((h, c) => (h * 31 + c.codePointAt(0)) | 0, 0)
  const desk = `${rice.wm || 'Linux'} desktop${rice.distro ? ` running on ${rice.distro}` : ''}`
  return BIOS[Math.abs(seed) % BIOS.length](desk)
}

// What the index and the heading call a rice: its author, else the owner of its repo, else its title.
function authorOf(rice) {
  const author = flatten(rice.author ?? '')
  const repo = httpsUrl(rice.github_url)
  const owner = repo && repoNameFromUrl(repo).split('/')[0]
  return (author.toLowerCase() !== 'anonymous' && author) || owner || flatten(rice.title ?? '') || 'Untitled'
}

// One rice = a heading with its author (so the index can jump to it), the title with "View repo",
// the description, then the screenshot at full width. Plain blocks, no tables, so any screen can scale it.
function renderRice(rice, label) {
  const repo = httpsUrl(rice.github_url)
  const page = rice.slug ? `${SITE_URL}/rice/${encodeURIComponent(rice.slug)}` : null
  const image = httpsUrl(rice.thumbnail_url) ?? httpsUrl(rice.image_url)

  const title = flatten(rice.title ?? '')
  const top = [
    title && title !== label && `<b>${escapeHtml(title)}</b>`,
    repo && `<a href="${escapeHtml(repo)}">View repo</a>`,
  ].filter(Boolean)

  const description = flatten(rice.description ?? '')
  const bio = description ? escapeHtml(clip(description, DESC_MAX)) : `<i>${escapeHtml(fallbackBio(rice))}</i>`
  const img = image && `<img src="${escapeHtml(image)}" width="100%" alt="${escapeHtml(label)}">`

  return [
    `### ${escapeMd(label)}`,
    top.length > 0 && `<p>${top.join(' · ')}</p>`,
    `<p>${bio}</p>`,
    img && `<p>${page ? `<a href="${escapeHtml(page)}">${img}</a>` : img}</p>`,
    '',
  ].filter((line) => line !== false && line !== null).join('\n')
}

// Labels for one window manager's rices, sorted; an author who appears twice gets the title added.
function labelRices(rices) {
  const names = rices.map((rice) => clip(authorOf(rice), LABEL_MAX))
  const taken = (name) => names.filter((n) => n.toLowerCase() === name.toLowerCase()).length
  return rices
    .map((rice, i) => ({
      rice,
      label: taken(names[i]) > 1 ? clip(`${names[i]} — ${flatten(rice.title ?? '')}`, LABEL_MAX) : names[i],
    }))
    .sort((a, b) => compare(a.label, b.label) || compare(a.rice.slug, b.rice.slug))
}

function renderMarkdown(rices) {
  const grouped = groupByWm(rices)
  const nextId = headingIds()

  // Ids are assigned in the same order the headings are written below.
  const sections = Object.keys(grouped).sort(otherLast).map((wm) => ({
    wm,
    id: nextId(flatten(wm)),
    items: labelRices(grouped[wm]).map((item) => ({ ...item, id: nextId(item.label) })),
  }))

  const windowManagers = sections.filter((s) => s.wm !== OTHER).length
  const link = (id, text) => `<a href="#${escapeHtml(id)}">${escapeHtml(text)}</a>`

  return [
    `<p align="center"><b>${rices.length}</b> setups · <b>${windowManagers}</b> window managers</p>`,
    '',
    '<ul>',
    ...sections.flatMap(({ wm, id, items }) => [
      `<li>${link(id, wm)}`,
      '<ul>',
      ...items.map((item) => `<li>${link(item.id, item.label)}</li>`),
      '</ul>',
      '</li>',
    ]),
    '</ul>',
    '',
    ...sections.flatMap(({ wm, items }) => [
      `## ${escapeMd(flatten(wm))}`,
      '',
      ...items.map(({ rice, label }) => renderRice(rice, label)),
    ]),
  ].join('\n').trim()
}

function updateReadme(markdown) {
  const readme = readFileSync(README_PATH, 'utf-8')

  if (!readme.includes(START_MARKER) || !readme.includes(END_MARKER)) {
    console.error(`README is missing ${START_MARKER} / ${END_MARKER} markers.`)
    process.exit(1)
  }

  const before = readme.split(START_MARKER)[0]
  const after = readme.split(END_MARKER)[1]

  const updated = `${before}${START_MARKER}\n\n${markdown}\n\n${END_MARKER}${after}`

  if (updated === readme) {
    console.log('No changes.')
    return false
  }

  writeFileSync(README_PATH, updated, 'utf-8')
  console.log('README updated.')
  return true
}

async function main() {
  const rices = await fetchRices()
  console.log(`Fetched ${rices.length} approved rices.`)

  updateReadme(renderMarkdown(rices))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
