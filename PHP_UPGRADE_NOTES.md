# PHP Runtime Upgrade Notes

This project is prepared for the latest stable PHP runtime family, targeting PHP 8.4 and requiring PHP 8.1 or newer.

## Runtime Requirements

- PHP 8.1+ minimum; PHP 8.4 recommended.
- Required extensions: `json`, `session`, `fileinfo` or standard upload handling, and standard SPL functions.
- Optional extension: `gd` for profile image resizing. Without GD, uploads still fall back to direct file moves.
- Apache with `mod_rewrite` enabled for clean URLs.
- Writable directories/files for admin features:
  - `data/`
  - `uploads/`
  - `uploads/blog/`
  - `sitemap.xml`
  - `sitemap.html`

## Upgrade Changes

- Added `includes/php-compat.php` for centralized PHP version checks, safe HTML escaping, JSON reads/writes, and UTF-8-safe excerpts.
- Added `declare(strict_types=1)` to application entry points and pages.
- Replaced direct JSON decoding/writing with guarded helper functions to avoid warnings on missing, empty, or invalid data files.
- Replaced unsafe/default `htmlspecialchars()` calls with a UTF-8 helper using `ENT_QUOTES | ENT_SUBSTITUTE`.
- Added fallbacks where `mbstring` is unavailable.
- Tightened `in_array()` calls with strict comparisons where applicable.
- Disabled frontend error display in `index.php`; PHP errors should be logged by the runtime in production.
- Kept the GD dependency optional for hosting compatibility.

## Deployment Checklist

1. Select PHP 8.4 in the hosting control panel when available, or PHP 8.1+ as the minimum supported version.
2. Confirm `json` and `session` extensions are enabled.
3. Enable `gd` if profile image cropping/resizing is needed.
4. Ensure Apache rewrite rules from `.htaccess` are active.
5. Confirm `data/`, `uploads/`, and `uploads/blog/` are writable by PHP.
6. Visit the public pages: home, skills, gallery, blog, contact, and one blog post.
7. Log in to the admin panel and test profile save, visibility save, gallery upload, and blog save.

## Local Verification

Run these commands on a machine where PHP is installed:

```bash
php -v
php -l index.php
php -l router.php
php -l header.php
php -l footer.php
php -l includes/php-compat.php
php -l pages/admin.php
php -l pages/blog.php
php -l pages/contact.php
php -l pages/gallery.php
php -l pages/home.php
php -l pages/post.php
php -l pages/skills.php
```

The current development machine did not have `php` available in `PATH`, so syntax checks must be run on the target server or a local PHP installation.
