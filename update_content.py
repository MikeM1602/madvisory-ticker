import anthropic, sys, json, datetime, os, re, html, urllib.request, base64

if not os.environ.get("ANTHROPIC_API_KEY"):
    print("::warning::ANTHROPIC_API_KEY not set. Nothing was changed on the site.")
    sys.exit(0)
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
today      = datetime.date.today()
today_str  = today.strftime("%B %d, %Y")
this_month = today.strftime("%B %Y")
DEPLOY_URL   = "https://www.madvisory.qa/deploy.php"
DEPLOY_TOKEN = os.environ["DEPLOY_TOKEN"]
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
REPO         = "MikeM1602/madvisory-ticker"

# ── Static article shell template (embedded, not fetched live) ───────────────
# This is a known-good, version-controlled template. It is NOT fetched from the
# live site, because depending on a live file as a template means any bug,
# partial edit, or temporary breakage on that live file silently corrupts every
# article generated while it's broken. Update this constant deliberately when
# the site's design changes, and test the change before committing.
ARTICLE_VERSION = "v" + today.strftime("%Y%m%d")

ARTICLE_SHELL_TEMPLATE = open(os.path.join(os.path.dirname(__file__), "article_shell_template.html")).read() if os.path.exists(os.path.join(os.path.dirname(__file__), "article_shell_template.html")) else None

# ── Helpers ──────────────────────────────────────────────────────────────────────────

def api_stop(e):
    """No API credit or API outage: leave the live site untouched and end the run cleanly."""
    print(f"Anthropic API unavailable ({e}). Nothing was changed on the site.")
    print("::warning::Content not updated: Anthropic API unavailable (check the account credit balance).")
    sys.exit(0)

def create(**kwargs):
    try:
        return client.messages.create(**kwargs)
    except (anthropic.APIStatusError, anthropic.APIConnectionError) as e:
        api_stop(e)

def search(query):
    r = create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
        messages=[{"role": "user", "content": query}]
    )
    return "".join(b.text for b in r.content if hasattr(b, "text"))

def ask(prompt, max_tokens=2000):
    r = create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return "".join(b.text for b in r.content if hasattr(b, "text")).strip()

