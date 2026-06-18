"""
backup_site.py — one-shot backup of all live madvisory.qa files to backups/ in the repo.
Run manually via workflow_dispatch when needed. Safe to re-run; updates existing files.
"""
import urllib.request, base64, json, os, datetime

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
REPO = "MikeM1602/madvisory-ticker"
today_str = datetime.date.today().strftime("%d %b %Y")

FILES = [
    "index.html",
    "insights.html",
    "regulatory.html",
    "news.html",
    "careers.html",
    "contact.html",
    "sitemap.xml",
    "style.css",
    "main.js",
    "deploy.php",
    "services/due-diligence.html",
    "services/strategic-planning.html",
    "services/digital-transformation.html",
    "services/electronic-payments.html",
    "solutions/payments-infrastructure.html",
    "solutions/acquiring-acceptance.html",
    "solutions/compliance-risk.html",
    "solutions/digital-emerging.html",
    "solutions/licensing-market-entry.html",
]

def fetch_live(path):
    url = f"https://www.madvisory.qa/{path}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MadvisoryBackupBot/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.read()
    except Exception as e:
        print(f"  FETCH FAILED {path}: {e}")
        return None

def commit(repo_path, content_bytes, message):
    api_url = f"https://api.github.com/repos/{REPO}/contents/{repo_path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "MadvisoryBackupBot/1.0",
    }
    # Get existing SHA if file already exists
    sha = None
    try:
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as r:
            sha = json.loads(r.read())["sha"]
    except Exception:
        pass

    payload = {
        "message": message,
        "content": base64.b64encode(content_bytes).decode(),
    }
    if sha:
        payload["sha"] = sha

    try:
        req = urllib.request.Request(
            api_url,
            data=json.dumps(payload).encode(),
            method="PUT",
            headers=headers,
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            status = json.loads(r.read())
            action = "Updated" if sha else "Created"
            print(f"  {action}: {repo_path} ({len(content_bytes):,} bytes)")
            return True
    except Exception as e:
        print(f"  COMMIT FAILED {repo_path}: {e}")
        return False

print(f"Starting site backup — {today_str}")
print(f"Backing up {len(FILES)} files to backups/ in {REPO}\n")

success, failed = 0, 0
for path in FILES:
    print(f"  {path}...")
    content = fetch_live(path)
    if content is None:
        failed += 1
        continue
    repo_path = f"backups/{path}"
    ok = commit(repo_path, content, f"Backup {path} — {today_str}")
    if ok:
        success += 1
    else:
        failed += 1

print(f"\nDone: {success} files backed up, {failed} failed.")
