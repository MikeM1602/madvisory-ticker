import anthropic, json, datetime, os, subprocess, tempfile

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
if result_text.startswith("```"):
    lines = result_text.split("\n")
    result_text = "\n".join(lines[1:-1]).strip()

items = json.loads(result_text)
ticker_json = json.dumps(items, ensure_ascii=False, indent=2)
print(f"Generated {len(items)} items")

# Step 3: upload to server via cURL (handles SSL and auth better than urllib)
cpanel_host = os.environ["CPANEL_HOST"]
cpanel_user = os.environ["CPANEL_USER"]
cpanel_token = os.environ["CPANEL_TOKEN"]

# Write ticker.json to temp file
with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
    f.write(ticker_json)
    tmp_path = f.name

# Use curl to upload via cPanel UAPI - tries port 2083 first, falls back to 2082
for port in [2083, 2082, 443]:
    url = f"https://{cpanel_host}:{port}/execute/Fileman/save_file_content"
    cmd = [
        "curl", "-sk",
        "-H", f"Authorization: cpanel {cpanel_user}:{cpanel_token}",
        "-H", "Content-Type: application/x-www-form-urlencoded",
        "--data-urlencode", "dir=/public_html",
        "--data-urlencode", "filename=ticker.json",
        "--data-urlencode", f"content@{tmp_path}",
        "--data-urlencode", "overwrite=1",
        "--connect-timeout", "15",
        "--max-time", "30",
        url
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0 and result.stdout:
        try:
            resp = json.loads(result.stdout)
            if resp.get("status") == 1:
                print(f"Uploaded {len(items)} items via port {port}")
                break
            else:
                print(f"Port {port} returned error: {resp}")
        except:
            print(f"Port {port} response: {result.stdout[:100]}")
    else:
        print(f"Port {port} failed: {result.stderr[:100]}")
else:
    raise Exception("All upload attempts failed")
