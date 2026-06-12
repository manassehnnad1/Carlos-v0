import type { Message } from "../components/MessageThread"

const MOCK_RESPONSES = [
  "Bold take. Brazil's attack looks sharp but their midfield is a liability — you're betting on Vinicius carrying the whole thing.",
  "Interesting. Most people sleep on that. Let's see if you still feel that way after the group stage.",
  "That's a hot take and a half. Back it up — what are you seeing that others aren't?",
  "Classic overconfidence. You said the same thing last tournament and we both know how that ended.",
  "I'll give you that one. The data actually supports it, even if the take sounds outrageous.",
  "You're not wrong but you're not right either. There are three teams that could ruin that prediction easily.",
]

let mockIndex = 0

export interface ChatResponse {
  reply: string
  new_memory: string | null
}

export const sendMessage = async (
  message: string,
  _history: Message[],
  _userId: string
): Promise<ChatResponse> => {
  await new Promise((res) => setTimeout(res, 1200))

  const reply = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]
  mockIndex++

  const new_memory = mockIndex % 2 === 0 && message.length > 20
    ? message.slice(0, 60)
    : null

  return { reply, new_memory }
}

export const fetchMemories = async (_userId: string): Promise<string[]> => {
  await new Promise((res) => setTimeout(res, 500))
  return []
}