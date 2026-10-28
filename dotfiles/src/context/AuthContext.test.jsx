import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './auth-context'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
  listener: null,
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
  },
}))

function Consumer() {
  const { user, initialized } = useAuth()
  if (!initialized) return <span>loading</span>
  return <span>{user ? `user:${user.email}` : 'anonymous'}</span>
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mocks.getSession.mockReset()
    mocks.onAuthStateChange.mockReset()
    mocks.unsubscribe.mockReset()
    mocks.listener = null
    mocks.onAuthStateChange.mockImplementation((callback) => {
      mocks.listener = callback
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } }
    })
  })

  it('starts in loading state and exposes the current session user', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { email: 'admin@ricehub.test' } } } })

    renderProvider()

    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(await screen.findByText('user:admin@ricehub.test')).toBeInTheDocument()
  })

  it('initializes as anonymous when there is no session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })

    renderProvider()

    expect(await screen.findByText('anonymous')).toBeInTheDocument()
  })

  it('fails open as anonymous when the session lookup throws', async () => {
    mocks.getSession.mockRejectedValue(new Error('network down'))

    renderProvider()

    expect(await screen.findByText('anonymous')).toBeInTheDocument()
  })

  it('updates the user when the auth state changes', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })

    renderProvider()
    await screen.findByText('anonymous')

    act(() => {
      mocks.listener('SIGNED_IN', { user: { email: 'new@ricehub.test' } })
    })

    expect(screen.getByText('user:new@ricehub.test')).toBeInTheDocument()
  })

  it('unsubscribes from auth changes on unmount', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })

    const { unmount } = renderProvider()
    await screen.findByText('anonymous')
    unmount()

    expect(mocks.unsubscribe).toHaveBeenCalledOnce()
  })
})

describe('useAuth', () => {
  it('returns null outside of an AuthProvider', () => {
    function Probe() {
      return <span>{String(useAuth())}</span>
    }

    render(<Probe />)

    expect(screen.getByText('null')).toBeInTheDocument()
  })
})
