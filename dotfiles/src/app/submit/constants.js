export const WM_OPTIONS = ['Hyprland', 'Niri', 'i3', 'Sway', 'MangoWM', 'bspwm', 'dwm', 'Omarchy', 'Qtile', 'AwesomeWM', 'XFCE', 'KDE', 'GNOME', 'Other']
export const DISTRO_OPTIONS = ['Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'CachyOS', 'Pop!_OS', 'openSUSE', 'Other']
export const LICENSE_OPTIONS = ['MIT', 'GPL-3.0', 'Apache-2.0', 'Unlicense', 'BSD-3-Clause', 'MPL-2.0', 'None']

export const STEPS = ['Screenshot', 'Details', 'Config', 'Review']
export const STEP_HINTS = [
  'Start with the visuals — upload a screenshot of your desktop.',
  "Tell us what this is. It's the first thing people will see.",
  'Almost there. These fields are optional but they get more likes.',
  'Last step — this is exactly how your card will look.',
]

export const STEP_VARIANTS = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
}

export const STEP_TRANSITION = { duration: 0.25 }