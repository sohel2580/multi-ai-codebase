<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/php-compat.php';

$blogs = app_json_read(__DIR__ . '/../data/blog.json');
?>
<div class="section">
    <div class="section-label"><i class="fa fa-rss"></i> Experience Blog</div>
    <p style="margin: 0 0 20px; color: var(--text-secondary); line-height: 1.8;">Read practical articles about my work experience in Saudi Arabia, including electrical termination, testing and commissioning, store keeping, computer support, and hospitality service.</p>
    <div class="blog-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <?php foreach ($blogs as $index => $blog): ?>
            <a href="post?id=<?= $index ?>" style="text-decoration: none; color: inherit;">
                <div class="card blog-card">
                    <?php if (!empty($blog['image'])): ?>
                        <img src="<?= app_h($blog['image']) ?>" alt="<?= app_h($blog['title'] ?? '') ?>" loading="lazy" decoding="async" width="300" height="200" style="width: 100%; height: 200px; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                    <?php endif; ?>
                    <div class="card-body">
                        <h3><?= app_h($blog['title'] ?? '') ?></h3>
                        <?php 
                        $excerpt = app_string_excerpt((string)($blog['content'] ?? ''), 100);
                        if ($excerpt !== '') {
                            $excerpt .= '...';
                        }
                        ?>
                        <p style="color: var(--text-secondary); margin: 10px 0;"><?= app_h($excerpt) ?></p>
                        <small style="color: var(--text-tertiary);"><?= app_h($blog['date'] ?? '') ?></small>
                        <?php if (!empty($blog['tags'])): ?>
                            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
                                <?php foreach ($blog['tags'] as $tag): ?>
                                    <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--accent);">#<?= app_h($tag) ?></span>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </a>
        <?php endforeach; ?>
        <?php if (empty($blogs)): ?>
            <p style="text-align: center; color: var(--text-secondary); width: 100%;">No blog posts yet.</p>
        <?php endif; ?>
    </div>
</div>