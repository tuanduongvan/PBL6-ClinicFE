'use client'

import { FloatingSkinAnalysis } from '@/components/floating-skin-analysis'
import { BookingChatbot } from '@/components/chatbot/booking-chatbot'

/**
 * FloatingActionGroup
 * 
 * Unified container for floating action buttons at the bottom-right corner.
 * Manages positioning and z-index to prevent overlapping.
 * 
 * Layout:
 * - Skin Analysis Button (top)
 * - Chatbot Trigger Button (bottom, primary position)
 * 
 * When chatbot is open, it uses z-[60] to appear above this group (z-50).
 */
export function FloatingActionGroup() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      {/* Skin Analysis Button - positioned above chatbot */}
      <div className="relative pointer-events-auto">
        <FloatingSkinAnalysis />
      </div>
      
      {/* Chatbot Trigger Button - primary position */}
      <div className="relative pointer-events-auto">
        <BookingChatbot />
      </div>
    </div>
  )
}

