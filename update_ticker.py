import anthropic, json, datetime, os, urllib.request, base64

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
today = datetime.date.today().strftime("%B %d, %Y")

# Step 1: search for news
search_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2000,
    tools=[{"type": "web_search_20250305", "name": "web_search"}],
    messages=[{"role": "user", "content": f"Search for the most important payments and fintech regulatory news today {today}. Focus on GCC markets (UAE, Saudi, Qatar), European regulation, AI in payments, card networks, CBDCs, open banking, fraud and AML."}]
)

search_results = ""
for block in search_response.content:
    if hasattr(block, "text"):
        search_results += block.text + "\n"

if not search_results.strip():
    search_results = f"Payments news {today}: GCC payment schemes expanding, EU AI Act compliance approaching, open banking growing."

# Step 2: convert to JSON ticker items
json_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1000,
    messages=[{"role": "user", "content": f"""Based on this payments news, create a JSON array of 8-10 ticker items.

News:
{search_results[:3000]}

Return ONLY a valid JSON array starting with [ and ending with ]. No markdown, no explanation.
Each item needs "text" (headline under 18 words) and "tag" (NEW/UPDATED/ALERT/REPORT).

Example: [{{"text":"QCB launches open banking framework for Qatar payment institutions","tag":"NEW"}}]"""}]
)

result_text = "".join(block.text for block in json_response.content if hasattr(block, "text")).strip()

# Clean markdown fences if present
if result_text.startswith("```"):
    lines = result_text.split("\n")
    result_text = "\n".join(lines[1:-1]).strip()

items = json.loads(result_text)
ticker_json = json.dumps(items, ensure_ascii=False, indent=2)

# Upload to GitHub repo via API (commits ticker.json directly to the repo)
github_token = os.environ["GITHUB_TOKEN"]
repo = "MikeM1602/madvisory-ticker"

# Get current file SHA
get_url = f"https://api.github.com/repos/{repo}/contents/ticker.json"
req = urllib.request.Request(get_url)
req.add_header("Authorization", f"token {github_token}")
req.add_header("Accept", "application/vnd.github.v3+json")
req.add_header("User-Agent", "ticker-updater")

try:
    with urllib.request.urlopen(req) as resp:
        current = json.loads(resp.read())
        sha = current["sha"]
except:
    sha = None

# Update the file
encoded_content = base64.b64encode(ticker_json.encode()).decode()
payload = json.dumps({
    "message": f"Update ticker {today}",
    "content": encoded_content,
    **({"sha": sha} if sha else {})
}).encode()

put_req = urllib.request.Request(get_url, data=payload, method="PUT")
put_req.add_header("Authorization", f"token {github_token}")
put_req.add_header("Accept", "application/vnd.github.v3+json")
put_req.add_header("Content-Type", "application/json")
put_req.add_header("User-Agent", "ticker-updater")

with urllib.request.urlopen(put_req) as resp:
    result = json.loads(resp.read())
    print(f"Committed {len(items)} ticker items: {result['commit']['sha'][:7]}")
