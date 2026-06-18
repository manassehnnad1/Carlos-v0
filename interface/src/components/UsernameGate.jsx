import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function UsernameGate({ onEnter }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const value = e.currentTarget.elements.namedItem('username').value.trim().toLowerCase()
    if (!value) return
    onEnter(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="flex h-full items-center justify-center px-6"
    >
      <div className="flex flex-col gap-6 w-full max-w-md">
        <div className="flex flex-col gap-1">
          <p className="text-xl text-neutral-900">Hola, im Carlos.</p>
          <p className="text-xl text-neutral-400">enter a username to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            name="username"
            type="text"
            autoFocus
            autoComplete="off"
            className="flex-1 border border-neutral-200 rounded-half px-5 py-3 text-lg text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors bg-transparent"
          />
          <button
            type="submit"
            className="bg-black text-white  cursor-pointer rounded-half px-4 py-3 text-lg"
          >
            Go
          </button>
        </form>
      </div>
    </motion.div>
  )
}