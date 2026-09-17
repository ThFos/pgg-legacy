import os
import re
from datetime import datetime

today = datetime.now().strftime("%Y-%m-%d")
base_url = "https://pgglegacy.gr"

def to_rfc822(date_str):
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%a, %d %b %Y 00:00:00 GMT")
    except Exception:
        return datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT")

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
            
            # Παράβλεψη του αρχείου αρχικής του blog (blog/index.md)
            if rel_file in ["index.md", "index.html"]:
                continue
            
            # Υπολογισμός του slug είτε πρόκειται για blog/folder/index.md είτε για blog/post.md
            if file in ["index.md", "index.html"]:
                slug = os.path.dirname(rel_file).strip("/")
            else:
                slug = os.path.splitext(rel_file)[0].strip("/")
            
            if not slug or slug == ".":
                continue
            
            article_date = today
            article_title = slug.split("/")[-1].replace("-", " ").title()
            article_desc = ""
            
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                    date_match = re.search(r"date:\s*[\"']?(\d{4}-\d{2}-\d{2})", content)
                    if date_match:
                        article_date = date_match.group(1)
                        
                    title_match = re.search(r"title:\s*[\"']?([^\"'\n]+)", content)
                    if title_match:
                        article_title = title_match.group(1).strip()

                    desc_match = re.search(r"description:\s*[\"']?([^\"'\n]+)", content)
                    if desc_match:
                        article_desc = desc_match.group(1).strip()
            except Exception:
                pass

            url_path = f"/blog/{slug}/"
            if not any(a["loc"] == url_path for a in blog_articles):
                blog_articles.append({
                    "loc": url_path,
                    "title": article_title,
                    "description": article_desc,
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
        xml.append(f"  <!-- {p['comment']} -->")
    xml.append("  <url>")
    xml.append(f"    <loc>{base_url}{p['loc']}</loc>")
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
    full_url = f"{base_url}{article['loc']}"
    
    rss.append("    <item>")
    rss.append(f"      <title>{article['title']}</title>")
    rss.append(f"      <link>{full_url}</link>")
    rss.append(f"      <guid>{full_url}</guid>")
    if article['description']:
        rss.append(f"      <description>{article['description']}</description>")
    rss.append(f"      <pubDate>{rfc_date}</pubDate>")
    rss.append("    </item>\n")

rss.append("  </channel>")
rss.append("</rss>")

with open("feed.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(rss))
