import os
import re
import html
import json
import urllib.request
from datetime import datetime

today = datetime.now().strftime("%Y-%m-%d")
base_url = "https://pgglegacy.gr"

def to_rfc822(date_str):
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%a, %d %b %Y 00:00:00 GMT")
    except Exception:
        return datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT")

def parse_frontmatter(content):
    """Διαβάζει σωστά ολόκληρο το YAML frontmatter ακόμα και αν εκτείνεται σε πολλές γραμμές."""
    data = {}
    parts = content.split("---")
    if len(parts) >= 3:
        fm_block = parts[1]
        current_key = None
        current_val = []
        
        for line in fm_block.splitlines():
            if ":" in line and not line.startswith(" "):
                if current_key:
                    data[current_key] = " ".join(current_val).strip().strip('"\'')
                key, val = line.split(":", 1)
                current_key = key.strip()
                current_val = [val.strip()]
            elif current_key and line.strip():
                current_val.append(line.strip())
                
        if current_key:
            data[current_key] = " ".join(current_val).strip().strip('"\'')
            
    return data

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
        "color": 1710369,  # Hex #1a1921
        "footer": {
            "text": "PGG Legacy Blog"
        }
    }

    # Διόρθωση και μετατροπή της εικόνας σε απόλυτο URL
    if "image" in article and article["image"]:
        img_path = article["image"].strip()
        if img_path.startswith("http://") or img_path.startswith("https://"):
            img_url = img_path
        elif img_path.startswith("/"):
            img_url = f"{base_url}{img_path}"
        else:
            img_url = f"{base_url}{article['loc']}{img_path.lstrip('./')}"
            
        embed_data["image"] = {
            "url": img_url
        }

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
    except Exception as e:
        print(f"Failed to send Discord notification: {e}")

static_pages = [
    {"comment": "Αρχική Σελίδα", "loc": "/", "lastmod": today, "changefreq": "weekly", "priority": "1.0"},
    {"comment": "Πολιτική Απορρήτου (Privacy Policy)", "loc": "/privacy/", "lastmod": today, "changefreq": "monthly", "priority": "0.3"},
    {"comment": "Blog Index", "loc": "/blog/", "lastmod": today, "changefreq": "weekly", "priority": "0.8"},
]

blog_articles = []
blog_dir = "blog"

if os.path.exists(blog_dir):
    for root, dirs, files in os.walk(blog_dir):
        if "media" in root.split(os.sep):
            continue
        for file in files:
            if not file.endswith((".md", ".html")):
                continue
            
            full_path = os.path.join(root, file)
            rel_file = os.path.relpath(full_path, blog_dir).replace("\\", "/")
            
            if rel_file in ["index.md", "index.html"]:
                continue
            
            if file in ["index.md", "index.html"]:
                slug = os.path.dirname(rel_file).strip("/")
            else:
                slug = os.path.splitext(rel_file)[0].strip("/")
            
            if not slug or slug == ".":
                continue
            
            article_date = today
            article_title = slug.split("/")[-1].replace("-", " ").title()
            article_desc = ""
            article_img = ""
            
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    fm = parse_frontmatter(content)
                    
                    if "date" in fm and fm["date"]:
                        date_match = re.search(r"(\d{4}-\d{2}-\d{2})", fm["date"])
                        if date_match:
                            article_date = date_match.group(1)
                            
                    if "title" in fm and fm["title"]:
                        article_title = fm["title"]

                    if "description" in fm and fm["description"]:
                        article_desc = fm["description"]

                    if "image" in fm and fm["image"]:
                        article_img = fm["image"]
            except Exception:
                pass

            url_path = f"/blog/{slug}/"
            if not any(a["loc"] == url_path for a in blog_articles):
                blog_articles.append({
                    "loc": url_path,
                    "title": article_title,
                    "description": article_desc,
                    "image": article_img,
                    "lastmod": article_date,
                    "changefreq": "monthly",
                    "priority": "0.7"
                })

other_pages = [
    {"comment": "Leaderboard", "loc": "/leaderboard/", "lastmod": today, "changefreq": "hourly", "priority": "0.9"},
    {"comment": "Police Applications", "loc": "/police/", "lastmod": today, "changefreq": "weekly", "priority": "0.5"},
    {"comment": "Server Map", "loc": "/map/", "lastmod": today, "changefreq": "monthly", "priority": "0.7"},
]

# --- 1. Sitemap Generation ---
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n']

def add_url(p):
    if "comment" in p and p["comment"]:
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
    for p in blog_articles:
        add_url(p)

for p in other_pages:
    add_url(p)

xml.append("</urlset>")

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(xml))

# --- 2. RSS Feed Generation ---
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

for article in blog_articles:
    rfc_date = to_rfc822(article["lastmod"])
    full_url = html.escape(f"{base_url}{article['loc']}")
    esc_title = html.escape(article['title'])
    esc_desc = html.escape(article['description'])
    
    rss.append("    <item>")
    rss.append(f"      <title>{esc_title}</title>")
    rss.append(f"      <link>{full_url}</link>")
    rss.append(f"      <guid>{full_url}</guid>")
    if esc_desc:
        rss.append(f"      <description>{esc_desc}</description>")
    rss.append(f"      <pubDate>{rfc_date}</pubDate>")
    rss.append("    </item>\n")

rss.append("  </channel>")
rss.append("</rss>")

with open("feed.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(rss))

# --- 3. Discord Notification for Latest Article ---
if blog_articles:
    latest_article = sorted(blog_articles, key=lambda x: x["lastmod"], reverse=True)[0]
    send_discord_notification(latest_article)
