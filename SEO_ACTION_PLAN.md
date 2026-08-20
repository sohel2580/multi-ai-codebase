# SEO Action Plan for sohel.pro.bd

## Audit Summary

This portfolio site has a solid lightweight PHP structure, clean primary URLs for main pages, image compression through WebP uploads, basic caching rules, a robots file, and an XML sitemap. The biggest SEO opportunities are strengthening entity signals for Sohel Ahammad, improving canonical URL consistency, adding schema markup, expanding content depth, improving image alt text, publishing targeted blog content, and building a controlled backlink profile from reputable profile, portfolio, local, and industry sources.

## Current Findings

### Technical SEO

- The site uses clean URLs for primary pages such as `/skills`, `/gallery`, and `/contact` through Apache rewrite rules.
- Canonical URLs are currently generated from the full request URI, which can preserve query strings and duplicate URLs.
- HTTPS is referenced in the sitemap, but runtime canonical generation can fall back to HTTP depending on server variables.
- Basic security headers and cache headers exist in `.htaccess` and `index.php`.
- Static assets receive long browser caching and CSS/JS are versioned with `filemtime()`.
- The site loads Google Fonts and Font Awesome from external CDNs, which can affect render performance.
- The preloader and multiple animations add visual polish but may delay perceived loading on slower mobile devices.

### Indexability

- `robots.txt` allows the public site and points to the XML sitemap.
- `/data/`, `/admin`, and direct `/pages/` access are protected from crawling.
- The blog page is disabled in navigation and `data/blog.json` is empty, limiting indexable content growth.
- The XML sitemap includes the main public pages but not individual blog posts.

### On-Page SEO

- Every page has a dynamic title and meta description.
- Current metadata is functional but generic; it can better target professional and location keywords.
- The homepage contains useful experience details but could use more keyword-rich copy around Saudi Arabia, electrical termination, store keeping, computer operation, and hospitality experience.
- The skills page has strong experience content but no dedicated summary paragraph above the timeline.
- Gallery image alt text is generic, which limits image SEO value.
- Internal links exist in navigation and CTAs, but contextual internal links can be expanded within content sections.

### Metadata and Social Preview

- Open Graph and Twitter Card tags are present.
- Canonical URLs need normalization to the preferred HTTPS clean URL.
- Missing structured data reduces eligibility for rich search understanding.

### Schema Markup

- No JSON-LD schema was found.
- Recommended schema types: `Person`, `ProfilePage`, `WebSite`, `BreadcrumbList`, and `Article` for blog posts.
- Experience data can support `hasOccupation`, `knowsAbout`, `sameAs`, and `workLocation` signals.

### Site Structure

- Structure is simple and crawlable: Home, Experience, Gallery, Contact, optional Blog.
- The `skills` URL is user-facing as Experience, which is acceptable, but page naming should remain consistent in metadata.
- The blog system exists but is not being used; this is the largest content gap.

### Page Speed and Core Web Vitals

- Positives: compressed image formats, explicit image dimensions, deferred local JS, CSS preloading, cache headers.
- Risks: render-blocking Google Fonts stylesheet, Font Awesome CDN dependency, heavy animations, canvas particles, preloader, and many transition effects.
- Recommended: keep reduced-motion support, consider local font/icon hosting, audit mobile LCP after deployment, and avoid adding large unoptimized gallery assets.

### Content Quality

- The site clearly communicates work experience and availability.
- Content needs more depth to rank for specific professional searches.
- Missing content assets include: downloadable CV page, detailed role descriptions, certifications/training, project examples, and blog articles.

### Keyword Opportunities

Primary keyword targets:

- Sohel Ahammad portfolio
- Sohel Ahammad Saudi Arabia
- electrical terminator Saudi Arabia
- electrical testing and commissioning technician
- store keeper Saudi Arabia
- computer operator Riyadh
- hotel waiter cashier Riyadh
- Bangladeshi professional in Saudi Arabia
- Jubail electrical technician
- Al Khafji electrical terminator

