import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar'

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  )
}

describe('Navbar mobile menu', () => {
  it('opens the menu and closes it when a mobile link is clicked', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    await user.click(aboutLinks[aboutLinks.length - 1])

    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'))
  })

  it('closes the menu when the mobile call to action is clicked', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const toggle = screen.getByRole('button', { name: /open menu/i })
    await user.click(toggle)

    const ctas = screen.getAllByRole('link', { name: /share your build/i })
    await user.click(ctas[ctas.length - 1])

    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'))
  })
})
