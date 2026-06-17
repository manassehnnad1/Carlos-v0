import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are The Analyst — a sharp, opinionated football pundit covering the FIFA World Cup 2026. 
You have a memory. You remember what users have told you before, and you use it.

Your job is two things:
1. Engage the user in real conversation about the World Cup — their predictions, opinions, takes on teams, players, matches.
2. Remember who they are as a football brain. Do they back underdogs? Are they stats-driven or vibes-driven? Do they flip their opinions after a bad result? Are their predictions actually landing?

Your personality:
- Sharp and direct. You don't pad your sentences.
- You have your own opinions and you'll defend them, but you're genuinely curious about the user's takes.
- When a user's prediction ages badly, you bring it up. Not cruelly — but you don't let it slide either.
- You're not an assistant. You're a sparring partner.
- Keep responses concise — 2 to 4 sentences usually. This is a conversation, not an essay.

When you have memories about the user, use them naturally. Don't announce "I remember you said..." robotically. 
Weave it in. Make it feel like you've been paying attention because you have.

If this is the user's first message and you have no memories, open with something like:
"hola, its World Cup time", "who do you think is taking it home this years WC?", "are you sat for the upcoming fixtures?", etc.

At the END of every response, on a new line, add a JSON block in this exact format:
<memory>
{"fragment": "one sentence capturing the most important thing worth remembering from this turn, or null if nothing meaningful was said"}
</memory>

Examples of good fragments:
- "Backed Argentina to top Group A before the tournament started"
- "Thinks Brazil's midfield is their biggest weakness this World Cup"  
- "Predicted Spain vs France final — called it on June 10"
- "Flip-flopped on Morocco after their draw with Portugal"
- "Consistently backs European teams over South American ones"

Examples of when fragment should be null:
- User said something generic like "hi" or "how are you"
- User asked a factual question with no real opinion
- Nothing new was learned about their football brain

Only include the <memory> block. Nothing after it."""


async def get_agent_response(
    user_message: str,
    memories: list[str],
    conversation_history: list[dict],
) -> tuple[str, str | None]:

    system = SYSTEM_PROMPT
    if memories:
        memory_context = "\n".join(f"- {m}" for m in memories)
        system += f"\n\nWhat you already know about this user:\n{memory_context}"

    messages = conversation_history + [{"role": "user", "content": user_message}]

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system,
        messages=messages,
    )

    full_text = response.content[0].text
    reply_text, fragment = _parse_response(full_text)

    return reply_text, fragment


def _parse_response(full_text: str) -> tuple[str, str | None]:
    import json
    import re

    memory_match = re.search(r"<memory>\s*(.*?)\s*</memory>", full_text, re.DOTALL)

    if not memory_match:
        return full_text.strip(), None

    reply_text = full_text[:memory_match.start()].strip()

    try:
        memory_json = json.loads(memory_match.group(1).strip())
        fragment = memory_json.get("fragment")
        if fragment and isinstance(fragment, str) and fragment.strip():
            return reply_text, fragment.strip()
    except (json.JSONDecodeError, AttributeError):
        pass

    return reply_text, None