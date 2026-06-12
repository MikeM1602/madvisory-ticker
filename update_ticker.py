import anthropic, json, datetime, ftplib, io, os

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

today = datetime.date.today().strftime("%B %d, %Y")

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1000,
    tools=[{"type": "web_search_20250305", "name": "web_search"}],
    system="""You produce JSON ticker items for a GCC and MENA payments advisory website.
Search for today's most significant payments, fintech and regulatory news — especially 
anything involving GCC markets (UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, Oman), 
European payments regulation, AI in payments, card networks, central bank digital currencies, 
open banking, fraud, AML, and payment licensing.

Return ONLY a valid JSON array of 8-10 objects. No other text. No markdown. No explanation.
Each object must have:
- "text": the news item in under 18 words, factual and specific
- "tag": one of NEW / UPDATED / ALERT / REPORT

Example:
[{"text":"QCB issues open banking licensing framework for payment institutions","tag":"NEW"},
 {"text":"SAMA extends SARIE instant payment system to cross-border GCC transfers","tag":"UPDATED"}]""",
    messages=[{"role": "user", 
                "content": f"Find the most important payments and fintech news for {today}. Return JSON only."}]
)

# Extract text from response (handle tool use + text blocks)
result_text = ""
for block in response.content:
    if hasattr(block, "text"):
        result_text += block.text

# Parse JSON
items = json.loads(result_text.strip())

# Write ticker.json
ticker_json = json.dumps(items, ensure_ascii=False, indent=2)

# Upload via FTP
ftp = ftplib.FTP()
ftp.connect(os.environ["FTP_HOST"], 21)
ftp.login(os.environ["FTP_USER"], os.environ["FTP_PASS"])
ftp.cwd("/public_html")
ftp.storbinary("STOR ticker.json", io.BytesIO(ticker_json.encode("utf-8")))
ftp.quit()

print(f"Uploaded {len(items)} ticker items at {datetime.datetime.now()}")