def fetch_site_file(path):
    try:
        req = urllib.request.Request(f"https://www.madvisory.qa/{path}", headers={"User-Agent": "MadvisoryContentBot/1.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode("utf-8")
    except Exception as e:
        print(f"  Warning: could not fetch {path}: {e}")
        return ""

DEPLOY_FAILURES = 0

def deploy_file(filename, content):
    global DEPLOY_FAILURES
    payload = json.dumps({"filename": filename, "content": content}).encode()
    req = urllib.request.Request(DEPLOY_URL, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Deploy-Token", DEPLOY_TOKEN)
    req.add_header("User-Agent", "MadvisoryContentBot/1.0")
    raw = b""
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            result = json.loads(raw)
            if result.get("ok"):
                print(f"  ✓ Deployed {filename} ({result.get('bytes', 0):,} bytes)")
                return True
            print(f"  ✗ Deploy failed: {result}")
            DEPLOY_FAILURES += 1
            return False
    except Exception as e:
        # Show what the server actually sent back (a bot-protection page, for example)
        print(f"  ✗ Deploy error {filename}: {e}")
        if raw:
            print(f"    Response started: {raw[:200]!r}")
        print(f"::error::Deploy of {filename} failed: {e}")
        DEPLOY_FAILURES += 1
        return False

def commit_to_github(path, content, message):
    api_url = f"https://api.github.com/repos/{REPO}/contents/{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "madvisory-content-bot",
    }
    sha = None
    try:
        with urllib.request.urlopen(urllib.request.Request(api_url, headers=headers)) as r:
            sha = json.loads(r.read())["sha"]
    except:
        pass
    payload = {"message": message, "content": base64.b64encode(content.encode()).decode()}
    if sha:
        payload["sha"] = sha
    try:
        req = urllib.request.Request(api_url, data=json.dumps(payload).encode(), method="PUT", headers=headers)
        with urllib.request.urlopen(req):
            print(f"  ✓ Committed {path}")
    except Exception as e:
        print(f"  ✗ GitHub commit failed: {e}")

def parse_json_array(text):
    text = text.strip()
    if text.startswith("```"):
        text = "\n".join(text.split("\n")[1:-1]).strip()
    m = re.search(r'\[.*\]', text, re.DOTALL)
    return json.loads(m.group()) if m else json.loads(text)

def parse_json_object(text):
    text = text.strip()
    if text.startswith("```"):
        text = "\n".join(text.split("\n")[1:-1]).strip()
    m = re.search(r'\{.*\}', text, re.DOTALL)
    return json.loads(m.group()) if m else json.loads(text)

def is_new(date_str):
    """Return True if the date string contains the current or previous month of 2026."""
    months_2026 = ["January 2026","February 2026","March 2026","April 2026",
                   "May 2026","June 2026","July 2026","August 2026",
                   "September 2026","October 2026","November 2026","December 2026"]
    # Consider 'new' if in the last ~6 weeks (current month or one before)
    idx = today.month - 1  # 0-indexed
    recent = [months_2026[max(0, idx-1)], months_2026[idx]]
    return any(m in date_str for m in recent)

# ── Arabic helpers ────────────────────────────────────────────────────────────────────────
# Everything the weekly run publishes also gets Arabic. main.js shows it in Arabic
# mode: data-ar="..." swaps an element's text, and data-lang-block="ar" holds the
# Arabic copy of an article body. If a translation fails, the English is published
# on its own and the site shows English in Arabic mode, as before.

ARABIC_RE = re.compile(r"[\u0600-\u06FF]")
AR_MONTHS = {"January": "يناير", "February": "فبراير", "March": "مارس", "April": "أبريل",
             "May": "مايو", "June": "يونيو", "July": "يوليو", "August": "أغسطس",
             "September": "سبتمبر", "October": "أكتوبر", "November": "نوفمبر", "December": "ديسمبر"}
AR_STYLE = ("Translate into Modern Standard Arabic for a professional payments advisory website. "
            "Keep company, product, scheme, regulator acronyms and law names that are usually written "
            "in Latin script (for example PSD3, CBUAE, SAMA, QCB) in Latin script. Keep numbers, dates "
            "and currencies exact. Do not add, drop or soften any information.")

def ar_attr(text):
    return f' data-ar="{html.escape(text, quote=True)}"' if text else ""

def ar_date(date_str):
    """'September 2026' -> 'سبتمبر 2026' (anything unrecognised is returned unchanged)."""
    for en, ar in AR_MONTHS.items():
        date_str = date_str.replace(en, ar)
    return date_str

def ar_readtime(minutes):
    n = int(minutes)
    return f"قراءة {n} {'دقائق' if 3 <= n <= 10 else 'دقيقة'}"

def translate_fields(fields):
    """fields: dict of short English strings. Returns a dict with the same keys;
    any value that could not be translated is an empty string."""
    empty = {k: "" for k in fields}
    if not fields:
        return empty
    prompt = (AR_STYLE + " Translate each value of this JSON object. Return ONLY a JSON object "
              "with exactly the same keys.\n\n" + json.dumps(fields, ensure_ascii=False))
    try:
        out = parse_json_object(ask(prompt, max_tokens=3000))
    except Exception as e:
        print(f"  Arabic translation failed: {e}")
        return empty
    result = {}
    for k in fields:
        v = str(out.get(k, "")).strip()
        result[k] = v if ARABIC_RE.search(v) and "<" not in v and ">" not in v else ""
    return result

def translate_body(body_html):
    """Arabic version of an article body, same HTML tags. Empty string if it fails checks."""
    prompt = (AR_STYLE + " Translate this article body HTML. Keep every HTML tag exactly as it is "
              "and translate only the text between tags. Do not use the em dash character. "
              "Return ONLY the translated HTML.\n\n" + body_html)
    try:
        ar = ask(prompt, max_tokens=6000)
    except Exception as e:
        print(f"  Arabic body translation failed: {e}")
        return ""
    ar = re.sub(r"^```[a-z]*\s*|\s*```$", "", ar.strip())
    tags = lambda t: [x for x in re.findall(r"</?([a-z0-9]+)", t.lower())]
    if not ARABIC_RE.search(ar):
        print("  Arabic body rejected: no Arabic text")
        return ""
    if tags(ar) != tags(body_html):
        print("  Arabic body rejected: HTML structure differs from the English")
        return ""
    if len(ar) < 0.5 * len(body_html):
        print("  Arabic body rejected: much shorter than the English")
        return ""
    return ar

# ── Month sort key ──────────────────────────────────────────────────────────────────────

MONTH_ORDER = {
    "January":1,"February":2,"March":3,"April":4,"May":5,"June":6,
    "July":7,"August":8,"September":9,"October":10,"November":11,"December":12
}

def date_sort_key(date_str):
    """Extract (year, month) for sorting newest-first. Higher = newer."""
    m = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(202\d)', date_str)
    if m:
        return (int(m.group(2)), MONTH_ORDER.get(m.group(1), 0))
    return (0, 0)

# ── Load existing site content ────────────────────────────────────────────────────────────────

print("Loading existing site content...")
reg_html = fetch_site_file("regulatory.html")
ins_html = fetch_site_file("insights.html")

existing_reg_titles = re.findall(r'<h3 class="reg-card-title"[^>]*>([^<]+)</h3>', reg_html)
existing_art_links  = re.findall(r'href="(/insights-[^"]+\.html)"', ins_html)
existing_art_slugs  = [l.split("/")[-1].replace(".html","") for l in existing_art_links]
print(f"  Found {len(existing_reg_titles)} regulatory cards, {len(existing_art_links)} articles")
if not reg_html or not ins_html or not existing_reg_titles or not existing_art_links:
    # The live site always has cards and articles. Finding none means the pages were not
    # read properly, and carrying on would skip the duplicate-topic check and break the card lists.
    print("::error::Could not read the live regulatory.html or insights.html (0 cards or articles found). Stopping without changing the site.")
    sys.exit(1)

# ── REGULATORY HUB UPDATE ────────────────────────────────────────────────────────────────

print("\n── Regulatory Hub ────────────────────────────────────────────────────────────")

KNOWN_GAPS = """
Priority regulatory developments that may not yet be covered:
- QCB Qatar: Payment Services circular updates and open banking consultations 2026
- CBUAE: Open Finance Framework implementation milestones 2026
- CBB Bahrain: PSP and exchange house licensing updates 2026
- CBK Kuwait: Payment system regulatory updates 2026
- UK FCA: Payments Regulation review / PISEC outcomes 2026
- SAMA: Merchant surcharging rules and scheme fee guidance 2026
- EBA: Fraud reporting requirements under PSD3/PSR 2026
- BIS/G20: Cross-border payments roadmap Phase 3 milestones 2026
- ECB: Digital euro preparation phase progress and timeline
- FATF: Sunrise issue resolution for Travel Rule 2026
"""

print("Searching for 2026 regulatory developments...")
reg_research = search(f"""
Today is {today_str}. Search for significant payments regulatory developments 
announced or effective in 2026 across GCC, Europe, UK and globally. 
Focus especially on:
{KNOWN_GAPS}

Already covered (do NOT suggest these):
{chr(10).join('- ' + t for t in existing_reg_titles)}

For each new development provide: exact regulation name, authority, 
key requirement/milestone, effective date, region, current status, and sources.
""")

print("Generating new regulatory cards...")
cards_prompt = f"""
Based on this research, generate 3-4 new regulatory cards for a GCC/MENA payments advisory website.
Each card should be a concrete, specific regulatory development from 2026 not already covered.

Research:
{reg_research[:5000]}

Already on site (do NOT duplicate):
{chr(10).join('- ' + t for t in existing_reg_titles)}

Return a JSON array. Each object must have:
- title: exact regulation name (under 12 words)
- region: one of eu / uk / gcc / global
- badge_class: one of active / in-progress / imminent
- badge_label: "Active" or "In Progress" or "Imminent"
- badge_i18n: badge_active or badge_inprogress or badge_imminent
- description: 2-3 sentences, max 55 words, specific and factual
- date_label: e.g. "Effective January 2026" or "Consultation closes Q3 2026"
- sort_date: e.g. "June 2026" (for ordering newest first)
- is_new: true if announced or effective in {this_month} or the prior month

Return ONLY valid JSON array, no markdown. Do not use the em dash character (—)
anywhere in any field; use a comma, full stop, or colon instead.
"""
try:
    new_cards = parse_json_array(ask(cards_prompt, max_tokens=2500))
    print(f"  Generated {len(new_cards)} new cards")
except Exception as e:
    print(f"  Card parse failed: {e}")
    new_cards = []

# Sort new cards newest-first
new_cards.sort(key=lambda c: date_sort_key(c.get("sort_date","January 2020")), reverse=True)

if new_cards:
    print("Translating new regulatory cards into Arabic...")
    fields = {}
    for i, card in enumerate(new_cards):
        fields[f"t{i}"] = card.get("title", "")
        fields[f"d{i}"] = card.get("description", "")
        fields[f"w{i}"] = card.get("date_label", "")
    ar = translate_fields(fields)
    for i, card in enumerate(new_cards):
        card["ar_title"], card["ar_description"], card["ar_date_label"] = ar[f"t{i}"], ar[f"d{i}"], ar[f"w{i}"]

if new_cards and reg_html:
    print("Injecting cards into regulatory.html...")
    updated_reg = reg_html

    # Remove any existing NEW badges (we'll re-add based on fresh sort_date)
    updated_reg = re.sub(r'<span class="new-badge"[^>]*>NEW</span>\s*', '', updated_reg)

    for card in new_cards:
        region = card.get("region", "gcc").lower()
        new_badge = '<span class="new-badge" style="display:inline-block;background:var(--accent);color:#040810;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;padding:2px 7px;border-radius:3px;margin-left:8px;vertical-align:middle;" data-ar="جديد">NEW</span>' if card.get("is_new") else ""
        card_html = (
            f'<div class="reg-card">'
            f'<div class="reg-card-header">'
            f'<span class="reg-badge {card["badge_class"]}" data-i18n="{card["badge_i18n"]}">{card["badge_label"]}</span>'
            f'{new_badge}'
            f'</div>'
            f'<h3 class="reg-card-title"{ar_attr(card.get("ar_title", ""))}>{card["title"]}</h3>'
            f'<p class="reg-card-desc"{ar_attr(card.get("ar_description", ""))}>{card["description"]}</p>'
            f'<p class="reg-card-date"{ar_attr(card.get("ar_date_label", ""))}>{card["date_label"]}</p>'
            f'</div>'
        )
        # Find the correct region group and prepend inside its reg-grid (newest first)
        pattern = f'data-country="{region}"'
        group_pos = updated_reg.find(pattern)
        if group_pos < 0:
            group_pos = updated_reg.find('data-country="gcc"')
        if group_pos >= 0:
            grid_start = updated_reg.find('<div class="reg-grid">', group_pos)
            if grid_start >= 0:
                insert_pos = grid_start + len('<div class="reg-grid">')
                updated_reg = (
                    updated_reg[:insert_pos]
                    + "\n            " + card_html
                    + updated_reg[insert_pos:]
                )
                print(f"  Prepended '{card['title']}' → {region}")

    if updated_reg != reg_html:
        if "data-burger" not in updated_reg or "ticker-bar" not in updated_reg:
            print("  ✗ VERIFICATION FAILED: standard site shell missing from updated regulatory.html, skipping deploy.")
        else:
            deploy_file("regulatory.html", updated_reg)
            commit_to_github("snapshots/regulatory.html", updated_reg, f"Regulatory hub update: {today_str}")

# ── INSIGHTS UPDATE ──────────────────────────────────────────────────────────────────

print("\n── Insights Articles ────────────────────────────────────────────────────────────")

ARTICLE_GAPS = """
High-priority topics not yet covered that are relevant to GCC/MENA payments professionals:
- Open Banking VRPs (Variable Recurring Payments): UK progress and lessons for the GCC
- ISO 20022 migration: practical operational impact for GCC banks
- Network tokenisation and card-on-file: what GCC issuers and merchants need to do
- Merchant surcharging and scheme fee transparency rules in the GCC
- Payment fraud data sharing between banks and PSPs: UK and GCC approaches

Topics already covered on the site (do NOT write another article on these, even under
a different title): BNPL regulation, stablecoin regulation, cross-border remittances,
card scheme fees, GCC instant payments, open banking go-live, Qatar payments regulation,
PSD3/PSR, EU AI Act, digital euro, tokenised settlement, agentic commerce, A2A payments,
APP fraud, AML/KYC/PEP, card issuing, B2B fintech, AI in payments.
"""

print("Researching article topics...")
art_research = search(f"""
Today is {today_str}. Search for recent (2026) developments on these topics
relevant to payments professionals in GCC, MENA and Europe:
{ARTICLE_GAPS}

Existing articles (do NOT suggest these):
{chr(10).join('- ' + s.replace('-',' ') for s in existing_art_slugs)}

For the single most newsworthy and substantive topic, provide:
- specific regulatory announcements and dates
- market data and statistics from 2026
- GCC/MENA specific angle
- at least 3 named sources with URLs
""")

print("Generating article metadata...")
meta_prompt = f"""
Based on this research, choose the single strongest topic and define the article metadata.

Research:
{art_research[:4000]}

Existing slugs (do not duplicate):
{chr(10).join('- ' + s for s in existing_art_slugs)}

Return a JSON object with:
- slug: starts with insights-, lowercase with hyphens only (e.g. insights-bnpl-gcc-2026)
- title: under 12 words, specific and direct
- meta_desc: under 155 chars
- h1: full article heading (can be longer than title)
- eyebrow: short category label (e.g. "Regulation · GCC")
- date: month and year (e.g. "June 2026")
- readtime: integer minutes (8-12)
- card_eyebrow: very short (e.g. "BNPL · GCC")  
- card_desc: 2 sentences, max 40 words, what the article covers
- region: "GCC and MENA" or "Europe" or "Global"
- is_new: true (it's being published now)

Return ONLY valid JSON object, no markdown. Do not use the em dash character (—)
anywhere in any field; use a comma, full stop, or colon instead.
"""
try:
    meta = parse_json_object(ask(meta_prompt, max_tokens=800))
    print(f"  Article: {meta['title']}")
except Exception as e:
    print(f"  Meta parse failed: {e}")
    meta = None

if meta:
    print("Writing article body...")
    body_prompt = f"""
Write a full insights article for a GCC/MENA payments advisory website.

Topic research: {art_research[:5000]}
Title: {meta['title']}
Target audience: CFOs, Heads of Payments, Compliance Directors, PE investors in payments

Structure (850-1000 words of body HTML):
<p>Opening paragraph. State the significance immediately.</p>
<h2>Section heading</h2>
<p>Body paragraph with specific facts and data</p>
... repeat for 4-5 sections ...

Requirements:
- Include a dedicated GCC/MENA context section
- Use <strong>term</strong> only for first use of key technical terms
- Specific dates, figures, named regulators and regulations throughout
- Conclude with what payments firms should do now
- Authoritative advisory tone. No fluff, no AI sounding language
- UK English spelling

CRITICAL PUNCTUATION RULE:
- Never use the em dash character (—) anywhere in the output, under any
  circumstances. Not in headings, not in body text, not as a separator.
- Where you would naturally reach for an em dash to join two clauses, restructure
  the sentence instead: use a full stop and start a new sentence, use a comma,
  use a colon for a list or explanation, or use the word "and" or "which".
- Before finishing, mentally re-read your own output and rewrite any sentence
  that still contains an em dash.

Return ONLY the HTML body content, no wrapper tags.
"""
    art_body = ask(body_prompt, max_tokens=2500)

    print("Translating article into Arabic...")
    art_ar = translate_fields({
        "title": meta["title"], "h1": meta["h1"], "eyebrow": meta["eyebrow"],
        "card_eyebrow": meta["card_eyebrow"], "card_desc": meta["card_desc"],
    })
    art_body_ar = translate_body(art_body)
    ar_meta_line = f'{ar_date(meta["date"])} · {ar_readtime(meta["readtime"])} · MENA Advisory'
    print(f"  Arabic: fields {sum(1 for v in art_ar.values() if v)}/5, body {'yes' if art_body_ar else 'no'}")

    # Build article using the embedded static template (NOT fetched from the live site)
    print("Building article page...")

    if ARTICLE_SHELL_TEMPLATE is None:
        print("  ✗ FATAL: article_shell_template.html not found alongside script. Skipping article deploy.")
        new_article = None
    else:
        new_article = ARTICLE_SHELL_TEMPLATE
        new_article = new_article.replace("__TITLE__", meta["title"])
        new_article = new_article.replace("__META_DESC__", meta["meta_desc"])
        new_article = new_article.replace("__SLUG__", meta["slug"])
        new_article = new_article.replace("__OG_TITLE__", meta["title"])
        new_article = new_article.replace("__EYEBROW__", meta["eyebrow"])
        new_article = new_article.replace("__H1__", meta["h1"])
        new_article = new_article.replace("__DATE__", meta["date"])
        new_article = new_article.replace("__READTIME__", str(meta["readtime"]))
        new_article = new_article.replace("__VERSION__", ARTICLE_VERSION)
        new_article = new_article.replace("__AR_TITLE__", html.escape(art_ar["title"], quote=True))
        new_article = new_article.replace("__EYEBROW_AR__", html.escape(art_ar["eyebrow"], quote=True))
        new_article = new_article.replace("__H1_AR__", html.escape(art_ar["h1"], quote=True))
        new_article = new_article.replace("__META_AR__", html.escape(ar_meta_line, quote=True))
        new_article = new_article.replace(
            "__ARTICLE_BODY_AR_BLOCK__",
            f'<div data-lang-block="ar" hidden>\n{art_body_ar}\n</div>' if art_body_ar else "")
        new_article = new_article.replace("__ARTICLE_BODY__", art_body)

        # ── Verify before deploying ───────────────────────────────────────────────────────────────
        # Catches the exact failure mode hit previously: a substitution silently
        # not landing, leaving placeholder text or stale content live.
        verification_errors = []
        remaining_placeholders = [
            ph for ph in ["__TITLE__", "__META_DESC__", "__SLUG__", "__OG_TITLE__",
                          "__EYEBROW__", "__H1__", "__DATE__", "__READTIME__",
                          "__VERSION__", "__ARTICLE_BODY__", "__AR_TITLE__", "__EYEBROW_AR__",
                          "__H1_AR__", "__META_AR__", "__ARTICLE_BODY_AR_BLOCK__"]
            if ph in new_article
        ]
        if remaining_placeholders:
            verification_errors.append(f"unresolved placeholders: {remaining_placeholders}")
        if meta["h1"] not in new_article:
            verification_errors.append("H1 text not found in final HTML")
        if "data-burger" not in new_article or "ticker-bar" not in new_article:
            verification_errors.append("missing standard site shell elements (burger/ticker)")
        if art_body[:60] not in new_article:
            verification_errors.append("generated article body not found in final HTML")
        if 'data-lang-block="en"' not in new_article:
            verification_errors.append("article template is missing the English body block (data-lang-block)")
        em_dash_count = len(re.findall(r"—", new_article))
        if em_dash_count > 5:  # small allowance for headings/labels, not body prose
            verification_errors.append(f"{em_dash_count} em-dashes found, expected near zero")

        if verification_errors:
            print(f"  ✗ VERIFICATION FAILED, skipping deploy: {'; '.join(verification_errors)}")
            new_article = None
        else:
            print("  ✓ Verification passed (H1 matches, shell intact, body present, em-dashes minimal)")

        if new_article is not None:
            art_filename = f'{meta["slug"]}.html'
            article_ok = deploy_file(art_filename, new_article)
            commit_to_github(f"drafts/{art_filename}", new_article, f"Auto article: {meta['title']}")

            # ── Add card to insights.html, sorted newest first ─────────────────────────────────
            print("Updating insights.html card list...")
            if not article_ok:
                print("  Article was not deployed, so no card or sitemap entry will be added.")
            if ins_html and article_ok:
                new_badge = (' <span style="display:inline-block;background:var(--accent);color:#040810;'
                            'font-size:0.65rem;font-weight:700;letter-spacing:0.08em;padding:1px 6px;'
                            'border-radius:3px;margin-left:6px;vertical-align:middle;" data-ar="جديد">NEW</span>'
                            if meta.get("is_new") else "")

                new_card = (
                    f'<a href="/{art_filename}" class="news-card" style="text-decoration:none;">'
                    f'<p class="news-card-eyebrow"{ar_attr(art_ar["card_eyebrow"])}>{meta["card_eyebrow"]}</p>'
                    f'<h3{ar_attr(art_ar["title"])}>{meta["title"]}{new_badge}</h3>'
                    f'<p{ar_attr(art_ar["card_desc"])}>{meta["card_desc"]}</p>'
                    # data-ar must come before class here: card_date_key() matches 'class="news-card-meta">'
                    f'<p{ar_attr(ar_date(meta["date"]) + " · " + ar_readtime(meta["readtime"]))} class="news-card-meta">{meta["date"]} · {meta["readtime"]} min read</p>'
                    f'</a>'
                )

                # Collect all existing cards with their dates, prepend new one, re-sort
                # Extract all news-card blocks
                card_blocks = re.findall(
                    r'<a\s+href="/insights-[^"]+"\s+class="news-card[^"]*"[^>]*>.*?</a>',
                    ins_html, re.DOTALL
                )

                def card_date_key(card_html):
                    m = re.search(r'class="news-card-meta">([^<]+)</p>', card_html)
                    return date_sort_key(m.group(1)) if m else (0,0)

                all_cards = [new_card] + card_blocks
                all_cards.sort(key=card_date_key, reverse=True)

                # Mark the most recent card(s) as NEW if published this or last month
                marked = []
                for c in all_cards:
                    meta_m = re.search(r'class="news-card-meta">([^<]+)</p>', c)
                    date_str = meta_m.group(1) if meta_m else ""
                    if is_new(date_str) and 'NEW</span>' not in c:
                        # Add NEW badge to h3 if not already there
                        c = re.sub(r'(<h3>[^<]+)(</h3>)',
                                   r'\1 <span style="display:inline-block;background:var(--accent);color:#040810;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;padding:1px 6px;border-radius:3px;margin-left:6px;vertical-align:middle;" data-ar="جديد">NEW</span>\2',
                                   c, count=1)
                    marked.append(c)

                cards_html = "\n          ".join(marked)

                # Replace the entire cards-grid content
                updated_ins = re.sub(
                    r'(<div class="cards-grid[^"]*">)\s*.*?(\s*</div>\s*</div>\s*</section>)',
                    f'\\1\n          {cards_html}\n        \\2',
                    ins_html, flags=re.DOTALL, count=1
                )

                if updated_ins != ins_html:
                    if "data-burger" not in updated_ins or "ticker-bar" not in updated_ins:
                        print("  ✗ VERIFICATION FAILED: standard site shell missing from updated insights.html, skipping deploy.")
                    else:
                        deploy_file("insights.html", updated_ins)
                        commit_to_github("snapshots/insights.html", updated_ins, f"Insights update: {meta['title']}")
                else:
                    print("  No change detected in insights.html — check card grid selector")
        else:
            print("  Skipping insights.html card insertion since article failed verification.")

# ── SITEMAP ─────────────────────────────────────────────────────────────────────────────────
try:
    if new_article is not None and article_ok:
        sm = fetch_site_file("sitemap.xml")
        loc = f"https://www.madvisory.qa/{art_filename}"
        if sm and "</urlset>" in sm and loc not in sm:
            entry = (f"<url><loc>{loc}</loc><lastmod>{today.isoformat()}</lastmod>"
                     f"<changefreq>monthly</changefreq><priority>0.7</priority></url>\n")
            deploy_file("sitemap.xml", sm.replace("</urlset>", entry + "</urlset>"))
            print(f"  Added {art_filename} to sitemap.xml")
except NameError:
    pass  # no article was written this run

if DEPLOY_FAILURES:
    print(f"::error::{DEPLOY_FAILURES} deploy(s) failed. See the log above.")
    sys.exit(1)

print("\n✓ Content update complete")
