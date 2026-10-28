import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RiceGrid from './RiceGrid'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

const RICES = [
  {
    id: 1,
    slug: 'niri-sunset',
    title: 'Niri Sunset',
    author: 'ana',
    wm: 'Niri',
    distro: 'Arch',
    likes: 3,
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 2,
    slug: 'hypr-forest',
    title: 'Hypr Forest',
    author: 'leo',
    wm: 'Hyprland',
    distro: 'NixOS',
    likes: 9,
    created_at: '2026-10-02T00:00:00.000Z',
  },
]

function resultChain(result) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => Promise.resolve(result),
  }
  return chain
}

function renderGrid() {
  return render(
    <MemoryRouter>
      <RiceGrid />
    </MemoryRouter>,
  )
}

describe('RiceGrid', () => {
  beforeEach(() => {
    mocks.from.mockReset()
    mocks.from.mockReturnValue(resultChain({ data: RICES, error: null }))
  })

  it('renders the fetched rices', async () => {
    renderGrid()

    expect(await screen.findByText('Niri Sunset')).toBeInTheDocument()
    expect(screen.getByText('Hypr Forest')).toBeInTheDocument()
    expect(mocks.from).toHaveBeenCalledWith('rices')
  })

  it('filters rices by the search query', async () => {
    const user = userEvent.setup()
    renderGrid()
    await screen.findByText('Niri Sunset')

    await user.type(screen.getByPlaceholderText(/search by title/i), 'forest')

    expect(screen.getByText('Hypr Forest')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Niri Sunset')).not.toBeInTheDocument())
  })

  it('shows an empty state and can clear all filters', async () => {
    const user = userEvent.setup()
    renderGrid()
    await screen.findByText('Niri Sunset')

    await user.type(screen.getByPlaceholderText(/search by title/i), 'does not exist')

    expect(screen.getByText('No results for these filters.')).toBeInTheDocument()

    await user.click(screen.getByText('Clear filters'))

    expect(screen.getByText('Niri Sunset')).toBeInTheDocument()
    expect(screen.getByText('Hypr Forest')).toBeInTheDocument()
  })

  it('filters rices by window manager', async () => {
    const user = userEvent.setup()
    renderGrid()
    await screen.findByText('Niri Sunset')

    await user.click(screen.getByRole('button', { name: /wm \/ de/i }))
    await user.click(screen.getByRole('option', { name: 'Niri' }))

    await waitFor(() => expect(screen.queryByText('Hypr Forest')).not.toBeInTheDocument())
    expect(screen.getByText('Niri Sunset')).toBeInTheDocument()
  })

  it('keeps all rices when random sorting is selected', async () => {
    const user = userEvent.setup()
    renderGrid()
    await screen.findByText('Niri Sunset')

    await user.click(screen.getByRole('button', { name: /random/i }))

    await waitFor(() => expect(mocks.from).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Niri Sunset')).toBeInTheDocument()
    expect(screen.getByText('Hypr Forest')).toBeInTheDocument()
  })

  it('shows the empty state when the query fails', async () => {
    mocks.from.mockReturnValue(resultChain({ data: null, error: new Error('boom') }))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderGrid()

    expect(await screen.findByText('No setups yet.')).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
