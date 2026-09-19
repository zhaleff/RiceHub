import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AdminSidebar from '../components/AdminSidebar'
import SEO from '../components/SEO'

const RICE_FIELDS = 'id, slug, title, author, description, wm, distro, palette, github_url, thumbnail_url, image_url, likes, views, created_at'

export function useAdminData() {
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        supabase.from('rices').select(RICE_FIELDS).eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('rices').select(RICE_FIELDS).eq('status', 'approved').order('created_at', { ascending: false }).limit(200),
      ])
      if (pendingRes.error) throw pendingRes.error
      if (approvedRes.error) throw approvedRes.error
      setPending(pendingRes.data ?? [])
      setApproved(approvedRes.data ?? [])
    } catch {
      toast.error('Failed to load submissions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { pending, approved, loading, reload: load, setPending, setApproved }
}

export default function AdminLayout() {
  const { user, initialized } = useAuth()
  const navigate = useNavigate()
  const { pending, approved, loading, reload, setPending, setApproved } = useAdminData()
  const [acting, setActing] = useState(null)

  useEffect(() => {
    if (initialized && user === null) navigate('/admin/login')
  }, [user, initialized, navigate])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    )
  }

  if (user === null) return <Navigate to="/admin/login" replace />

  async function approve(rice) {
    setActing(rice.id)
    try {
      const { error } = await supabase.from('rices').update({ status: 'approved' }).eq('id', rice.id)
      if (error) throw error
      setPending((prev) => prev.filter((r) => r.id !== rice.id))
      setApproved((prev) => [rice, ...prev])
      toast.success('Approved!')
    } catch {
      toast.error('Failed to approve.')
    } finally {
      setActing(null)
    }
  }

  async function reject(id) {
    setActing(id)
    try {
      const { error } = await supabase.from('rices').delete().eq('id', id)
      if (error) throw error
      setPending((prev) => prev.filter((r) => r.id !== id))
      toast.success('Rejected and deleted.')
    } catch {
      toast.error('Failed to reject.')
    } finally {
      setActing(null)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex bg-surface">
      <SEO
        title="Admin Panel"
        description="Admin moderation panel for RiceHub. Review and manage community submissions."
        url="/admin"
        type="website"
      />
      <AdminSidebar
        email={user?.email}
        pendingCount={pending.length}
        onSignOut={signOut}
      />
      <main className="flex-1 min-w-0 px-6 sm:px-10 py-10">
        <Outlet context={{ pending, approved, loading, reload, approve, reject, acting }} />
      </main>
    </div>
  )
}