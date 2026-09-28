"""
update_ticker.py: refresh ticker.json for the Live Intelligence bar on madvisory.qa.

Output format (read by main.js):
  {"updated": "YYYY-MM-DD", "items": [{"tag", "text", "ar_tag", "ar_text"}, ...]}

The site only uses this file if it is less than 21 days old and passes validation;
otherwise it falls back to the checked items built into main.js. So a failed run
never breaks the site, and this script never overwrites a good ticker.json with
a bad one: on any error it exits without committing.
"""
import anthropic, json, datetime, os, re, sys, urllib.request, base64

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

def final_text(resp):
    """Text written after the last web search result (the answer, not the working notes)."""
    last_tool = max((i for i, b in enumerate(resp.content) if getattr(b, "type", "") == "web_search_tool_result"), default=-1)
    return "".join(b.text for b in resp.content[last_tool + 1:] if hasattr(b, "text")).strip()


def json_between(text, tag="json"):
    m = re.search(rf"<{tag}>(.*?)</{tag}>", text, re.DOTALL)
    if not m:
        raise ValueError(f"no <{tag}> block in reply")
    return json.loads(m.group(1))


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

    # Step 2: draft English headlines, each with its source
    draft_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": f"""Turn this payments news into up to 10 ticker headlines.

News (only use facts stated here; do not add dates or numbers that are not in it):
{search_results[:6000]}

Rules:
- "text": plain British English headline, under 20 words, factual, no hype, no em dashes.
- "tag": one of NEW, UPDATED, ALERT, REGULATORY.
- "source": the URL the item came from. Leave the item out if there is no URL.
- Skip anything older than 30 days.

Return ONLY a JSON array between <json> and </json>:
<json>[{{"tag":"NEW","text":"...","source":"https://..."}}]</json>"""}],
    )
    drafts = json_between("".join(b.text for b in draft_response.content if hasattr(b, "text")))
    drafts = [d for d in drafts if isinstance(d, dict) and str(d.get("source", "")).startswith("http")]
    if len(drafts) < 4:
        stop(f"only {len(drafts)} drafted items with a source")

    # Step 3: fact-check every headline against sources before anything is published
    check_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
        messages=[{"role": "user", "content": f"""Today is {today_long}. You are the fact-checker for a payments advisory website's news ticker.
Check each headline against its source and other authoritative sources (regulators, central banks,
the company's own announcement, established news outlets) using web search.
- "ok": every detail confirmed.
- "fixed": the event is real but a detail was wrong; give the corrected headline (British English, under 20 words, no em dashes).
- "drop": you cannot confirm it, or it is older than 30 days.
Names must be spelt as the organisation spells them.

Headlines:
{json.dumps(drafts, ensure_ascii=False, indent=1)}

Return ONLY a JSON array between <json> and </json>, one object per headline in the same order:
<json>[{{"verdict":"ok|fixed|drop","text":"..."}}]</json>"""}],
    )
    verdicts = json_between(final_text(check_response))
    if len(verdicts) != len(drafts):
        stop("fact-check returned a different number of items")
    checked = []
    for d, v in zip(drafts, verdicts):
        verdict = str(v.get("verdict", "drop")).lower()
        if verdict == "drop":
            print(f"  Dropped: {d.get('text', '')}")
            continue
        text = str(v.get("text", "")).strip() if verdict == "fixed" and str(v.get("text", "")).strip() else str(d.get("text", "")).strip()
        checked.append({"tag": str(d.get("tag", "NEW")), "text": text})
    if len(checked) < 4:
        stop(f"only {len(checked)} items passed the fact-check")

    # Step 4: Arabic translation of the checked headlines
    tr_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        messages=[{"role": "user", "content": (
            "Translate each headline into Modern Standard Arabic for a professional payments advisory website. "
            "Keep company, product, scheme and regulator acronyms in Latin script, spelt exactly as in the English. "
            "Keep numbers and dates exact. Return ONLY a JSON array of strings between <json> and </json>, "
            "one per headline in the same order.\n\n" + json.dumps([c["text"] for c in checked], ensure_ascii=False)
        )}],
    )
    ar_texts = json_between("".join(b.text for b in tr_response.content if hasattr(b, "text")))
    if len(ar_texts) != len(checked):
        stop("translation returned a different number of items")
except anthropic.APIStatusError as e:
    stop(f"Anthropic API error {e.status_code}: {getattr(e, 'message', e)} (check the account credit balance)")
except anthropic.APIError as e:
    stop(f"Anthropic API error: {e}")
except (ValueError, json.JSONDecodeError) as e:
    stop(f"could not read the model's reply: {e}")

items = []
for c, ar_text in zip(checked, ar_texts):
    text = c["text"]
    ar_text = str(ar_text).strip()
    tag_en, tag_ar = TAGS.get(c["tag"].upper(), TAGS["NEW"])
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

# Step 5: commit ticker.json to this repo
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
