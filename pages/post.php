<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/php-compat.php';

$blogs = app_json_read(__DIR__ . '/../data/blog.json');
$id = isset($_GET['id']) ? (int)$_GET['id'] : -1;

if (!isset($blogs[$id])) {
    echo "<div class='section revealed' style='text-align:center; padding:80px 0;'>";
    echo "<div style='font-size:48px; margin-bottom:20px; color:var(--text-tertiary);'><i class='fa fa-exclamation-circle'></i></div>";
    echo "<h2 style='margin-bottom:12px; font-size:1.5rem;'>Post Not Found</h2>";
    echo "<p style='color:var(--text-secondary); margin-bottom:24px;'>The requested blog post does not exist.</p>";
    echo "<a href='blog' class='btn btn-primary'>Back to Blog</a>";
    echo "</div>";
    return;
}

$post = $blogs[$id];
?>
<div class="section">
    <div style="margin-bottom: 20px;">
        <a href="blog" class="btn" style="display: inline-block; padding: 8px 16px; background: var(--bg-card); color: var(--text-primary); border-radius: 8px; text-decoration: none; border: 1px solid var(--border-color);"><i class="fa fa-arrow-left"></i> Back to Blog</a>
    </div>

    <div class="card" style="padding: 30px;">
        <?php if (!empty($post['image'])): ?>
            <div style="margin: -30px -30px 30px -30px; border-radius: 12px 12px 0 0; overflow: hidden;">
                <img src="<?= app_h($post['image']) ?>" alt="<?= app_h($post['title'] ?? '') ?>" loading="eager" decoding="async" fetchpriority="high" width="800" height="400" style="width: 100%; max-height: 400px; object-fit: cover;">
            </div>
        <?php endif; ?>
        
        <div class="header" style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 2rem; margin-bottom: 10px;"><?= app_h($post['title'] ?? '') ?></h1>
            <div style="color: var(--text-tertiary); font-size: 0.9rem;">
                <i class="fa fa-calendar"></i> <?= app_h($post['date'] ?? '') ?>
            </div>
            <?php if (!empty($post['tags'])): ?>
                <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <?php foreach ($post['tags'] as $tag): ?>
                        <span style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; color: var(--accent);">#<?= app_h($tag) ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <style>
            .content img {
                max-width: 100% !important;
                height: auto !important;
                border-radius: 8px;
                display: block;
                margin: 15px auto;
            }
        </style>
        <div class="content" style="color: var(--text-secondary); line-height: 1.8; font-size: 1.1rem;">
            <?= $post['content'] ?>
        </div>
    </div>
</div>
