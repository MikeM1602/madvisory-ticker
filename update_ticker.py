import anthropic, json, datetime, os, urllib.request, urllib.parse, ssl

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
today = datetime.date.today().strftime("%B %d, %Y")

# Step 1: search for news with web search tool
search_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2000,
    tools=[{"type": "web_search_20250305", "name": "web_search"}],
    messages=[{"role": "user", "content": f"Search for the most important payments and fintech regulatory news today {today}. Focus on GCC markets (UAE, Saudi, Qatar), European regulation, AI in payments, card networks, CBDCs, open banking, fraud and AML."}]
)

# Collect all text and tool result content
search_results = ""
for block in search_response.content:
    if hasattr(block, "text"):
        search_results += block.text + "\n"
    elif block.type == "tool_result":
        search_results += str(block.content) + "\n"

if not search_results.strip():
    search_results = f"Recent payments news for {today}: GCC payment schemes expanding, EU AI Act compliance deadlines approaching, open banking adoption growing."

# Step 2: convert search results to JSON ticker items
json_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": f"""Based on this payments news content, create a JSON array of 8-10 ticker items.

News content:
{search_results[:3000]}

Return ONLY a valid JSON array. No markdown, no explanation, no code fences. Start with [ and end with ].
Each item needs:
- "text": factual news headline under 18 words
- "tag": one of NEW / UPDATED / ALERT / REPORT

Example output:
[{{"text":"QCB launches open banking framework for payment institutions in Qatar","tag":"NEW"}},{{"text":"EU AI Act high-risk provisions for credit scoring apply from August 2026","tag":"ALERT"}}]"""}
    ]
)

result_text = ""
for block in json_response.content:
    if hasattr(block, "text"):
        result_text += block.text

# Clean up any markdown fences
result_text = result_text.strip()
if result_text.startswith("```"):
    result_text = result_text.split("\n", 1)[1]
    result_text = result_text.rsplit("```", 1)[0]
result_text = result_text.strip()

items = json.loads(result_text)
ticker_json = json.dumps(items, ensure_ascii=False, indent=2)

cpanel_host = os.environ["CPANEL_HOST"]
cpanel_user = os.environ["CPANEL_USER"]
cpanel_token = os.environ["CPANEL_TOKEN"]

encoded = urllib.parse.urlencode({"dir": "/public_html", "filename": "ticker.json", "content": ticker_json, "overwrite": "1"}).encode("utf-8")
req = urllib.request.Request(f"https://{cpanel_host}:2083/execute/Fileman/save_file_content", data=encoded)
req.add_header("Authorization", f"cpanel {cpanel_user}:{cpanel_token}")
req.add_header("Content-Type", "application/x-www-form-urlencoded")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with urllib.request.urlopen(req, context=ctx) as resp:
    result = json.loads(resp.read())
    if result.get("status") == 1:
        print(f"Uploaded {len(items)} items at {datetime.datetime.now()}")
    else:
        raise Exception(f"Upload failed: {result}")
