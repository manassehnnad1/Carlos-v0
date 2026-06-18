"""
Run this FIRST before anything else.
Tests that Walrus Memory and Claude are both working correctly.

Usage:
  cp .env.example .env        # fill in your keys
  python test_agent.py
"""
import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from app.memory import recall_memories, store_memory, get_all_memories
from app.agent import get_agent_response


TEST_USER = "test-user-001"


async def main():
    print("=" * 50)
    print("CARLOS V0 — Backend Test")
    print("=" * 50)

    # 1. Check what memories exist for test user (should be empty first run)
    print("\n[1] Fetching existing memories...")
    existing = await get_all_memories(TEST_USER)
    if existing:
        print(f"    Found {len(existing)} existing memories:")
        for m in existing:
            print(f"    • {m}")
    else:
        print("    No memories yet (expected on first run)")

    # 2. Simulate a user message — no history, no memories yet
    print("\n[2] Simulating first user message...")
    user_msg = "I think Brazil are going all the way this tournament. Their attack is unstoppable."
    memories = await recall_memories(TEST_USER, user_msg)
    reply, fragment = await get_agent_response(
        user_message=user_msg,
        memories=memories,
        conversation_history=[],
    )
    print(f"    User: {user_msg}")
    print(f"    Agent: {reply}")
    print(f"    Fragment to store: {fragment}")

    # 3. Store the fragment
    if fragment:
        print("\n[3] Storing memory on Walrus...")
        await store_memory(TEST_USER, fragment)
        print(f"    Stored: '{fragment}'")
    else:
        print("\n[3] No fragment to store this turn.")

    # 4. Simulate a SECOND message — now memories should inform the response
    print("\n[4] Simulating second message (memory should kick in)...")
    user_msg_2 = "Actually, I'm not so sure about Brazil anymore after that performance."
    memories_2 = await recall_memories(TEST_USER, user_msg_2)
    print(f"    Recalled memories: {memories_2}")
    reply_2, fragment_2 = await get_agent_response(
        user_message=user_msg_2,
        memories=memories_2,
        conversation_history=[
            {"role": "user", "content": user_msg},
            {"role": "assistant", "content": reply},
        ],
    )
    print(f"    User: {user_msg_2}")
    print(f"    Agent: {reply_2}")
    print(f"    Fragment to store: {fragment_2}")

    print("\n" + "=" * 50)
    print("Test complete. If memories were recalled in step 4, Walrus Memory is working.")
    print("=" * 50)


asyncio.run(main())