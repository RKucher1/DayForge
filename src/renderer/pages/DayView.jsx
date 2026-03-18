import { useState, useEffect, useRef } from 'react'
import useBlocks from '../hooks/useBlocks'
import TimelineBlock from '../components/schedule/TimelineBlock'
import BlockModal from '../components/schedule/BlockModal'
import { timeToPercent } from '../utils/time'

function getNowPercent() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  return timeToPercent(timeStr)
}

const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = 9 + i
  return { label: h <= 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`, value: `${String(h).padStart(2, '0')}:00` }
})

export default function DayView() {
  const { blocks, isLoading, error, selectedDate } = useBlocks()
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [nowPct, setNowPct] = useState(getNowPercent)
  const timelineRef = useRef(null)

  // Update the now-line every minute
  useEffect(() => {
    const tick = () => setNowPct(getNowPercent())
    const id = setInterval(tick, 60_000)
    // Scroll now-line into view on load
    if (timelineRef.current) {
      const pct = getNowPercent()
      const scrollY = (pct / 100) * 720 - 200
      timelineRef.current.scrollTo({ top: Math.max(0, scrollY), behavior: 'smooth' })
    }
    return () => clearInterval(id)
  }, [])

  const isToday = selectedDate === new Date().toISOString().slice(0, 10)
  const showNow = isToday && nowPct >= 0 && nowPct <= 100

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        {error}
      </div>
    )
  }

  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No blocks for this day
      </div>
    )
  }

  return (
    <div className="flex h-full p-4 gap-2 overflow-y-auto" ref={timelineRef}>
      {/* Hour labels */}
      <div className="w-12 flex-shrink-0 relative" style={{ height: '720px' }}>
        {HOURS.map(({ label, value }) => (
          <div
            key={value}
            className="absolute text-xs text-gray-500 text-right w-full pr-1"
            style={{ top: timeToPercent(value) + '%', transform: 'translateY(-50%)' }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Timeline canvas */}
      <div className="flex-1 relative" style={{ height: '720px' }}>
        {/* Grid lines */}
        {HOURS.map(({ value }) => (
          <div
            key={value}
            className="absolute w-full border-t border-[#1A2F4A]"
            style={{ top: timeToPercent(value) + '%' }}
          />
        ))}

        {/* Current time indicator */}
        {showNow && (
          <div
            className="absolute w-full z-10 pointer-events-none"
            style={{ top: `${nowPct}%` }}
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--teal)' }} />
              <div className="flex-1 h-px" style={{ background: 'var(--teal)', opacity: 0.6 }} />
            </div>
          </div>
        )}

        {/* Blocks */}
        {blocks.map(block => (
          <TimelineBlock
            key={block.id}
            block={block}
            onEdit={setSelectedBlock}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedBlock && (
        <BlockModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  )
}
