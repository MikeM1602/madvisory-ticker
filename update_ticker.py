import anthropic, json, datetime, os, urllib.request, urllib.parse, ssl

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
today = datetime.date.today().strftime("%B %d, %Y")

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1000,
    tools=[{"type": "web_search_20250305", "name": "web_search"}],
    system="""You produce JSON ticker items for a GCC and MENA payments advisory website. Search for today's most significant payments, fintech and regulatory news especially anything involving GCC markets (UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, Oman), European payments regulation, AI in payments, card networks, CBDCs, open banking, fraud, AML, and payment licensing. Return ONLY a valid JSON array of 8-10 objects. No other text. Each object has a text field (news item under 18 words) and a tag field (NEW/UPDATED/ALERT/REPORT).""",
    messages=[{"role": "user", "content": f"Find the most important payments and fintech news for {today}. Return JSON only."}]
)

result_text = "".join(block.text for block in response.content if hasattr(block, "text"))
items = json.loads(result_text.strip())
ticker_json = json.dumps(items, ensure_ascii=False, indent=2)

encoded = urllib.parse.urlencode({"dir": "/public_html", "filename": "ticker.json", "content": ticker_json, "overwrite": "1"}).encode("utf-8")
req = urllib.request.Request(f"https://{os.environ['CPANEL_HOST']}:2083/execute/Fileman/save_file_content", data=encoded)
req.add_header("Authorization", f"cpanel {os.environ['CPANEL_USER']}:{os.environ['CPANEL_TOKEN']}")
req.add_header("Content-Type", "application/x-www-form-urlencoded")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
with urllib.request.urlopen(req, context=ctx) as resp:
    result = json.loads(resp.read())
    if result.get("status") == 1:
        print(f"Uploaded {len(items)} items at {datetime.datetime.now()}")
    else:
        raise Exception(f"Failed: {result}")
