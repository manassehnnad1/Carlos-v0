export default function EmptyState({ onStart }) {
  return (
    <div className="flex flex-1 items-center justify-center px-8">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

        {/* Footballer */}
        <img
          src="./img.png"
          alt="footballer"
          className="h-48 md:h-80 w-auto object-contain grayscale"
        />

        {/* Text */}
        <div className="flex flex-col gap-2 text-center md:text-left" style={{ fontFamily: 'Bricolage Grotesque' }}>
          <p className="text-xl md:text-2xl text-neutral-900" >
            <span className="font-semibold">hola, i'm Carlos!</span>
          </p>
          <p className="text-lg md:text-2xl text-neutral-900" >
            Got any world cup opinions?<br />drop 'em, lets chat.
          </p>
        </div>

      </div>
    </div>
  )
}