import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { PageHeader, EmptyState, ReviewCard } from "./components/index.js"
import { EASE } from './components/tokens'

export default function AdminQueue() {
  const { pending, loading, reload, approve, reject, acting } = useOutletContext()

  return (
    <>
      <PageHeader heading="Review queue" loading={loading} onRefresh={reload} />

      {loading ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-transparent border border-border animate-pulse" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <EmptyState icon={faCheck} title="All clear" hint="No pending submissions" />
      ) : (
        <div className="flex flex-col gap-5">
          <AnimatePresence>
            {pending.map((rice, i) => (
              <motion.div
                key={rice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12, scale: 0.98 }}
                transition={{ duration: 0.3, delay: i * 0.03, ease: EASE }}
              >
                <ReviewCard
                  rice={rice}
                  acting={acting === rice.id}
                  onApprove={() => approve(rice)}
                  onReject={() => reject(rice.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}
