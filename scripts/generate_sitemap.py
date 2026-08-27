import os
import re
from datetime import datetime

today = datetime.now().strftime("%Y-%m-%d")
base_url = "https://pgglegacy.gr"

static_pages = [
    {"comment": "Αρχική Σελίδα", "loc": "/", "lastmod": today, "changefreq": "weekly", "priority": "1.0"},
    {"comment": "Πολιτική Απορρήτου (Privacy Policy)", "loc": "/privacy", "lastmod": today, "changefreq": "monthly", "priority": "0.3"},
    {"comment": "Blog Index", "loc": "/blog/", "lastmod": today, "changefreq": "weekly", "priority": "0.8"},
]

blog_articles = []
blog_dir = "blog"
if os.path.exists(blog_dir):
    for root, dirs, files in os.walk(blog_dir):
        if "media" in root.split(os.sep):
            continue
        for file in files:
            if file.endswith((".md", ".html")) and root != blog_dir:
                rel_path = os.path.relpath(root, blog_dir).replace("\\", "/")
                slug = rel_path.strip("/")
                if not slug or slug == ".":
                    continue
                
                filepath = os.path.join(root, file)
                article_date = today
                
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                        match = re.search(r"date:\s*[\"']?(\d{4}-\d{2}-\d{2})", content)
                        if match:
                            article_date = match.group(1)
                except Exception:
                    pass

                url_path = f"/blog/{slug}/"
                if not any(a["loc"] == url_path for a in blog_articles):
                    blog_articles.append({
                        "loc": url_path,
                        "lastmod": article_date,
                        "changefreq": "monthly",
                        "priority": "0.7"
                    })

other_pages = [
    {"comment": "Leaderboard", "loc": "/leaderboard", "lastmod": today, "changefreq": "hourly", "priority": "0.9"},
    {"comment": "Police Applications", "loc": "/police", "lastmod": today, "changefreq": "weekly", "priority": "0.5"},
    {"comment": "Server Map", "loc": "/map", "lastmod": today, "changefreq": "monthly", "priority": "0.7"},
]

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
