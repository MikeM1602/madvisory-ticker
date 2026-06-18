import anthropic, json, datetime, os, re, urllib.request, urllib.error, base64

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
today      = datetime.date.today()
today_str  = today.strftime("%B %d, %Y")
DEPLOY_URL   = "https://www.madvisory.qa/deploy.php"
DEPLOY_TOKEN = os.environ["DEPLOY_TOKEN"]
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
REPO         = "MikeM1602/madvisory-ticker"

MAX_NEW_ITEMS_PER_RUN = 8   # sanity ceiling: a bad run can't flood the page
EXPIRY_DAYS           = 90  # auto-remove items older than this

# ── Helpers (same conventions as update_content.py) ──────────────────────────

def search(query):
    r = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
        messages=[{"role": "user", "content": query}]
    )
    return "".join(b.text for b in r.content if hasattr(b, "text"))

def ask(prompt, max_tokens=2000):
    r = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return "".join(b.text for b in r.content if hasattr(b, "text")).strip()

def fetch_site_file(path):
    try:
        with urllib.request.urlopen(f"https://www.madvisory.qa/{path}", timeout=15) as r:
            return r.read().decode("utf-8")
    except Exception as e:
        print(f"  Warning: could not fetch {path}: {e}")
        return ""

def deploy_file(filename, content):
    payload = json.dumps({"filename": filename, "content": content}).encode()
    req = urllib.request.Request(DEPLOY_URL, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Deploy-Token", DEPLOY_TOKEN)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            result = json.loads(r.read())
            if result.get("ok"):
                print(f"  Deployed {filename} ({result.get('bytes', 0):,} bytes)")
                return True
            print(f"  Deploy failed: {result}")
            return False
    except Exception as e:
        print(f"  Deploy error {filename}: {e}")
        return False

def commit_to_github(path, content, message):
    api_url = f"https://api.github.com/repos/{REPO}/contents/{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "madvisory-news-bot",
    }
    sha = None
    try:
        with urllib.request.urlopen(urllib.request.Request(api_url, headers=headers)) as r:
            sha = json.loads(r.read())["sha"]
    except Exception:
        pass
    payload = {"message": message, "content": base64.b64encode(content.encode()).decode()}
    if sha:
        payload["sha"] = sha
    try:
        req = urllib.request.Request(api_url, data=json.dumps(payload).encode(), method="PUT", headers=headers)
        with urllib.request.urlopen(req):
            print(f"  Committed {path}")
    except Exception as e:
        print(f"  GitHub commit failed: {e}")

def parse_json_array(text):
    text = text.strip()
    if text.startswith("```"):
        text = "\n".join(text.split("\n")[1:-1]).strip()
    m = re.search(r'\[.*\]', text, re.DOTALL)
    return json.loads(m.group()) if m else json.loads(text)

