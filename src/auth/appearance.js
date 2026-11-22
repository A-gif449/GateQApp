// Clerk appearance that mirrors the app's Aurora theme (dark "Midnight" and light "Porcelain").
// Values match the CSS variables in index.css and theme/theme.css, including the accent presets.
const BASE = {
  dark: {
    surface: '#0f1326',
    surface2: '#141a31',
    border: '#1f2646',
    text: '#eef0fb',
    muted: '#8b93b6',
    good: '#34d399',
    bad: '#fb7185',
    shadow: 'rgba(2, 4, 20, 0.75)',
    backdrop: 'rgba(5, 7, 20, 0.72)',
  },
  light: {
    surface: '#ffffff',
    surface2: '#eff1fb',
    border: '#e0e4f3',
    text: '#11142b',
    muted: '#666d94',
    good: '#059669',
    bad: '#e11d48',
    shadow: 'rgba(30, 35, 90, 0.22)',
    backdrop: 'rgba(17, 20, 43, 0.45)',
  },
}

const ACCENTS = {
  indigo: { dark: ['#7c8cff', '#090c1e'], light: ['#4f46e5', '#ffffff'] },
  emerald: { dark: ['#34d399', '#04140d'], light: ['#059669', '#ffffff'] },
  sunset: { dark: ['#ff8a5c', '#1a0a05'], light: ['#ea580c', '#ffffff'] },
  ocean: { dark: ['#38bdf8', '#031420'], light: ['#0284c7', '#ffffff'] },
}

export function buildAppearance(theme, accent = 'indigo') {
  const mode = BASE[theme] ? theme : 'dark'
  const p = BASE[mode]
  const [accentColor, accentInk] = (ACCENTS[accent] || ACCENTS.indigo)[mode]
  return {
    variables: {
      colorPrimary: accentColor,
      colorPrimaryForeground: accentInk,
      colorBackground: p.surface,
      colorForeground: p.text,
      colorMutedForeground: p.muted,
      colorMuted: p.surface2,
      colorInput: p.surface2,
      colorInputForeground: p.text,
      colorNeutral: p.text,
      colorBorder: p.border,
      colorRing: accentColor,
      colorShadow: p.shadow,
      colorDanger: p.bad,
      colorSuccess: p.good,
      colorModalBackdrop: p.backdrop,
      fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      borderRadius: '0.75rem',
    },
    layout: {
      socialButtonsPlacement: 'top',
      socialButtonsVariant: 'blockButton',
      logoPlacement: 'none',
      shimmer: true,
    },
    elements: {
      // Cards sit inside the app's own page frame, so drop Clerk's outer width and shadow.
      rootBox: { width: '100%' },
      cardBox: {
        width: '100%',
        maxWidth: '100%',
        boxShadow: `0 30px 70px -30px ${p.shadow}`,
        border: `1px solid ${p.border}`,
        borderRadius: '22px',
      },
      formButtonPrimary: {
        fontWeight: 600,
        boxShadow: `0 10px 24px -10px ${accentColor}`,
      },
    },
  }
}
