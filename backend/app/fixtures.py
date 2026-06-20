import os
import httpx
from datetime import datetime, timedelta

FOOTBALLORG_API_KEY = os.environ.get("FOOTBALLORG_API_KEY")
BASE_URL = "https://api.football-data.org/v4"
HEADERS = {
    "X-Auth-Token": FOOTBALLORG_API_KEY
}


async def get_match_context() -> str:
    """
    Fetches recent and upcoming matches from football-data.org free tier.
    Returns a formatted string to inject into Carlos's system prompt.
    """
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        three_days_ago = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
        three_days_ahead = (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")

        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{BASE_URL}/matches",
                headers=HEADERS,
                params={
                    "dateFrom": three_days_ago,
                    "dateTo": three_days_ahead,
                },
                timeout=5.0,
            )

        if res.status_code != 200:
            print(f"[fixtures] football-data.org → {res.status_code}: {res.text[:200]}")
            return ""

        data = res.json()
        matches = data.get("matches", [])

        if not matches:
            return ""

        finished = []
        live = []
        upcoming = []

        for m in matches[:5]:
            status = m.get("status", "")
            home = m.get("homeTeam", {}).get("name", "?")
            away = m.get("awayTeam", {}).get("name", "?")
            competition = m.get("competition", {}).get("name", "")
            score = m.get("score", {})
            full_time = score.get("fullTime", {})
            ht = full_time.get("home")
            at = full_time.get("away")
            utc_date = m.get("utcDate", "")
            kickoff = utc_date[11:16] if utc_date else "TBD"
            match_date = utc_date[:10] if utc_date else "?"

            if status == "FINISHED":
                finished.append(f"  {home} {ht}–{at} {away} [{competition}] ({match_date})")
            elif status in ("IN_PLAY", "PAUSED", "HALFTIME"):
                live.append(f"  🔴 LIVE: {home} {ht}–{at} {away} [{competition}]")
            elif status in ("TIMED", "SCHEDULED"):
                upcoming.append(f"  {home} vs {away} — {kickoff} UTC [{competition}] ({match_date})")

        lines = ["Recent & Upcoming Football Matches:"]

        if live:
            lines.append("\nLIVE NOW:")
            lines.extend(live)

        if finished:
            lines.append("\nRECENT RESULTS:")
            lines.extend(finished)

        if upcoming:
            lines.append("\nUPCOMING:")
            lines.extend(upcoming[:8])

        if len(lines) == 1:
            return ""

        return "\n".join(lines)

    except Exception as e:
        print(f"[fixtures] error: {e}")
        return ""