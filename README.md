# 🏰 PGG Legacy — Website & Web Services

![PGG Legacy Banner](https://pgglegacy.gr/media/banner.png)

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fpgglegacy.gr&label=pgglegacy.gr&style=for-the-badge)](https://pgglegacy.gr)
[![Discord](https://img.shields.io/discord/429619332272619530?color=5865F2&label=Discord&logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/Ks7NtXhtwV)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.20.1-62b47a?style=for-the-badge&logo=minecraft&logoColor=white)](https://pgglegacy.gr/#join)

Το επίσημο repository της ιστοσελίδας και των web services του **PGG Legacy**, του Ελληνικού Minecraft SMP & Roleplay Server.

---

## 🔗 Σύνδεσμοι

| Υπηρεσία | Link |
|---|---|
| 🌐 **Website** | [pgglegacy.gr](https://pgglegacy.gr) |
| 🎮 **Server IP** | `play.PGGlegacy.gr` — Java Edition 1.20.1 |
| 🗺️ **Live Map** | [pgglegacy.gr/map](https://pgglegacy.gr/map) |
| 🏆 **Leaderboard** | [pgglegacy.gr/leaderboard](https://pgglegacy.gr/leaderboard) |
| 🚔 **Police Apps** | [pgglegacy.gr/police](https://pgglegacy.gr/police) |
| 💬 **Discord** | [discord.gg/Ks7NtXhtwV](https://discord.gg/Ks7NtXhtwV) |

---

## ✨ Features

### 🌐 Website & UX
- **Responsive Design** — Πλήρως βελτιστοποιημένο για Desktop & Mobile συσκευές.
- **Lightweight Animations** — Custom `IntersectionObserver` scroll animations χωρίς εξωτερικές εξαρτήσεις.
- **Custom Cursor & Glow Effect** — Διαδραστική κίνηση ποντικιού με αυτόματη απενεργοποίηση σε touch συσκευές.
- **Live Server Status** — Real-time ενημέρωση online παικτών μέσω API.
- **IP Copy Button** — One-click αντιγραφή της IP του server με visual feedback.
- **GDPR & Privacy Compliant** — Custom Cookie Consent Banner κατόπιν συγκατάθεσης.
- **SEO & Accessibility** — Πλήρη Open Graph, Twitter Cards, `sitemap.xml`, `robots.txt` και υποστήριξη `prefers-reduced-motion`.

### 📖 Blog & Content Management (CMS)
- **Decap CMS Integration** — Πλήρες headless CMS διαχειριστικό περιβάλλον (`/admin`) με GitHub OAuth authentication.
- **Live Custom Preview** — Real-time προεπισκόπηση των άρθρων με φόρτωση των πραγματικών CSS & fonts του site μέσα στο CMS.
- **Markdown & Frontmatter Support** — Αυτόματη παραγωγή structured άρθρων με tags, metadata και εικόνες εξωφύλλου.
- **Οδηγοί & Events** — Καλύπτει RP οδηγούς (IC/OOC), Getting Started, Events (Winter Frost, Spooky October κ.ά.) και Game Commands.

### 🗺️ Live Dynamic Map
- Ενσωματωμένος real-time χάρτης του server μέσω **Dynmap** σε πλήρη οθόνη.

### 🏆 Player Leaderboard
- Live κατάταξη παικτών με στατιστικά Playtime (Εβδομαδιαία & All-Time).
- Ενσωμάτωση **Skeleton Loading** και dynamic player avatars.

### 🚔 Police Applications
- Online φόρμα αιτήσεων για το αστυνομικό σώμα του RP.
- Αυτόματη αποστολή μέσω Web3Forms και έλεγχος διπλής υποβολής μέσω `LocalStorage`.

---

## 📁 Δομή Repository

```text
pgg-legacy-main/
├── CNAME                    # Custom domain routing (pgglegacy.gr)
├── index.html               # Αρχική σελίδα
├── robots.txt               # Οδηγίες για search engine crawlers
├── sitemap.xml              # XML Sitemap για SEO
├── admin/                   # Decap CMS Admin Panel
│   ├── index.html           # CMS Entrypoint & Custom Preview Templates
│   └── config.yml           # CMS Configurations & Collection Schemas
├── css/                     # Στυλ ιστοσελίδας (Modular CSS)
│   ├── base.css             # Μεταβλητές, reset & typography
│   ├── hero.css             # Hero section & IP copier
│   ├── sections.css         # Features, rules, discord, team, join
│   ├── pages.css            # Police, Map, Leaderboard
│   ├── responsive.css       # Mobile optimizations
│   ├── animations.css       # Keyframes & observer styles
│   ├── cursor.css           # Custom desktop cursor
│   ├── cookies.css          # GDPR Cookie Banner
│   └── blog.css             # Blog specific styling
├── js/                      # JavaScript logic
│   └── script.js            # Κύριο script (API calls, UI, GDPR)
├── blog/                    # Blog section
│   ├── index.html           # Λίστα άρθρων
│   ├── blog.js              # Blog specific JS
│   ├── media/               # Εικόνες & Banners άρθρων
│   └── [article-folders]/   # Άρθρα blog (Markdown / HTML)
├── leaderboard/             # Σελίδα Leaderboard
├── map/                     # Σελίδα Live Map
├── police/                  # Σελίδα Αιτήσεων Αστυνομίας
└── privacy/                 # Σελίδα Πολιτικής Απορρήτου
```

---

## 🛠️ Tech Stack & Integration APIs

### Frontend
- **HTML5 & CSS3** (Vanilla, CSS Variables, Flexbox/Grid)
- **JavaScript (Vanilla ES6)**
- **Space Grotesk Font** (Google Fonts)

### External APIs & Web Services
- **mcstatus.io** — Live Server Status
- **Render.com** — Custom Leaderboard API Backend & Decap CMS OAuth Gateway
- **Web3Forms** — Email Dispatcher για τις αιτήσεις Αστυνομίας
- **mc-heads.net** — Player Head Avatars Render API
- **Dynmap** — Live Server Map Streaming
- **Google Analytics (GA4)** — Ανώνυμα στατιστικά επισκεψιμότητας

---

© PGG Legacy — All rights reserved.