Long-tail content targets:

- electrical cable termination work experience in Saudi Arabia
- testing and commissioning technician responsibilities
- store keeper inventory management experience
- computer operator CV editing and document services Riyadh
- hotel waiter and cashier job experience in Saudi Arabia
- Bengali English Hindi Arabic multilingual worker Saudi Arabia

### Competitor and SERP Gap Opportunities

Likely competitors include LinkedIn profiles, job portal profiles, personal portfolio sites, Facebook profiles, and local service pages. Common gaps this site can exploit:

- Many personal profiles lack schema markup and fast lightweight pages.
- Many job portal profiles have thin personal branding and limited portfolio context.
- A dedicated portfolio can rank for name searches if backlinks and consistent profiles point to it.
- Blog posts about real project experience can capture long-tail searches with lower competition.

### Backlink Profile

No external backlink data can be verified from local files alone. Based on the website files, the site currently links out to Facebook, WhatsApp, Telegram, Twitter/X, Instagram, and TikTok. Backlink work should focus on quality, relevance, and profile consistency rather than automated link building.

## Prioritized Recommendations

### Priority 1: High Impact / Low Risk

- Normalize canonical URLs to the preferred HTTPS clean URLs.
- Add JSON-LD schema for `Person`, `ProfilePage`, `WebSite`, and `BreadcrumbList`.
- Improve homepage, experience, gallery, and contact meta descriptions with specific keywords.
- Improve image alt text on gallery and homepage images.
- Remove conflicting public-page allow directives from `robots.txt` while keeping direct source files blocked.
- Add missing social/profile `sameAs` signals through schema.

### Priority 2: Content Growth

- Publish 5-8 targeted blog articles based on work experience and Saudi Arabia job skills.
- Add a dedicated CV/resume landing section with experience, skills, languages, and contact CTA.
- Add project or work sample descriptions for electrical termination and testing/commissioning work.
- Add a short summary section to the Experience page before the timeline.

### Priority 3: Authority and Backlinks

- Make all social profiles link back to `https://sohel.pro.bd/`.
- Create or update professional profiles on LinkedIn, GitHub if relevant, About.me, Behance if design work is shown, and local job portals.
- Submit the website to high-quality portfolio/profile directories only where profiles are manually reviewed.
- Build citations from consistent profile pages using the same name, location, and professional description.

### Priority 4: Performance

- Test live pages with PageSpeed Insights after deployment.
- Consider hosting Font Awesome locally or replacing it with inline SVG icons.
- Consider using `font-display=swap` and self-hosted font files if font performance is weak.
- Reduce animation intensity on low-end mobile devices if Core Web Vitals are poor.

## Backlink Opportunities

### Profile and Personal Brand Links

- LinkedIn profile with website link and complete work history.
- Facebook bio and featured links.
- Instagram bio link.
- Twitter/X profile website field.
- TikTok profile website field if available.
- Telegram channel/group bio or pinned portfolio message.
- About.me or Carrd-style profile page linking to the main site.

### Professional and Job Portal Links

- Bayt profile.
- Naukrigulf profile.
- GulfTalent profile.
- Indeed profile if available in target region.
- LinkedIn service/profile sections.
- Local Saudi or GCC job boards that allow portfolio URLs.

### Content-Based Backlinks

- Guest posts or personal stories on career blogs for Bangladeshi professionals in Saudi Arabia.
- Comments or community answers only where genuinely helpful and non-spammy.
- Portfolio mentions from employers, colleagues, or project pages where appropriate.
- Relevant directory listings for technicians, hospitality workers, and freelancers if legitimate.

### Backlink Rules

- Avoid paid spam links, automated directory blasts, PBNs, link farms, and irrelevant comment spam.
- Use branded anchors most often: `Sohel Ahammad`, `Sohel Ahammad Portfolio`, and `sohel.pro.bd`.
- Use partial-match anchors sparingly: `electrical terminator in Saudi Arabia`, `computer operator portfolio`, `store keeper experience`.

