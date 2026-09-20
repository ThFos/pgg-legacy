import os
import re
import html
import json
import subprocess
import urllib.request
from datetime import datetime

today = datetime.now().strftime("%Y-%m-%d")
base_url = "https://pgglegacy.gr"

# ─────────────────────────────────────────
# ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ
# ─────────────────────────────────────────

def to_rfc822(date_str):
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%a, %d %b %Y 00:00:00 GMT")
    except Exception:
        return datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT")


def parse_frontmatter(content):
    """
    Διαβάζει το YAML frontmatter μεταξύ των πρώτων δύο '---'.
    Χειρίζεται σωστά τιμές που περιέχουν ':' (π.χ. description).
    """
    data = {}
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return data

    fm_block = match.group(1)

    for line in fm_block.splitlines():
        if ":" not in line or line.startswith(" "):
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip().strip('"\'')
        if key:
            data[key] = val

    return data


def resolve_image_url(img_path, article_loc):
    """
    Μετατρέπει οποιαδήποτε image path σε πλήρες URL.

    Με το νέο config.yml:
      public_folder: "/blog/media"
      → το frontmatter γράφει: /blog/media/filename.webp
      → πιάνεται από το startswith("/") branch → base_url + /blog/media/filename.webp ✅

    Καλύπτει επίσης παλιά άρθρα με relative paths.
    """
    if not img_path or not img_path.strip():
        return None

    img_path = img_path.strip()

    # Απόλυτα URLs (http/https)
    if img_path.startswith("http://") or img_path.startswith("https://"):
        return img_path

    # Absolute path - /blog/media/image.webp → https://pgglegacy.gr/blog/media/image.webp
    if img_path.startswith("/"):
        return f"{base_url}{img_path}"

    # Relative path - για παλιά άρθρα που μπορεί να έχουν "./image.webp" ή "image.webp"
    if img_path.startswith("./"):
        img_filename = img_path[2:]   # Αφαίρεσε "./" - ΟΧΙ με lstrip (bug)
    else:
        img_filename = img_path

    article_loc_clean = article_loc.rstrip("/") + "/"
    return f"{base_url}{article_loc_clean}{img_filename}"


def send_discord_notification(article):
    webhook_url = os.environ.get("DISCORD_WEBHOOK")
    if not webhook_url:
        print("DISCORD_WEBHOOK environment variable not set. Skipping Discord notification.")
        return

    full_url = f"{base_url}{article['loc']}"

    embed_data = {
        "title": article["title"],
        "url": full_url,
        "description": article["description"] if article["description"] else "Διαβάστε το νέο μας άρθρο στο blog!",
        "color": 1710369,
        "footer": {
            "text": "PGG Legacy Blog"
        }
    }

    img_url = resolve_image_url(article.get("image", ""), article["loc"])
    if img_url:
        embed_data["image"] = {"url": img_url}
        print(f"  Image URL: {img_url}")
    else:
        print("  Δεν βρέθηκε εικόνα για αυτό το άρθρο.")

    payload = {
        "content": "📢 **Νέο άρθρο στο PGG Legacy Blog!**",
        "embeds": [embed_data]
    }

    req = urllib.request.Request(
        webhook_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Discord notification sent successfully! Status: {response.status}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"Discord HTTP error {e.code}: {error_body}")
    except Exception as e:
        print(f"Failed to send Discord notification: {e}")


# ─────────────────────────────────────────
# ΣΥΛΛΟΓΗ ΑΡΘΡΩΝ ΑΠΟ ΤΟ BLOG/
# ─────────────────────────────────────────

static_pages = [
    {"comment": "Αρχική Σελίδα",                      "loc": "/",         "lastmod": today, "changefreq": "weekly",  "priority": "1.0"},
    {"comment": "Πολιτική Απορρήτου (Privacy Policy)", "loc": "/privacy/", "lastmod": today, "changefreq": "monthly", "priority": "0.3"},
    {"comment": "Blog Index",                          "loc": "/blog/",    "lastmod": today, "changefreq": "weekly",  "priority": "0.8"},
]

other_pages = [
    {"comment": "Leaderboard",         "loc": "/leaderboard/", "lastmod": today, "changefreq": "hourly",  "priority": "0.9"},
    {"comment": "Police Applications", "loc": "/police/",      "lastmod": today, "changefreq": "weekly",  "priority": "0.5"},
    {"comment": "Server Map",          "loc": "/map/",         "lastmod": today, "changefreq": "monthly", "priority": "0.7"},
]

blog_articles = []
seen_locs    = set()
blog_dir     = "blog"

