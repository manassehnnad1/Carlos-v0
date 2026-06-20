# Carlos v0

_FIFA World Cup 2026 AI pundit with persistent on-chain memory_

Carlos is an AI football agent that remembers everything you say. Across sessions, devices, forever. 
Drop your World Cup takes, make predictions, argue about teams. Carlos will challenge you, hold you accountable, and reference your past takes the next time you show up.

## How the memory works

Every time you chat with Carlos, two things happen:

1. **Recall** — before Claude ever sees your message, Carlos queries Walrus Memory for the most semantically relevant fragments from your history. These get injected into the system prompt so Carlos already knows you.

2. **Remember** — after responding, Carlos extracts the most meaningful thing from the turn (a prediction, an opinion, a flip-flop) and stores it on Walrus Mainnet via the memwal SDK, indexed under your username as a namespace.


---

## Persistent memory demonstration



_Enter a username and start talking world cup football._

![Day 1 - first session](https://github.com/user-attachments/assets/d6641162-be21-4d96-a1ee-46c49d045af3)

_Drop takes, make predictions. Watch the memory fragments appear in the sidebar in real time as Carlos logs what it learns about your football brain and remembers it all across sessions over a span of days._

![Memory fragments building up](https://github.com/user-attachments/assets/782bba91-b916-4786-84bd-d3e6da84ba8f)


## Stack

| Layer | Technology |
|---|---|
| Agent brain | Claude Sonnet (Anthropic) |
| Persistent memory | Walrus Memory — memwal SDK, Mainnet |
| Backend | Python, FastAPI, uvicorn |
| Match data | football-data.org API |
| Frontend | React, TypeScript, Tailwind CSS |
| Backend hosting | Render |
| Frontend hosting | Vercel |

---

## Project structure

```
carlos-v0/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI endpoints
│   │   ├── agent.py       # Claude brain + system prompt
│   │   ├── memory.py      # Walrus Memory integration
│   │   └── fixtures.py    
│   ├── requirements.txt
│   └── test_agent.py
└── interface/
    └── src/
        ├── components/    # React UI components
        └── hooks/
            └── useChat.js # API integration + streaming
```




## Walrus Memory

Carlos uses [Walrus Memory](https://walrus.xyz/products/walrus-memory/) (memwal SDK) for all persistent state. Memories are stored on Walrus Mainnet, authenticated via Ed25519 delegate keypair, and namespaced per user. The relayer handles encryption, embedding, and on-chain commitment automatically.
