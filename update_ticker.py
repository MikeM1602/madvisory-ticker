"""
update_ticker.py: refresh ticker.json for the Live Intelligence bar on madvisory.qa.

Output format (read by main.js):
  {"updated": "YYYY-MM-DD", "items": [{"tag", "text", "ar_tag", "ar_text"}, ...]}

The site only uses this file if it is less than 21 days old and passes validation;
otherwise it falls back to the checked items built into main.js. So a failed run
never breaks the site, and this script never overwrites a good ticker.json with
a bad one: on any error it exits without committing.
"""
import anthropic, json, datetime, os, sys, urllib.request, base64

TAGS = {"NEW": ("New", "جديد"), "UPDATED": ("Updated", "محدّث"), "ALERT": ("Alert", "تنبيه"),
        "REGULATORY": ("Regulatory", "تنظيمي"), "REPORT": ("Report", "تقرير"), "INSIGHT": ("Insight", "تحليل")}


def stop(msg):
    print(f"Ticker not updated: {msg}")
    print("::warning::Ticker not updated. The site keeps showing its built-in items.")
    sys.exit(0)


api_key = os.environ.get("ANTHROPIC_API_KEY", "")
if not api_key:
    stop("ANTHROPIC_API_KEY is not set")

client = anthropic.Anthropic(api_key=api_key)
today = datetime.date.today()
today_long = today.strftime("%d %B %Y")

try:
    # Step 1: search for news
    search_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
        messages=[{"role": "user", "content": (
            f"Today is {today_long}. Find the most important payments and fintech regulatory news "
            "from the last 14 days. Focus on GCC markets (UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, Oman), "
            "EU and UK regulation, card networks, instant payments, open banking, stablecoins, fraud and AML. "
            "For each item give the date, what happened and the source URL. Only include items you found in "
            "the search results."
        )}],
    )
    search_results = "".join(b.text for b in search_response.content if hasattr(b, "text")).strip()
    if len(search_results) < 200:
        stop("search returned too little text")

    # Step 2: convert to bilingual ticker items
    json_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        messages=[{"role": "user", "content": f"""Turn this payments news into 8 ticker items.

News (only use facts stated here; do not add dates or numbers that are not in it):
{search_results[:6000]}

Rules:
- "text": plain British English headline, under 20 words, factual, no hype, no em dashes.
- "tag": one of NEW, UPDATED, ALERT, REGULATORY.
- "ar_text": accurate Modern Standard Arabic translation of "text". Keep brand and product names in Latin script.
- Skip anything older than 30 days.

Return ONLY a JSON array like:
[{{"tag":"NEW","text":"...","ar_text":"..."}}]"""}],
    )
    result_text = "".join(b.text for b in json_response.content if hasattr(b, "text")).strip()
except anthropic.APIStatusError as e:
    stop(f"Anthropic API error {e.status_code}: {getattr(e, 'message', e)} (check the account credit balance)")
except anthropic.APIError as e:
    stop(f"Anthropic API error: {e}")

start, end = result_text.find("["), result_text.rfind("]")
if start < 0 or end < 0:
    stop("model did not return a JSON array")
try:
    raw = json.loads(result_text[start:end + 1])
except json.JSONDecodeError as e:
    stop(f"invalid JSON: {e}")

items = []
for it in raw:
    if not isinstance(it, dict):
        continue
    text = str(it.get("text", "")).strip()
    ar_text = str(it.get("ar_text", "")).strip()
    tag_en, tag_ar = TAGS.get(str(it.get("tag", "NEW")).upper(), TAGS["NEW"])
    if not (10 <= len(text) <= 220) or not (5 <= len(ar_text) <= 260):
        continue
    if any(ch in text + ar_text for ch in "<>"):
        continue
    items.append({"tag": tag_en, "text": text, "ar_tag": tag_ar, "ar_text": ar_text})

if len(items) < 4:
    stop(f"only {len(items)} valid items")

payload_obj = {"updated": today.isoformat(), "items": items[:10]}
ticker_json = json.dumps(payload_obj, ensure_ascii=False, indent=2)
print(f"Generated {len(payload_obj['items'])} items")

# Step 3: commit ticker.json to this repo
github_token = os.environ["GITHUB_TOKEN"]
repo = os.environ.get("GITHUB_REPOSITORY", "MikeM1602/madvisory-ticker")
api_url = f"https://api.github.com/repos/{repo}/contents/ticker.json"
headers = {
    "Authorization": f"token {github_token}",
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "ticker-updater",
}

sha = None
try:
    with urllib.request.urlopen(urllib.request.Request(api_url, headers=headers)) as resp:
        sha = json.loads(resp.read())["sha"]
except Exception:
    pass

payload = {"message": f"Update ticker {today_long}", "content": base64.b64encode(ticker_json.encode()).decode()}
if sha:
    payload["sha"] = sha

put_req = urllib.request.Request(api_url, data=json.dumps(payload).encode(), method="PUT", headers=headers)
with urllib.request.urlopen(put_req) as resp:
    result = json.loads(resp.read())
    print(f"Committed: {result['commit']['sha'][:7]}")
