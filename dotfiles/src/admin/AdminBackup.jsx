import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp, faArrowUpRightFromSquare, faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../lib/supabase'
import { PageHeader, Panel, BTN_SOLID } from './components'

const BACKUP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup`
const REPO_URL = 'https://github.com/zhaleff/ricehub-backup'

export default function AdminBackup() {
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  async function loadLatest() {
    setLoading(true)
    const { data, error } = await supabase
      .from('backup_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!error) setLog(data)
    setLoading(false)
  }

  useEffect(() => { loadLatest() }, [])

  async function runBackup() {
    setRunning(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(BACKUP_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Backup failed')
      toast.success(`Backup complete — ${data.rice_count} rices, ${data.images_backed_up} images`)
      await loadLatest()
    } catch (err) {
      toast.error(err.message || 'Backup failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <PageHeader heading="Backup" loading={loading} onRefresh={loadLatest} />

      <div className="flex flex-col gap-5 max-w-2xl">
        <Panel
          title="Repository"
          action={
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dim transition-colors duration-200"
            >
              View repo
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
            </a>
          }
        >
          <div className="px-6 py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-text truncate">zhaleff/ricehub-backup</p>
              <p className="text-xs text-muted mt-1">Private repository — database snapshot and images</p>
            </div>
            <button onClick={runBackup} disabled={running} className={BTN_SOLID}>
              <FontAwesomeIcon icon={faCloudArrowUp} className="w-3.5 h-3.5" />
              {running ? 'Backing up…' : 'Run backup now'}
            </button>
          </div>
        </Panel>

        <Panel title="Last backup">
          {loading ? (
            <div className="px-6 py-5">
              <div className="h-4 w-40 rounded-full bg-surface-3 animate-pulse" />
            </div>
          ) : !log ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted">No backup has run yet.</p>
            </div>
          ) : (
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <FontAwesomeIcon
                  icon={log.success ? faCircleCheck : faTriangleExclamation}
                  className={log.success ? 'w-4 h-4 text-accent' : 'w-4 h-4 text-red-400'}
                />
                <p className="text-sm text-text">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1">Rices backed up</p>
                  <p className="text-lg font-semibold text-text">{log.rice_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Images backed up</p>
                  <p className="text-lg font-semibold text-text">{log.images_backed_up}</p>
                </div>
              </div>

              {log.failures?.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-red-400 mb-2">{log.failures.length} image(s) failed</p>
                  <ul className="flex flex-col gap-1">
                    {log.failures.map((f, i) => (
                      <li key={i} className="text-xs text-muted truncate">{f.id} — {f.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