def url_resolves(url, timeout=12):
    """Confirm a URL returns a successful response before trusting it.
    A model-suggested link that 404s or errors is worse than no link at all."""
    try:
        req = urllib.request.Request(url, method="HEAD",
                                      headers={"User-Agent": "Mozilla/5.0 (compatible; MadvisoryNewsBot/1.0)"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return 200 <= r.status < 400
    except urllib.error.HTTPError as e:
        # Some servers reject HEAD but allow GET (405/403) - retry with GET before giving up
        if e.code in (403, 405):
            try:
                req = urllib.request.Request(url, method="GET",
                                              headers={"User-Agent": "Mozilla/5.0 (compatible; MadvisoryNewsBot/1.0)"})
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    return 200 <= r.status < 400
            except Exception:
                return False
        return False
    except Exception:
        return False

def fetch_page_text(url, timeout=12, max_chars=3000):
    """Fetch a page and strip tags roughly, for a lightweight title-match check.
    Not a full HTML parser, just enough to sanity-check the headline is real."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; MadvisoryNewsBot/1.0)"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(200000).decode("utf-8", errors="ignore")
            text = re.sub(r'<[^>]+>', ' ', raw)
            text = re.sub(r'\s+', ' ', text)
            return text[:max_chars]
    except Exception:
        return ""

def title_plausible_on_page(title, page_text, min_word_overlap=3):
    """Loose check: do enough of the title's significant words appear on the
    fetched page? Catches a fabricated headline that doesn't match its source,
    without requiring an exact-string match (real pages often format titles
    slightly differently between <title>, <h1>, and search-snippet wording)."""
    if not page_text:
        return False
    stopwords = {"a","an","the","to","of","in","on","for","and","with","at","by",
                 "is","are","as","its","new","from","into"}
    title_words = [w.strip(".,:;\"'") for w in title.lower().split()]
    significant = [w for w in title_words if w not in stopwords and len(w) > 3]
    page_lower = page_text.lower()
    hits = sum(1 for w in significant if w in page_lower)
    return hits >= min(min_word_overlap, max(1, len(significant) // 2))

def parse_row_date(date_str):
    """Parse 'D MMM YYYY' format used in the rows (e.g. '17 Jun 2026')."""
    try:
        return datetime.datetime.strptime(date_str, "%d %b %Y").date()
    except Exception:
        return None

REGION_LABELS = {"gcc": "GCC", "uk": "UK", "europe": "Europe", "global": "Global"}
CATEGORY_LABELS = {
    "card-networks": "Card Networks",
    "acquiring-psp": "Acquiring &amp; PSP",
    "a2a": "A2A &amp; Open Banking",
    "core-banking": "Core Banking",
    "digital-banks": "Digital Banks",
    "issuing": "Issuing Platforms",
    "fx": "FX &amp; Cross-Border",
}

def make_news_row(date_str, region, category, title, url):
    region_label = REGION_LABELS[region]
    cat_label = CATEGORY_LABELS[category]
    safe_title = title.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (
        f'          <div class="news-row" data-region="{region}" data-category="{category}" data-date="{date_str}">'
        f'<span class="news-row-date">{date_str}</span>'
        f'<span class="news-row-tags">'
        f'<span class="news-tag region-{region}">{region_label}</span>'
        f'<span class="news-tag category">{cat_label}</span>'
        f'</span>'
        f'<span class="news-row-title"><a href="{url}" target="_blank" rel="noopener noreferrer">{safe_title}</a></span>'
        f'</div>'
    )

# ── Load existing news.html and extract current rows ─────────────────────────

print("Loading existing news.html...")
news_html = fetch_site_file("news.html")

existing_rows = re.findall(
    r'<div class="news-row" data-region="([^"]+)" data-category="([^"]+)" data-date="([^"]+)">.*?href="([^"]+)"[^>]*>([^<]+)</a>',
    news_html
)
# existing_rows: list of (region, category, date_str, url, title)
existing_urls = {r[3] for r in existing_rows}
print(f"  Found {len(existing_rows)} existing items")

# ── Drop expired items (older than EXPIRY_DAYS) ───────────────────────────────

cutoff = today - datetime.timedelta(days=EXPIRY_DAYS)
kept_rows = []
expired_count = 0
for region, category, date_str, url, title in existing_rows:
    parsed = parse_row_date(date_str)
    if parsed is None or parsed >= cutoff:
        kept_rows.append((region, category, date_str, url, title, parsed))
    else:
        expired_count += 1
print(f"  Expiring {expired_count} item(s) older than {EXPIRY_DAYS} days")

# ── Research: search across the company shortlist for recent news ────────────

COMPANY_GROUPS = """
Card Networks & Schemes: Visa, Mastercard, American Express, Discover, UnionPay
Acquirers & Merchant Processors: Global Payments, Fiserv, FIS, Adyen, Worldline, Nexi, Checkout.com, Network International
PSPs & Payment Platforms: Stripe, PayPal, Adyen, Airwallex, Checkout.com, Worldpay
A2A & Open Banking: Token.io, Yapily, Tink, Trustly, GoCardless, Plaid
Core Banking: Temenos, FIS, Fiserv, Finastra, Mambu, Thought Machine, Oracle FLEXCUBE, Infosys Finacle, TCS BaNCS
Digital Banks & Neobanks: Revolut, Monzo, N26, Wise, Starling, Chime, Nubank
Issuing Platforms: Marqeta, Adyen, Stripe Issuing, Galileo Financial Technologies, Thredd
FX & Cross-Border: Moneycorp, Ebury, Revolut, Wise, Currencies Direct
GCC/MENA specific: Network International, Geidea, PayTabs, Magnati, Tap Payments
"""

print("Searching for recent payments industry news...")
research = search(f"""
Today is {today_str}. Search for genuine, recent (last 14 days) press releases
or official announcements from payments industry companies across these groups:
{COMPANY_GROUPS}

For each genuine item found, note: the company, the exact headline as published,
the publish date, the direct source URL (company newsroom/investor-relations
page or a major wire service - not an aggregator roundup), and which region the
news is most relevant to (GCC, UK, Europe, or Global if not region-specific).

Only include items you can point to a specific, real source URL for. Do not
invent or guess at URLs. If you are not confident an item is genuine and
recent, leave it out rather than include it.
""")

print("Extracting candidate items...")
candidates_prompt = f"""
Based on this research, extract a JSON array of candidate payments-industry
news items. Each item must have:
- title: the exact headline (under 20 words), no em dash character
- url: the exact source URL mentioned in the research (do not invent one)
- date: in "D MMM YYYY" format, e.g. "17 Jun 2026"
- region: one of gcc / uk / europe / global
- category: one of card-networks / acquiring-psp / a2a / core-banking / digital-banks / issuing / fx

Research:
{research[:6000]}

Already on the page (do NOT include these URLs again):
{chr(10).join('- ' + r[3] for r in kept_rows)}

Only include items where the research explicitly states a real source URL.
If no URL is given for an item, exclude it entirely rather than guessing.
Return ONLY a valid JSON array, no markdown, no commentary.
"""
try:
    candidates = parse_json_array(ask(candidates_prompt, max_tokens=2500))
    print(f"  Extracted {len(candidates)} candidates")
except Exception as e:
    print(f"  Candidate parse failed: {e}")
    candidates = []

# ── Verify each candidate before trusting it ──────────────────────────────────
# This is the gate that matters most for this pipeline: a wrong link or a
# fabricated headline here is worse than the article pipeline's em-dash slip,
# since there's no further human-readable body text to catch it downstream.

print("Verifying candidates...")
verified = []
for c in candidates:
    if len(verified) >= MAX_NEW_ITEMS_PER_RUN:
        print(f"  Hit per-run cap of {MAX_NEW_ITEMS_PER_RUN}, stopping verification")
        break

    title = c.get("title", "").strip()
    url = c.get("url", "").strip()
    date_str = c.get("date", "").strip()
    region = c.get("region", "").strip().lower()
    category = c.get("category", "").strip().lower()

    if not (title and url and date_str and region in REGION_LABELS and category in CATEGORY_LABELS):
        print(f"  Skip (incomplete fields): {title[:60]}")
        continue

    if url in existing_urls:
        print(f"  Skip (duplicate URL): {title[:60]}")
        continue

    parsed_date = parse_row_date(date_str)
    if parsed_date is None:
        print(f"  Skip (unparseable date '{date_str}'): {title[:60]}")
        continue
    if parsed_date > today or parsed_date < cutoff:
        print(f"  Skip (date out of range {date_str}): {title[:60]}")
        continue

    if not url_resolves(url):
        print(f"  Skip (URL does not resolve): {url}")
        continue

    page_text = fetch_page_text(url)
    if not title_plausible_on_page(title, page_text):
        print(f"  Skip (title not corroborated on page): {title[:60]}")
        continue

    print(f"  Verified: [{region}/{category}] {title[:70]}")
    verified.append((region, category, date_str, url, title, parsed_date))
    existing_urls.add(url)

print(f"  {len(verified)} item(s) passed verification")

# ── Merge, sort newest-first, rebuild rows ────────────────────────────────────

all_rows = kept_rows + verified
all_rows.sort(key=lambda r: r[5] or datetime.date.min, reverse=True)

rows_html = "\n".join(
    make_news_row(date_str, region, category, title, url)
    for region, category, date_str, url, title, _ in all_rows
)

if not news_html:
    print("Could not fetch current news.html, aborting to avoid deploying a blank page.")
else:
    start_marker = '<div class="news-feed" id="newsFeed">'
    start_idx = news_html.find(start_marker)
    after_start = start_idx + len(start_marker) if start_idx != -1 else -1
    end_marker = '\n        </div>\n      </div>\n    </section>'
    end_idx = news_html.find(end_marker, after_start) if after_start != -1 else -1

    verification_errors = []
    if start_idx == -1 or end_idx == -1:
        verification_errors.append("could not locate news-feed container markers in live page")

    if not verification_errors:
        updated_html = news_html[:after_start] + "\n" + rows_html + news_html[end_idx:]

        if 'id="newsFeed"' not in updated_html:
            verification_errors.append("newsFeed container missing from rebuilt page")
        if not updated_html.strip().endswith("</html>"):
            verification_errors.append("rebuilt page does not end with </html>")
        row_count_check = len(re.findall(r'class="news-row"', updated_html))
        if row_count_check != len(all_rows):
            verification_errors.append(f"row count mismatch: expected {len(all_rows)}, found {row_count_check}")

    if verification_errors:
        print(f"VERIFICATION FAILED, skipping deploy: {'; '.join(verification_errors)}")
    else:
        print(f"Verification passed ({len(all_rows)} total items, {len(verified)} new, {expired_count} expired)")
        deploy_file("news.html", updated_html)
        commit_to_github(
            "snapshots/news.html",
            updated_html,
            f"Auto news update: +{len(verified)} new, -{expired_count} expired ({today_str})"
        )
