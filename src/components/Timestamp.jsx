import { formatFullStamp, formatStamp, relativeTime } from '../lib/store.js'

// A machine-readable <time> with the exact date and time. Hover for the full stamp.
// With `ago`, the relative age follows it, for example "10 Feb 2016, 9:42 am · 9y ago".
export default function Timestamp({ value, ago = false, className = '' }) {
  if (!value) return null
  return (
    <time className={`ts ${className}`.trim()} dateTime={new Date(value).toISOString()} title={formatFullStamp(value)}>
      {formatStamp(value)}
      {ago && <span className="ts-ago"> · {relativeTime(value)}</span>}
    </time>
  )
}
