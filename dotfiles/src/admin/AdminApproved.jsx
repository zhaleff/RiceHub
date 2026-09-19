import { useOutletContext } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { RecentRow, Panel, EmptyState, PageHeader } from './ui'

export default function AdminApproved() {
  const { approved, loading, reload } = useOutletContext()

  return (
    <>
      <PageHeader heading="Approved rices" loading={loading} onRefresh={reload} />

      {loading ? (
        <div className="h-72 rounded-2xl bg-transparent border border-border animate-pulse" />
      ) : approved.length === 0 ? (
        <EmptyState icon={faCircleCheck} title="Nothing approved yet" hint="Approved rices will show up here" />
      ) : (
        <Panel title={`${approved.length} live rices`}>
          <div className="divide-y divide-border">
            {approved.map((rice) => <RecentRow key={rice.id} rice={rice} />)}
          </div>
        </Panel>
      )}
    </>
  )
}