---
name: seo-specialist
description: Enterprise Search Engine Optimization (SEO) agent specialist. Implements Google Knowledge Graph Schema.org JSON-LD structured data, Geo-Targeting, Open Graph, Core Web Vitals audit, and search crawler indexation strategies.
---

# SEO Specialist Agent Skill

This skill provides comprehensive instructions and best practices for configuring search engine optimization, Google Rich Snippets, and ranking architectures.

## Core Directives

1. **Schema.org Structured Data (JSON-LD)**:
   - Embed high-detail `@type: Person`, `ProfilePage`, `WebSite`, `MobileApplication`, and `BreadcrumbList` schemas.
   - Specify `knowsAbout`, `hasOccupation`, `workLocation`, `address`, `sameAs`, and `url`.

2. **Regional & Geo-Targeting Meta Tags**:
   - Include `geo.region`, `geo.placename`, `geo.position`, and `ICBM` for local search ranking (e.g. Riyadh, Saudi Arabia).

3. **Social & Sharing Protocol (Open Graph & Twitter Cards)**:
   - Ensure image paths are absolute or well-formed, titles are compelling (< 60 chars), descriptions (< 160 chars).

4. **Crawler Indexation**:
   - Keep `sitemap.xml` clean with proper `lastmod`, `priority`, and `changefreq`.
   - Maintain `robots.txt` allowing standard search crawlers with explicit `Sitemap` location.
