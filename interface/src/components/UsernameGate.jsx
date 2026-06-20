import { motion } from 'motion/react'

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
      className="flex h-full flex-col items-center justify-center px-6 overflow-hidden relative"
    >
      {/* Form — centered */}
      <div className="flex flex-col gap-6 w-full max-w-md z-10">
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
            className="bg-black text-white cursor-pointer rounded-half px-4 py-3 text-lg"
          >
            Go
          </button>
        </form>
      </div>

      {/* Bottom images — partially cut off */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center gap-0">
        <img
          src="./img.png"
          alt="carlos"
          className="h-64 w-auto object-contain grayscale translate-y-16"
        />
        <img
          src="./img1.png"
          alt="memwal"
          className="h-26 w-auto object-contain grayscale translate-y-3"
        />
        <img
          src="./wc1.png"
          alt="memwal"
          className="h-46 w-auto object-contain grayscale translate-y-6"
        />
      </div>
    </motion.div>
  )
}