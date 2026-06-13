import anthropic, json, datetime, os, re, urllib.request, urllib.parse, base64

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
today = datetime.date.today().strftime("%B %d, %Y")
DEPLOY_URL = "https://www.madvisory.qa/deploy.php"
DEPLOY_TOKEN = os.environ["DEPLOY_TOKEN"]
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
REPO = "MikeM1602/madvisory-ticker"

def search(query):
    r = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
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
    url = f"https://www.madvisory.qa/{path}"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
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
            if result.get("status") == "ok":
                print(f"  Deployed {filename} ({result.get('bytes', 0):,} bytes)")
                return True
            else:
                print(f"  Deploy failed: {result}")
                return False
    except Exception as e:
        print(f"  Deploy error for {filename}: {e}")
        return False

def commit_draft(filename, content, message):
    api_url = f"https://api.github.com/repos/{REPO}/contents/drafts/{filename}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "madvisory-content-bot"}
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
            print(f"  Committed draft: drafts/{filename}")
    except Exception as e:
        print(f"  Draft commit failed: {e}")

def parse_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = "\n".join(text.split("\n")[1:-1]).strip()
    m = re.search(r'\[.*\]', text, re.DOTALL)
    if m:
        return json.loads(m.group())
    return json.loads(text)

print("Loading existing site content...")
reg_html = fetch_site_file("regulatory.html")
ins_html = fetch_site_file("insights.html")
existing_reg_titles = re.findall(r'<h3 class="reg-card-title">([^<]+)</h3>', reg_html)
existing_art_links = re.findall(r'href="(/insights-[^"]+\.html)"', ins_html)
existing_art_slugs = [l.split("/")[-1].replace(".html", "") for l in existing_art_links]
print(f"  Found {len(existing_reg_titles)} regulatory cards, {len(existing_art_links)} articles")

print("\nSearching for new regulatory developments...")
reg_search = search(f"""Search for significant NEW payments regulatory developments announced in the last 3-4 weeks as of {today}. Focus on GCC regulators (CBUAE, SAMA, QCB, CBB, CBK), European (EBA, ECB, FCA, PSR, ESMA), and Global (FATF, BIS, Visa/Mastercard). These are ALREADY covered - do NOT suggest them: {chr(10).join('- ' + t for t in existing_reg_titles)}. For each new development: name, authority, requirements, timeline, region (eu/uk/gcc/global), status (active/in-progress/imminent), and 2+ sources.""")

print("Generating regulatory cards...")
cards_text = ask(f"""Based on this research, generate 2-3 new regulatory cards. Research: {reg_search[:4000]}. Existing titles (do not duplicate): {chr(10).join('- ' + t for t in existing_reg_titles)}. Return a JSON array where each object has: title, region (eu/uk/gcc/global), badge_class (active/in-progress/imminent), badge_label, badge_i18n (badge_active/badge_inprogress/badge_imminent), description (2-3 sentences max 55 words), date_label, insight_slug (null). Return ONLY valid JSON array.""")

try:
    new_cards = parse_json(cards_text)
    print(f"  Generated {len(new_cards)} new cards")
except Exception as e:
    print(f"  Card parse failed: {e}")
    new_cards = []

if new_cards and reg_html:
    print("\nInjecting cards into regulatory.html...")
    updated_reg = reg_html
    for card in new_cards:
        region = card.get("region", "gcc")
        card_html = f'<div class="reg-card"><div class="reg-card-header"><span class="reg-badge {card["badge_class"]}" data-i18n="{card["badge_i18n"]}">{card["badge_label"]}</span></div><h3 class="reg-card-title">{card["title"]}</h3><p class="reg-card-desc">{card["description"]}</p><p class="reg-card-date">{card["date_label"]}</p></div>'
        pattern = f'data-country="{region}"'
        group_pos = updated_reg.find(pattern)
        if group_pos < 0:
            group_pos = updated_reg.find('data-country="gcc"')
        if group_pos >= 0:
            grid_start = updated_reg.find('<div class="reg-grid">', group_pos)
            if grid_start >= 0:
                depth, i = 1, grid_start + 22
                while i < len(updated_reg) and depth > 0:
                    if updated_reg[i:i+4] == '<div': depth += 1
                    elif updated_reg[i:i+6] == '</div>':
                        depth -= 1
                        if depth == 0:
                            updated_reg = updated_reg[:i] + "\n            " + card_html + "\n          " + updated_reg[i:]
                            print(f"  Injected '{card['title']}' into {region}")
                            break
                    i += 1
    if updated_reg != reg_html:
        deploy_file("regulatory.html", updated_reg)

