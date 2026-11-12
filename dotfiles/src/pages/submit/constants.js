export const STEPS = ['Screenshot', 'Details', 'Config', 'Review']

export const STEP_HINTS = [
  'Start with the visuals — upload a screenshot of your desktop.',
  "Tell us what this is. It's the first thing people will see.",
  'Almost there. These fields are optional but they get more likes.',
  'Last step — this is exactly how your card will look.',
]

export const STEP_FIELDS = [[], ['title', 'wm', 'distro'], ['license', 'githubUrl'], []]

export const CHIP_FIELDS = [
  { name: 'wm', step: 1, label: 'Window manager / DE', required: 'Select a WM / DE', options: ['Hyprland', 'Niri', 'i3', 'Sway', 'MangoWM', 'bspwm', 'dwm', 'Omarchy', 'Qtile', 'AwesomeWM', 'XFCE', 'KDE', 'GNOME', 'Other'] },
  { name: 'distro', step: 1, label: 'Distro', required: 'Select a distro', options: ['Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'CachyOS', 'Pop!_OS', 'openSUSE', 'Other'] },
  { name: 'license', step: 2, label: 'License', required: 'Select a license', options: ['MIT', 'GPL-3.0', 'Apache-2.0', 'Unlicense', 'BSD-3-Clause', 'MPL-2.0', 'None'] },
]

export const GITHUB_RULES = {
  required: 'GitHub repo URL is required',
  pattern: {
    value: /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(?:\/)?$/,
    message: 'Must be a GitHub repo URL (e.g. https://github.com/user/repo)',
  },
  validate: async (value) => {
    const m = value.match(/github\.com\/([^/]+)\/([^/?#]+)/)
    if (!m) return 'Invalid GitHub repo URL'
    try {
      const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`)
      if (r.status === 404) return 'Repository not found'
      return r.ok || 'Could not verify repository'
    } catch {
      return 'Could not verify repository'
    }
  },
}

export const HEX = /^#[0-9A-Fa-f]{6}$/
export const MAX_COLORS = 10

export const STEP_MOTION = {
  variants: { enter: { opacity: 0, x: 24 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } },
  initial: 'enter',
  animate: 'center',
  exit: 'exit',
  transition: { duration: 0.25 },
  className: 'flex flex-col gap-6',
}

export const INPUT = 'w-full px-4 py-3.5 rounded-2xl bg-surface-2 text-sm text-text placeholder:text-muted outline-none transition-colors duration-200'
export const BTN_PRIMARY = 'flex items-center justify-center gap-2 py-3.5 rounded-full bg-accent hover:bg-accent-dim disabled:opacity-40 text-surface text-sm cursor-pointer transition-colors duration-200'
export const BTN_BACK = 'flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-sm cursor-pointer transition-colors duration-200'