## Content Improvement Plan

### Recommended Blog Topics

1. My Work Experience as an Electrical Terminator in Saudi Arabia
2. Testing and Commissioning Technician Responsibilities Explained
3. Store Keeper Skills: Inventory, Stock Checks, and Records
4. My Experience as a Hotel Waiter and Cashier in Riyadh
5. Computer Operator Skills for CV Editing and Office Support
6. Lessons Learned Working on Industrial Projects in Saudi Arabia
7. Multilingual Communication Skills for Work in Saudi Arabia
8. How I Built My Professional Portfolio as a Bangladeshi Worker Abroad

### Page-Level Content Actions

- Homepage: expand the about section with 150-250 words around experience, location, reliability, and availability.
- Experience page: add an introductory paragraph and keyword-rich role summaries.
- Contact page: add trust copy encouraging employers/recruiters to contact directly.
- Gallery page: use descriptive image alt text tied to Sohel Ahammad and professional portfolio.
- Blog: enable navigation after publishing at least 3 strong posts.

## Keyword Target Map

| Page | Primary Target | Supporting Keywords |
| --- | --- | --- |
| Home | Sohel Ahammad portfolio | Saudi Arabia professional, Bangladeshi worker, available for work |
| Experience | electrical terminator Saudi Arabia | testing commissioning technician, store keeper, computer operator, waiter cashier |
| Contact | contact Sohel Ahammad | WhatsApp, Telegram, email, Saudi Arabia portfolio |
| Gallery | Sohel Ahammad photos | portfolio gallery, Saudi Arabia worker photos |
| Blog | Saudi Arabia work experience | technician experience, store keeper tips, computer operator skills |

## Execution Checklist

### Completed in This SEO Pass

- [x] Audited site files, metadata, robots, sitemap, content, images, and performance-related code.
- [x] Created this SEO action plan.

### Approved Safe On-Site Improvements Implemented

- [x] Normalized canonical URL generation to preferred HTTPS clean URLs for main pages.
- [x] Added JSON-LD schema markup for `WebSite`, `Person`, `ProfilePage`, `BreadcrumbList`, and `Article` when blog posts exist.
- [x] Improved page-specific metadata with stronger Saudi Arabia, electrical termination, testing and commissioning, store keeper, computer operator, and hospitality keywords.
- [x] Expanded homepage, skills, contact, and gallery content with richer SEO-focused copy and location-specific context.
- [x] Improved gallery image alt text and escaped gallery image paths.
- [x] Enabled blog navigation and published several experience-based blog posts to support long-tail keyword coverage.
- [x] Expanded the XML sitemap to include the new blog post URLs.
- [x] Cleaned `robots.txt` directives so public clean URLs remain crawlable while direct source/data/admin paths stay blocked.
- [x] Documented all code changes in this action plan.

### Pending Manual / Off-Site Actions

- [ ] Add the website URL to all social profiles.
- [ ] Create or update LinkedIn with complete work history and website link.
- [ ] Create profiles on relevant Gulf job portals and add website URL where allowed.
- [ ] Publish at least 3 experience-based blog posts before enabling Blog in navigation.
- [ ] Submit sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Monitor indexed pages and search queries monthly.

## Change Log

- 2026-06-20: Initial SEO audit and action plan created.
- 2026-06-20: Implemented canonical URL normalization, keyword-focused metadata, JSON-LD schema, gallery alt text improvements, and robots cleanup.
- 2026-06-20: Attempted PHP syntax validation with `php -l`, but PHP CLI is not installed on this Windows environment.

## Tracking Notes

- Backlink actions require account access and manual verification, so they are tracked as pending manual actions.
- Competitive backlink and keyword volume validation require external SEO tools such as Google Search Console, Ahrefs, Semrush, Moz, or Ubersuggest.
- Live page speed should be tested after deployment because local file review cannot measure real server response time, CDN behavior, or Core Web Vitals field data.