if os.path.exists(blog_dir):
    for root, dirs, files in os.walk(blog_dir):
        path_parts = root.replace("\\", "/").split("/")
        # Παράλειψε φακέλους media/assets
        if any(part in ("media", "assets") for part in path_parts):
            continue

        for file in files:
            if not file.endswith((".md", ".html")):
                continue

            full_path = os.path.join(root, file)
            rel_file  = os.path.relpath(full_path, blog_dir).replace("\\", "/")

            # Παράλειψε το blog/index
            if rel_file in ("index.md", "index.html"):
                continue

            if file in ("index.md", "index.html"):
                slug = os.path.dirname(rel_file).strip("/")
            else:
                slug = os.path.splitext(rel_file)[0].strip("/")

            if not slug or slug == ".":
                continue

            url_path = f"/blog/{slug}/"

            # Αποφυγή διπλότυπων με set (γρηγορότερο από any())
            if url_path in seen_locs:
                continue
            seen_locs.add(url_path)

            article_date  = today
            article_title = slug.split("/")[-1].replace("-", " ").title()
            article_desc  = ""
            article_img   = ""

            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()

                fm = parse_frontmatter(content)

                if fm.get("date"):
                    date_match = re.search(r"(\d{4}-\d{2}-\d{2})", fm["date"])
                    if date_match:
                        article_date = date_match.group(1)

                article_title = fm.get("title")       or article_title
                article_desc  = fm.get("description") or ""
                article_img   = fm.get("image")       or ""

            except Exception as e:
                print(f"  Σφάλμα ανάγνωσης {full_path}: {e}")

            print(f"  Βρέθηκε άρθρο: {url_path} | image='{article_img}'")

            blog_articles.append({
                "loc":         url_path,
                "title":       article_title,
                "description": article_desc,
                "image":       article_img,
                "lastmod":     article_date,
                "changefreq":  "monthly",
                "priority":    "0.7"
            })


# ─────────────────────────────────────────
# 1. ΔΗΜΙΟΥΡΓΙΑ SITEMAP.XML
# ─────────────────────────────────────────

xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
]

def add_url(p):
    if p.get("comment"):
        xml.append(f"  <!-- {html.escape(p['comment'])} -->")
    xml.append("  <url>")
    xml.append(f"    <loc>{html.escape(base_url + p['loc'])}</loc>")
    xml.append(f"    <lastmod>{p['lastmod']}</lastmod>")
    xml.append(f"    <changefreq>{p['changefreq']}</changefreq>")
    xml.append(f"    <priority>{p['priority']}</priority>")
    xml.append("  </url>\n")

for p in static_pages:
    add_url(p)

if blog_articles:
    xml.append("  <!-- Blog Articles -->")
    for p in sorted(blog_articles, key=lambda x: x["lastmod"], reverse=True):
        add_url(p)

for p in other_pages:
    add_url(p)

xml.append("</urlset>")

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(xml))

print("✅ sitemap.xml δημιουργήθηκε.")


# ─────────────────────────────────────────
# 2. ΔΗΜΙΟΥΡΓΙΑ FEED.XML (RSS)
# ─────────────────────────────────────────

now_rfc = datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT")

rss = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>PGG Legacy Blog</title>',
    f'    <link>{base_url}/blog/</link>',
    '    <description>Νέα, οδηγοί και ανακοινώσεις του PGG Legacy Minecraft Server</description>',
    '    <language>el-gr</language>',
    f'    <lastBuildDate>{now_rfc}</lastBuildDate>',
    f'    <atom:link href="{base_url}/feed.xml" rel="self" type="application/rss+xml" />\n'
]

for article in sorted(blog_articles, key=lambda x: x["lastmod"], reverse=True):
    rfc_date  = to_rfc822(article["lastmod"])
    full_url  = html.escape(f"{base_url}{article['loc']}")

    rss.append("    <item>")
    rss.append(f"      <title>{html.escape(article['title'])}</title>")
    rss.append(f"      <link>{full_url}</link>")
    rss.append(f"      <guid>{full_url}</guid>")
    if article["description"]:
        rss.append(f"      <description>{html.escape(article['description'])}</description>")
    rss.append(f"      <pubDate>{rfc_date}</pubDate>")
    rss.append("    </item>\n")

rss.append("  </channel>")
rss.append("</rss>")

with open("feed.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(rss))

print("✅ feed.xml δημιουργήθηκε.")


# ─────────────────────────────────────────
# 3. DISCORD NOTIFICATION
#    Στέλνει μόνο αν άλλαξαν αρχεία στο blog/
# ─────────────────────────────────────────

if blog_articles:
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
            capture_output=True,
            text=True,
            check=True
        )
        changed      = result.stdout.strip().splitlines()
        blog_changed = [f for f in changed if f.startswith("blog/")]
        print(f"  Αλλαγμένα αρχεία blog: {blog_changed}")
    except Exception as e:
        print(f"  Δεν ήταν δυνατός ο έλεγχος αλλαγών: {e}")
        blog_changed = []

    if blog_changed:
        latest_article = sorted(blog_articles, key=lambda x: x["lastmod"], reverse=True)[0]
        print(f"📢 Αποστολή Discord notification για: {latest_article['title']}")
        send_discord_notification(latest_article)
    else:
        print("ℹ️  Δεν άλλαξαν αρχεία blog. Παράλειψη Discord notification.")