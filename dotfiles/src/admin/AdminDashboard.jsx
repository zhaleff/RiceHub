import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox, faCircleCheck, faThumbsUp, faChartSimple } from '@fortawesome/free-solid-svg-icons'
import { StatCard, ActivityChart, RecentRow, Panel, PageHeader } from './ui'

export default function AdminDashboard() {
  const { pending, approved, loading, reload } = useOutletContext()

  const stats = useMemo(() => ({
    pending: pending.length,
    approved: approved.length,
    likes: approved.reduce((sum, r) => sum + (r.likes ?? 0), 0),
    views: approved.reduce((sum, r) => sum + (r.views ?? 0), 0),
  }), [pending, approved])

  return (
    <>
      <PageHeader heading="Good evening" loading={loading} onRefresh={reload} />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-transparent border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={faInbox} label="In queue" value={stats.pending} hint="Waiting for review" delay={0} />
            <StatCard icon={faCircleCheck} label="Approved" value={stats.approved} hint="Public in the gallery" delay={0.05} />
            <StatCard icon={faThumbsUp} label="Likes" value={stats.likes} hint="Across approved rices" delay={0.1} />
            <StatCard icon={faChartSimple} label="Views" value={stats.views} hint="Total detail page hits" delay={0.15} />
          </div>

          <ActivityChart rices={[...pending, ...approved]} />

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel
              title="Latest submissions"
              action={
                pending.length > 0 && (
                  <Link to="/admin/queue" className="text-[12px] text-text-dim hover:text-text transition-colors duration-200 cursor-pointer">
                    Review all
                  </Link>
                )
              }
            >
              {pending.length === 0 ? (
                <p className="px-6 py-10 text-[12.5px] text-muted text-center">Nothing pending</p>
              ) : (
                <div className="divide-y divide-border">
                  {pending.slice(0, 5).map((rice) => <RecentRow key={rice.id} rice={rice} />)}
                </div>
              )}
            </Panel>

            <Panel title="Recently approved">
              {approved.length === 0 ? (
                <p className="px-6 py-10 text-[12.5px] text-muted text-center">Nothing approved yet</p>
              ) : (
                <div className="divide-y divide-border">
                  {approved.slice(0, 5).map((rice) => <RecentRow key={rice.id} rice={rice} />)}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  )
}