print("\nSearching for new article topics...")
art_search = search(f"""Search for significant emerging topics in payments and fintech as of {today} valuable to a GCC/MENA payments advisory audience. Topics with existing articles (do NOT suggest these): {chr(10).join('- ' + s.replace('-', ' ') for s in existing_art_slugs)}. Find 1 new topic with substantial recent developments. Give key facts, data points, GCC/MENA angle, and 3+ sources.""")

print("Generating article metadata...")
meta_text = ask(f"""Based on this research, define metadata for one new insights article. Research: {art_search[:3000]}. Return a JSON object with: slug (starts with insights-, lowercase hyphens), title (under 12 words), meta_desc (under 155 chars), category (e.g. Open Banking · June 2026), h1, eyebrow (short category label), date (June 2026), readtime (number), card_desc (2 sentences max 40 words), card_eyebrow, region (Europe or GCC and MENA or Global). Return ONLY valid JSON object.""")

try:
    meta = json.loads(re.search(r'\{.*\}', meta_text, re.DOTALL).group())
    print(f"  Article: {meta['title']}")
except Exception as e:
    print(f"  Meta parse failed: {e}")
    meta = None

if meta:
    print("Writing article body...")
    art_body = ask(f"""Write a full insights article for a GCC/MENA payments advisory website. Topic research: {art_search[:4000]}. Title: {meta['title']}. Write 850-1000 words using this HTML structure: <p>opening paragraph</p><h2>section heading</h2><p>body paragraph</p> repeated for 4-5 sections including a GCC context section. Use <strong>term</strong> for first use of key technical terms only. Factual, specific, authoritative advisory tone. Return ONLY the HTML body content.""", max_tokens=2000)

    print("Building article HTML from template...")
    with open("/home/runner/work/madvisory-ticker/madvisory-ticker/update_ticker.py") as f:
        pass
    shell = fetch_site_file("insights-ai-payments.html")
    if not shell:
        print("  Could not fetch article template - skipping article generation")
    else:
        import re as re2
        shell = re2.sub(r'<title>[^<]+</title>', f'<title>{meta["title"]} | MENA Advisory</title>', shell)
        shell = re2.sub(r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{meta["meta_desc"]}"', shell)
        shell = re2.sub(r'<p class="article-category">[^<]+</p>', f'<p class="article-category">{meta["eyebrow"]}</p>', shell)
        shell = re2.sub(r'<h1 class="page-hero-title"[^>]*>[^<]+</h1>', f'<h1 class="page-hero-title" style="max-width:820px;">{meta["h1"]}</h1>', shell)
        shell = re2.sub(r'<p class="article-meta"[^>]*>[^<]+</p>', f'<p class="article-meta" style="margin-bottom:0;padding-bottom:0;border:none;">{meta["date"]} &nbsp;·&nbsp; {meta["readtime"]} min read &nbsp;·&nbsp; MENA Advisory</p>', shell)
        body_open = shell.find('<div class="article-body">')
        depth, i = 1, body_open + 26
        while i < len(shell) and depth > 0:
            if shell[i:i+4] == '<div': depth += 1
            elif shell[i:i+6] == '</div>':
                depth -= 1
                if depth == 0:
                    body_close = i + 6
                    break
            i += 1
        new_article = shell[:body_open] + f'<div class="article-body">\n{art_body}\n      </div>' + shell[body_close:]
        art_filename = f'{meta["slug"]}.html'
        deploy_file(art_filename, new_article)
        commit_draft(art_filename, new_article, f"Auto article: {meta['title']}")

        print("\nAdding card to insights.html...")
        if ins_html:
            new_card = f'<a href="/{art_filename}" class="news-card"><p class="news-card-eyebrow">{meta["card_eyebrow"]}</p><h3>{meta["title"]}</h3><p>{meta["card_desc"]}</p><p class="news-card-meta">{meta["date"]} · {meta["readtime"]} min</p></a>'
            sections = list(re.finditer(r'<p class="news-section-head"[^>]*>([^<]+)</p>\s*<div class="insights-grid">', ins_html))
            updated_ins = ins_html
            inserted = False
            target = "GCC" if "gcc" in meta.get("region","").lower() else "Europe"
            for sec in sections:
                if target.lower() in sec.group(1).lower():
                    grid_open = updated_ins.find('<div class="insights-grid">', sec.start())
                    if grid_open >= 0:
                        pos = grid_open + len('<div class="insights-grid">')
                        updated_ins = updated_ins[:pos] + "\n          " + new_card + updated_ins[pos:]
                        inserted = True
                        print(f"  Card added to {target} section")
                        break
            if not inserted:
                first = updated_ins.find('<a href="/insights-')
                if first >= 0:
                    updated_ins = updated_ins[:first] + new_card + "\n          " + updated_ins[first:]
            if updated_ins != ins_html:
                deploy_file("insights.html", updated_ins)

print("\nContent update complete")
