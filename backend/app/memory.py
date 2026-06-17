import os
from memwal import MemWal, RecallParams

def get_memwal(user_id: str) -> MemWal:
    """
        creates a memwal client for a specific user.
        each user_id gets their own memory space on Walrus.
    """

    return MemWal.create(
        key=os.environ["MEMWAL_PRIVATE_KEY"],
        account_id=os.environ["MEMWAL_ACCOUNT_ID"],
        env="prod",
        namespace=f"hottake-{user_id}"
    )

async def recall_memories(user_id: str, query: str, top_k: int=5) -> list[str]:
    """
        fetch the most relevant memories for a specific user, given the query.
        returns a list of memory text strings.
    """

    client = get_memwal(user_id)
    try:
        result = await client.recall(RecallParams(query=query, limit=top_k))
        return [m.text for m in result.results]
    finally:
        await client.close()

async def store_memory(user_id: str, fragment: str) -> None:
    """
        stores fragment of memories for specific user.
        uses remember_and_wait to ensure its fully persisted before returning.
    """

    client = get_memwal(user_id)
    try:
        await client.remember_and_wait(fragment)
    finally:
        await client.close()


async def get_all_memories(user_id: str) -> list[str]:
    """
        fetches all memory stored overtime for a specific user.
    """

    client = get_memwal(user_id)
    try:
        result = await client.recall(RecallParams(
            query="predictions and opinions for the 2026 fifa world cup.",
            limit=20
        ))
        return[m.text for m in result.results]
    finally:
        await client.close()
    