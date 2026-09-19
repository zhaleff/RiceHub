import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Listbox } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faThumbsUp, faShuffle, faChevronDown, faXmark, faMagnifyingGlass, faCheck } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import RiceCard from './RiceCard'
import clsx from 'clsx'

const WM_OPTIONS = ['All', 'Niri', 'Hyprland', 'i3', 'MangoWM', 'Sway', 'Omarchy', 'bspwm', 'dwm', 'Qtile', 'AwesomeWM', 'XFCE', 'MiracleWM', 'KDE', 'GNOME']
const DISTRO_OPTIONS = ['All', 'Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'CachyOS', 'Pop!OS', 'openSUSE']

const SORT_OPTIONS = [
  { label: 'Recent', value: 'recent', icon: faClock, field: 'created_at' },
  { label: 'Most liked', value: 'liked', icon: faThumbsUp, field: 'likes' },
  { label: 'Random', value: 'random', icon: faShuffle, field: null },
]

function FilterSelect({ label, options, value, onChange }) {
  const active = value !== 'All'
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full sm:w-auto">
        <Listbox.Button
          className={clsx(
            'flex items-center justify-between sm:justify-start gap-3 pl-5 pr-4 h-12 w-full sm:w-auto rounded-full text-sm font-medium cursor-pointer transition-colors duration-200',
            active ? 'bg-accent text-surface' : 'bg-surface-2 text-text-dim hover:text-text hover:bg-surface-3'
          )}
        >
          {active ? value : label}
          <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
        </Listbox.Button>
        <Listbox.Options className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-50 w-full sm:w-56 max-h-72 overflow-y-auto bg-surface-2 border border-border rounded-2xl shadow-2xl p-2 focus:outline-none">
          {options.map((opt) => (
            <Listbox.Option
              key={opt}
              value={opt}
              className={({ active: hovered }) =>
                clsx(
                  'flex items-center justify-between px-4 py-3 rounded-xl text-sm cursor-pointer transition-colors duration-150',
                  hovered && 'bg-surface-3'
                )
              }
            >
              {({ selected }) => (
                <>
                  <span className={selected ? 'text-accent font-medium' : 'text-text-dim'}>{opt}</span>
                  {selected && <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-accent" />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}

function CardSkeleton() {
  return (
    <div>
      <div className="aspect-video rounded-2xl bg-surface-2 animate-pulse" />
      <div className="pt-3.5 space-y-2">
        <div className="h-3 w-32 rounded-full bg-surface-2 animate-pulse" />
        <div className="h-2.5 w-20 rounded-full bg-surface-2 animate-pulse" />
      </div>
    </div>
  )
}

export default function RiceGrid({ defaultSort = 'recent' }) {
  const [rices, setRices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(defaultSort)
  const [wm, setWm] = useState('All')
  const [distro, setDistro] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchRices() {
      setLoading(true)
      try {
        const sortOption = SORT_OPTIONS.find((o) => o.value === sort)
        const field = sort === 'random' ? 'created_at' : sortOption.field
        const { data, error } = await supabase
          .from('rices')
          .select('*')
          .eq('status', 'approved')
          .order(field, { ascending: false })
          .limit(48)
        if (error) throw error
        setRices(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRices()
  }, [sort])

  const filtered = useMemo(() => {
    let result = sort === 'random' ? [...rices].sort(() => Math.random() - 0.5) : rices
    if (wm !== 'All') result = result.filter((r) => r.wm === wm)
    if (distro !== 'All') result = result.filter((r) => r.distro === distro)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) =>
        [r.title, r.author, r.description, r.wm, r.distro].some((field) => field?.toLowerCase().includes(q))
      )
    }
    return result
  }, [rices, sort, wm, distro, search])

  const hasFilters = wm !== 'All' || distro !== 'All' || search.trim() !== ''
  const clearAll = () => { setWm('All'); setDistro('All'); setSearch('') }

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-1 bg-surface-2 p-1.5 rounded-full w-fit">
          {SORT_OPTIONS.map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={clsx(
                'relative flex items-center gap-2 px-5 h-10 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer',
                sort === value ? 'text-accent' : 'text-text-dim hover:text-text'
              )}
            >
              {sort === value && (
                <motion.span
                  layoutId="sort-pill"
                  className="absolute inset-0 rounded-full bg-surface-3"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <FontAwesomeIcon icon={icon} className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, WM, distro…"
            className="w-full h-12 pl-12 pr-10 bg-surface-2 rounded-full text-sm text-text placeholder-muted focus:outline-none focus:bg-surface-3 transition-colors duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text-dim transition-colors duration-200 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
          <FilterSelect label="WM / DE" options={WM_OPTIONS} value={wm} onChange={setWm} />
          <FilterSelect label="Distro" options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
          {hasFilters && (
            <button
              onClick={clearAll}
              aria-label="Clear filters"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-2 text-text-dim hover:text-text transition-colors duration-200 cursor-pointer flex-shrink-0 mx-auto sm:mx-0"
            >
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!loading && hasFilters && filtered.length > 0 && (
        <p className="text-sm text-muted mb-6">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-28 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center mb-1">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-muted" />
          </div>
          <p className="text-base text-text-dim">
            {hasFilters ? 'No results for these filters.' : 'No setups yet.'}
          </p>
          {hasFilters ? (
            <button onClick={clearAll} className="text-sm text-accent hover:text-accent-dim transition-colors duration-200 cursor-pointer">
              Clear filters
            </button>
          ) : (
            <Link to="/submit" className="text-sm text-accent hover:text-accent-dim transition-colors duration-200">
              Be the first to submit →
            </Link>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          <AnimatePresence mode="popLayout">
            {filtered.map((rice, i) => (
              <motion.div
                key={rice.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: i < 6 ? i * 0.04 : 0, ease: [0.16, 1, 0.3, 1] }}
              >
                <RiceCard rice={rice} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
