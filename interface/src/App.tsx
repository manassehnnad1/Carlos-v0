import ChatBox from "./components/ChatBox"

const App = () => {
  return (
    <div className="min-h-screen  flex flex-col">
    <div className="flex bg-black  p-4 justify-center gap-2 items-center">
      <img src="./h1.png" alt="logo" className="w-7 h-7 mr-6 invert"  />
      <p className="text-white text-sm">your world cup pundit buddy.</p>
    </div>
    <ChatBox onSend={(message) => console.log(message)} />
    </div>

    
  )
}

export default App