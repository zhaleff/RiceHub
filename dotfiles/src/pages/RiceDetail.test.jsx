import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RiceDetail from './RiceDetail'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  single: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

vi.mock('../components/SEO', () => ({
  default: () => null,
}))

const RICE = {
  id: 7,
  slug: 'niri-sunset',
  title: 'Niri Sunset',
  author: 'ana',
  description: 'A warm Niri setup.',
  wm: 'Niri',
  distro: 'Arch',
  likes: 5,
  views: 42,
  created_at: '2026-10-01T00:00:00.000Z',
}

function renderDetail(slug = RICE.slug) {
  return render(
    <MemoryRouter initialEntries={[`/rice/${slug}`]}>
      <Routes>
        <Route path="/rice/:slug" element={<RiceDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RiceDetail', () => {
  beforeEach(() => {
    mocks.from.mockReset()
    mocks.single.mockReset()
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({ single: mocks.single }),
      }),
    })
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ vote: null }),
    })
  })

  it('shows a loader first and then the rice details', async () => {
    let resolveRice
    mocks.single.mockReturnValue(new Promise((resolve) => { resolveRice = resolve }))

    renderDetail()

    expect(screen.queryByRole('heading', { name: RICE.title })).not.toBeInTheDocument()

    resolveRice({ data: RICE, error: null })

    expect(await screen.findByRole('heading', { name: RICE.title })).toBeInTheDocument()
    expect(screen.getByText('A warm Niri setup.')).toBeInTheDocument()
    expect(mocks.from).toHaveBeenCalledWith('rices')
  })

  it('shows a 404 when the rice does not exist', async () => {
    mocks.single.mockResolvedValue({ data: null, error: new Error('not found') })

    renderDetail('missing')

    expect(await screen.findByText('This setup does not exist.')).toBeInTheDocument()
  })

  it('sends a vote and updates the like count', async () => {
    mocks.single.mockResolvedValue({ data: RICE, error: null })
    globalThis.fetch = vi.fn().mockImplementation(async (_url, options) => ({
      json: async () => (options?.method === 'POST' ? { vote: 'up', likes: 6 } : { vote: null }),
    }))
    const user = userEvent.setup()

    renderDetail()
    await screen.findByRole('heading', { name: RICE.title })

    await user.click(screen.getByRole('button', { name: '5' }))

    await waitFor(() => expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument())
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/vote'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
