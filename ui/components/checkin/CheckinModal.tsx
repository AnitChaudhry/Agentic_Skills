'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
  challenge?: any
  todayTask?: any
}

const MOODS = [
  { emoji: '🔥', label: 'On Fire', value: 5 },
  { emoji: '✅', label: 'Good', value: 4 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😓', label: 'Struggling', value: 2 },
  { emoji: '💀', label: 'Terrible', value: 1 },
]

export function CheckinModal({ isOpen, onClose, challenge, todayTask }: CheckinModalProps) {
  const [step, setStep] = useState(1)
  const [mood, setMood] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)
  const [wins, setWins] = useState('')
  const [blockers, setBlockers] = useState('')
  const [tomorrowCommitment, setTomorrowCommitment] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setMood(null)
      setCompleted(false)
      setWins('')
      setBlockers('')
      setTomorrowCommitment('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    const checkinData = {
      challengeId: challenge?.id,
      taskId: todayTask?.id,
      mood,
      completed,
      wins,
      blockers,
      tomorrowCommitment,
      timestamp: new Date().toISOString(),
    }

    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinData),
      })
      onClose()
    } catch (error) {
      console.error('Check-in failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <Card>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 ${s <= step ? 'bg-oa-text-primary' : 'bg-oa-border'}`}
              />
            ))}
          </div>

          {/* Step 1: Mood */}
          {step === 1 && (
            <div>
              <h2 className="text-title font-semibold mb-2">How are you feeling?</h2>
              <p className="text-sm text-oa-text-secondary mb-6">
                {todayTask ? `About: ${todayTask.title}` : challenge?.name}
              </p>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`p-4 border transition-all ${
                      mood === m.value
                        ? 'border-oa-text-primary bg-oa-bg-secondary scale-110'
                        : 'border-oa-border hover:border-oa-text-secondary'
                    }`}
                  >
                    <div className="text-3xl mb-1">{m.emoji}</div>
                    <div className="text-xs">{m.label}</div>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} disabled={mood === null} className="w-full">
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Task Completion */}
          {step === 2 && (
            <div>
              <h2 className="text-title font-semibold mb-2">Did you complete today's task?</h2>
              <p className="text-sm text-oa-text-secondary mb-6">
                {todayTask?.title || 'Your planned task for today'}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setCompleted(true)}
                  className={`p-6 border transition-all ${
                    completed
                      ? 'border-oa-text-primary bg-oa-bg-secondary'
                      : 'border-oa-border hover:border-oa-text-secondary'
                  }`}
                >
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm font-medium">Yes, Completed</div>
                </button>
                <button
                  onClick={() => setCompleted(false)}
                  className={`p-6 border transition-all ${
                    !completed && step === 2
                      ? 'border-oa-text-primary bg-oa-bg-secondary'
                      : 'border-oa-border hover:border-oa-text-secondary'
                  }`}
                >
                  <div className="text-3xl mb-2">⏭️</div>
                  <div className="text-sm font-medium">Not Yet</div>
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Wins & Blockers */}
          {step === 3 && (
            <div>
              <h2 className="text-title font-semibold mb-6">What happened today?</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Wins (what went well?)</label>
                  <textarea
                    value={wins}
                    onChange={(e) => setWins(e.target.value)}
                    placeholder="List your achievements, no matter how small..."
                    className="w-full px-4 py-3 border border-oa-border bg-oa-bg-primary text-oa-text-primary resize-none focus:outline-none focus:border-oa-text-primary"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Blockers (what held you back?)</label>
                  <textarea
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="What challenges did you face?"
                    className="w-full px-4 py-3 border border-oa-border bg-oa-bg-primary text-oa-text-primary resize-none focus:outline-none focus:border-oa-text-primary"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Tomorrow's Commitment */}
          {step === 4 && (
            <div>
              <h2 className="text-title font-semibold mb-2">What will you do tomorrow?</h2>
              <p className="text-sm text-oa-text-secondary mb-6">
                Make a clear commitment for tomorrow
              </p>
              <textarea
                value={tomorrowCommitment}
                onChange={(e) => setTomorrowCommitment(e.target.value)}
                placeholder="Tomorrow I will..."
                className="w-full px-4 py-3 border border-oa-border bg-oa-bg-primary text-oa-text-primary resize-none focus:outline-none focus:border-oa-text-primary mb-6"
                rows={4}
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!tomorrowCommitment.trim()}
                  className="flex-1"
                >
                  Complete Check-in
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
