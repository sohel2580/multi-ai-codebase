<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/php-compat.php';

session_start();

// Data Paths
$biolinkPath = 'data/biolink.json';
$experiencePath = 'data/experience.json';
$blogPath = 'data/blog.json';
$uploadsDir = 'uploads/';
$blogUploadsDir = 'uploads/blog/';

// Ensure data files exist
if (!file_exists(__DIR__ . '/../' . $biolinkPath)) app_json_write(__DIR__ . '/../' . $biolinkPath, ['profile' => ['name' => 'Name', 'tagline' => 'Tagline', 'image' => 'images/profile.jpg'], 'contacts' => [], 'socials' => []]);
if (!file_exists(__DIR__ . '/../' . $experiencePath)) app_json_write(__DIR__ . '/../' . $experiencePath, []);
if (!file_exists(__DIR__ . '/../' . $blogPath)) app_json_write(__DIR__ . '/../' . $blogPath, []);
if (!is_dir(__DIR__ . '/../' . $uploadsDir)) mkdir(__DIR__ . '/../' . $uploadsDir, 0777, true);
if (!is_dir(__DIR__ . '/../' . $blogUploadsDir)) mkdir(__DIR__ . '/../' . $blogUploadsDir, 0777, true);

// Load Data
$biolink = app_json_read(__DIR__ . '/../' . $biolinkPath);

// Initialize Default Password Hash if not exists
if (!isset($biolink['settings']['password_hash'])) {
    $biolink['settings']['password_hash'] = password_hash('Fatema565853*#', PASSWORD_DEFAULT);
    app_json_write(__DIR__ . '/../' . $biolinkPath, $biolink);
}

// Handle Login
if (isset($_POST['login'])) {
    if (isset($biolink['settings']['password_hash']) && password_verify($_POST['password'], $biolink['settings']['password_hash'])) {
        $_SESSION['admin_logged_in'] = true;
    } else {
        $error = "Invalid password.";
    }
}

// Handle Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin");
    exit;
}

// Check Login Status
$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

$experience = app_json_read(__DIR__ . '/../' . $experiencePath);
$blogs = app_json_read(__DIR__ . '/../' . $blogPath);
$galleryImages = array_filter((array)glob(__DIR__ . '/../' . $uploadsDir . "*.*"), function($file) {
    return preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file);
});
$galleryImages = array_map(function($path) use ($uploadsDir) {
    return $uploadsDir . basename($path);
}, $galleryImages);
if ($isLoggedIn && $_SERVER['REQUEST_METHOD'] === 'POST' && (isset($_POST['action']) || isset($_GET['action']))) {
    $action = isset($_POST['action']) ? $_POST['action'] : $_GET['action'];
    $successMsg = "";

    // -- SITEMAP GENERATION FUNCTION --
    function generate_sitemaps() {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $baseUrl = rtrim($protocol . '://' . $_SERVER['HTTP_HOST'] . dirname(dirname($_SERVER['SCRIPT_NAME'])), '\\/');
        
        $pages = ['home', 'skills', 'gallery', 'blog', 'biolink'];
        $blogs = app_json_read(__DIR__ . '/../data/blog.json');

        // Generate XML Sitemap
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        
        // Static Pages
        foreach ($pages as $p) {
            $url = $baseUrl . ($p === 'home' ? '/' : "/$p");
            $xml .= "  <url>\n    <loc>" . app_h($url) . "</loc>\n    <changefreq>weekly</changefreq>\n    <priority>" . ($p === 'home' ? '1.0' : '0.8') . "</priority>\n  </url>\n";
        }
        
        // Blog Posts
        foreach ($blogs as $i => $b) {
            $url = $baseUrl . "/post?id=$i";
            $xml .= "  <url>\n    <loc>" . app_h($url) . "</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n";
        }
        $xml .= "</urlset>";
        file_put_contents(__DIR__ . '/../sitemap.xml', $xml);

        // Generate HTML Sitemap
        $html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Sitemap</title></head>\n<body style=\"font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px;\">\n";
        $html .= "<h1>Sitemap</h1>\n<h2>Main Pages</h2>\n<ul>\n";
        foreach ($pages as $p) {
            $url = $baseUrl . ($p === 'home' ? '/' : "/$p");
            $name = ucfirst($p === 'biolink' ? 'Contact' : ($p === 'skills' ? 'Experience' : $p));
            $html .= "  <li><a href=\"" . app_h($url) . "\">$name</a></li>\n";
        }
        $html .= "</ul>\n<h2>Blog Posts</h2>\n<ul>\n";
        foreach ($blogs as $i => $b) {
            $url = $baseUrl . "/post?id=$i";
            $html .= "  <li><a href=\"" . app_h($url) . "\">" . app_h($b['title'] ?? '') . "</a></li>\n";
        }
        $html .= "</ul>\n</body>\n</html>";
        file_put_contents(__DIR__ . '/../sitemap.html', $html);
    }


    // Profile Actions
    if ($action === 'update_profile') {
        $biolink['profile']['name'] = app_h($_POST['name']);
        $biolink['profile']['tagline'] = app_h($_POST['tagline']);
        
        // Handle profile image upload
        if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === 0) {
            $tmpName = $_FILES['profile_image']['tmp_name'];
            $targetFile = __DIR__ . '/../images/profile.jpg';
            
            // Check if GD extension is loaded, if not, just move the file
            if (extension_loaded('gd') && function_exists('getimagesize')) {
                $imgInfo = @getimagesize($tmpName);
                if ($imgInfo !== false) {
                    list($origWidth, $origHeight, $imageType) = $imgInfo;
                    $sourceImage = false;
                    
                    if ($imageType === IMAGETYPE_JPEG) $sourceImage = @imagecreatefromjpeg($tmpName);
                    elseif ($imageType === IMAGETYPE_PNG && function_exists('imagecreatefrompng')) $sourceImage = @imagecreatefrompng($tmpName);
                    elseif ($imageType === IMAGETYPE_GIF && function_exists('imagecreatefromgif')) $sourceImage = @imagecreatefromgif($tmpName);
                    elseif ($imageType === IMAGETYPE_WEBP && function_exists('imagecreatefromwebp')) $sourceImage = @imagecreatefromwebp($tmpName);
                    
                    if ($sourceImage) {
                        $size = min($origWidth, $origHeight);
                        $srcX = ($origWidth - $size) / 2;
                        $srcY = ($origHeight - $size) / 2;
                        
                        $newImage = imagecreatetruecolor(500, 500);
                        $white = imagecolorallocate($newImage, 255, 255, 255);
                        imagefill($newImage, 0, 0, $white);
                        
                        imagecopyresampled($newImage, $sourceImage, 0, 0, $srcX, $srcY, 500, 500, $size, $size);
                        
                        // Save and overwrite profile.jpg
                        imagejpeg($newImage, $targetFile, 90);
                        imagedestroy($sourceImage);
                        imagedestroy($newImage);
                    } else {
                        // Fallback if image creation fails but GD is enabled
                        move_uploaded_file($tmpName, $targetFile);
                    }
                } else {
                    move_uploaded_file($tmpName, $targetFile);
                }
            } else {
                // GD not loaded, fallback to simple move
                move_uploaded_file($tmpName, $targetFile);
            }
            
            // If there's an existing image that isn't profile.jpg, delete it
            if (!empty($biolink['profile']['image']) && file_exists(__DIR__ . '/../' . $biolink['profile']['image'])) {
                $oldBasename = basename($biolink['profile']['image']);
                if ($oldBasename !== 'profile.jpg') {
                    @unlink(__DIR__ . '/../' . $biolink['profile']['image']);
                }
            }
            
            $biolink['profile']['image'] = 'images/profile.jpg';
            unset($biolink['profile']['bg_image']);
        }
        app_json_write(__DIR__ . '/../' . $biolinkPath, $biolink);
        $successMsg = "Profile updated successfully!";
    }

    if ($action === 'update_visibility') {
        $biolink['settings']['show_home'] = isset($_POST['show_home']);
        $biolink['settings']['show_experience'] = isset($_POST['show_experience']);
        $biolink['settings']['show_gallery'] = isset($_POST['show_gallery']);
        $biolink['settings']['show_blog'] = isset($_POST['show_blog']);
        $biolink['settings']['show_contact'] = isset($_POST['show_contact']);
        app_json_write(__DIR__ . '/../' . $biolinkPath, $biolink);
        $successMsg = "Visibility settings updated successfully!";
    }

    if ($action === 'change_password') {
        $current = $_POST['current_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';

        if (!password_verify($current, $biolink['settings']['password_hash'])) {
            $msg = "Error: Current password is incorrect.";
        } elseif ($new !== $confirm) {
            $msg = "Error: New passwords do not match.";
        } elseif (strlen($new) < 6) {
            $msg = "Error: New password must be at least 6 characters.";
        } else {
            $biolink['settings']['password_hash'] = password_hash($new, PASSWORD_DEFAULT);
            app_json_write(__DIR__ . '/../' . $biolinkPath, $biolink);
            $successMsg = "Password changed successfully!";
        }
    }

    // Socials
    if ($action === 'add_social') {
        $newId = 's' . uniqid();
        $biolink['socials'][] = [
            'id' => $newId,
            'name' => app_h($_POST['social_name']),
            'url' => $_POST['social_url'],
            'icon' => app_h($_POST['social_icon']),
            'color' => app_h($_POST['social_color'])
        ];
        app_json_write(__DIR__ . '/../' . $biolinkPath, $biolink);
        $successMsg = "Social link added!";
    }
    if ($action === 'edit_social') {
        foreach ($biolink['socials'] as &$social) {
            if ($social['id'] === $_POST['social_id']) {
                $social['name'] = app_h($_POST['social_name']);
                $social['url'] = $_POST['social_url'];
                $social['icon'] = app_h($_POST['social_icon']);
                $social['color'] = app_h($_POST['social_color']);
                break;
            }
        }
        app_json_write(__DIR__ . '/../' . $biolinkPath, $biolink);
        $successMsg = "Social link updated!";
    }
    if ($action === 'delete_social') {
        $biolink['socials'] = array_values(array_filter($biolink['socials'], fn($s) => $s['id'] !== $_POST['social_id']));
        app_json_write(__DIR__ . '/../' . $biolinkPath, $biolink);
        $successMsg = "Social link deleted!";
    }

    // Experience
    if ($action === 'add_experience') {
        $is_running = isset($_POST['is_running']);
        $year_str = $_POST['start_month'].'-'.$_POST['start_year'].' to '.($is_running ? 'Present' : $_POST['end_month'].'-'.$_POST['end_year']);
        
        $newExp = [
            'id' => 'exp' . uniqid(),
            'title' => app_h($_POST['title']),
            'company' => app_h($_POST['company']),
            'desc' => app_h($_POST['desc']),
            'start_month' => $_POST['start_month'],
            'start_year' => $_POST['start_year'],
            'end_month' => $is_running ? "" : $_POST['end_month'],
            'end_year' => $is_running ? "" : $_POST['end_year'],
            'year' => $year_str,
            'is_running' => $is_running
        ];
        $experience[] = $newExp;
        app_json_write(__DIR__ . '/../' . $experiencePath, $experience);
        $successMsg = "Experience added!";
    }
    if ($action === 'edit_experience') {
        $is_running = isset($_POST['is_running']);
        $year_str = $_POST['start_month'].'-'.$_POST['start_year'].' to '.($is_running ? 'Present' : $_POST['end_month'].'-'.$_POST['end_year']);
        
        foreach ($experience as &$exp) {
            if ($exp['id'] === $_POST['exp_id']) {
                $exp['title'] = app_h($_POST['title']);
                $exp['company'] = app_h($_POST['company']);
                $exp['desc'] = app_h($_POST['desc']);
                $exp['start_month'] = $_POST['start_month'];
                $exp['start_year'] = $_POST['start_year'];
                $exp['end_month'] = $is_running ? "" : $_POST['end_month'];
                $exp['end_year'] = $is_running ? "" : $_POST['end_year'];
                $exp['year'] = $year_str;
                $exp['is_running'] = $is_running;
                break;
            }
        }
        app_json_write(__DIR__ . '/../' . $experiencePath, $experience);
        $successMsg = "Experience updated!";
    }
    if ($action === 'delete_experience') {
        $experience = array_values(array_filter($experience, fn($e) => $e['id'] !== $_POST['exp_id']));
        app_json_write(__DIR__ . '/../' . $experiencePath, $experience);
        $successMsg = "Experience deleted!";
    }

    // Blog
    if ($action === 'add_blog' || $action === 'edit_blog') {
        $imagePath = "";
        
        // Handle new image upload
        if (isset($_FILES['blog_image']) && $_FILES['blog_image']['error'] === 0) {
            $ext = pathinfo($_FILES['blog_image']['name'], PATHINFO_EXTENSION);
            $filename = 'blog_' . time() . '.' . $ext;
            if (move_uploaded_file($_FILES['blog_image']['tmp_name'], __DIR__ . '/../' . $blogUploadsDir . $filename)) {
                $imagePath = $blogUploadsDir . $filename;
            }
        }

        if ($action === 'add_blog') {
            $tags = [];
            if (!empty($_POST['tags'])) {
                $tags = array_filter(array_map('trim', explode(',', $_POST['tags'])));
            }

            $newBlog = [
                'id' => uniqid(),
                'title' => app_h($_POST['title']),
                'content' => $_POST['content'], // Removed htmlspecialchars and nl2br to allow rich text
                'date' => date('M d, Y'),
                'image' => $imagePath,
                'tags' => $tags
            ];
            array_unshift($blogs, $newBlog);
            $successMsg = "Blog post added!";
        } else {
            // Edit Blog
            $tags = [];
            if (!empty($_POST['tags'])) {
                $tags = array_filter(array_map('trim', explode(',', $_POST['tags'])));
            }

            foreach ($blogs as &$blog) {
                if (($blog['id'] ?? '') === $_POST['blog_id']) {
                    $blog['title'] = app_h($_POST['title']);
                    $blog['content'] = $_POST['content'];
                    $blog['tags'] = $tags;
                    if ($imagePath !== "") {
                        // Delete old image if it exists
                        if (!empty($blog['image']) && file_exists(__DIR__ . '/../' . $blog['image'])) {
                            unlink(__DIR__ . '/../' . $blog['image']);
                        }
                        $blog['image'] = $imagePath;
                    }
                    break;
                }
            }
            $successMsg = "Blog post updated!";
        }
        app_json_write(__DIR__ . '/../' . $blogPath, $blogs);
        generate_sitemaps();
    }

    if ($action === 'delete_blog') {
        foreach ($blogs as $b) {
            if (($b['id'] ?? '') === $_POST['blog_id']) {
                if (!empty($b['image']) && file_exists(__DIR__ . '/../' . $b['image'])) {
                    unlink(__DIR__ . '/../' . $b['image']);
                }
            }
        }
        $blogs = array_values(array_filter($blogs, fn($b) => ($b['id'] ?? '') !== $_POST['blog_id']));
        app_json_write(__DIR__ . '/../' . $blogPath, $blogs);
        generate_sitemaps();
        $successMsg = "Blog post deleted!";
    }

    // AJAX Upload (used by JS for gallery)
    if ($action === 'upload_photo' && isset($_POST['is_ajax'])) {
        $result = ['success' => false, 'photos' => []];
        if (!empty($_FILES['fileToUpload']['name'][0])) {
            foreach ($_FILES['fileToUpload']['name'] as $key => $name) {
                if ($_FILES['fileToUpload']['error'][$key] == 0) {
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                        $targetFile = $uploadsDir . uniqid('img_') . '.' . $ext;
                        if (move_uploaded_file($_FILES['fileToUpload']['tmp_name'][$key], __DIR__ . '/../' . $targetFile)) {
                            // Upload successful
                        }
                    }
                }
            }
            $result['success'] = true;
            // Return updated photos list
            $updatedImages = array_filter((array)glob(__DIR__ . '/../' . $uploadsDir . "*.*"), function($file) {
                return preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file);
            });
            foreach($updatedImages as $img) {
                $result['photos'][] = ['url' => $uploadsDir . basename($img), 'name' => basename($img)];
            }
        }
        header('Content-Type: application/json');
        echo json_encode($result);
        exit;
    }

    // TinyMCE Image Upload endpoint
    if ($action === 'upload_tinymce_image') {
        $response = ['location' => ''];
        if (isset($_FILES['file']['name']) && $_FILES['file']['error'] === 0) {
            $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                $filename = 'post_img_' . time() . '_' . uniqid() . '.' . $ext;
                $targetFile = $blogUploadsDir . $filename;
                if (move_uploaded_file($_FILES['file']['tmp_name'], __DIR__ . '/../' . $targetFile)) {
                    $response['location'] = $targetFile;
                }
            }
        }
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // Gallery Delete
    if ($action === 'delete_photo') {
        $photoName = $_POST['photo_name'];
        $photoPath = $uploadsDir . basename($photoName);
        if (file_exists(__DIR__ . '/../' . $photoPath) && is_file(__DIR__ . '/../' . $photoPath)) {
            unlink(__DIR__ . '/../' . $photoPath);
            $successMsg = "Photo deleted!";
        }
    }

    // Redirect to avoid form resubmission
    if (!isset($_POST['is_ajax'])) {
        header("Location: " . $_SERVER['REQUEST_URI'] . "&msg=" . urlencode($successMsg));
        exit;
    }
}
$msg = isset($_GET['msg']) ? $_GET['msg'] : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Admin Panel</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"></script>
    <style>
        :root {
            /* Futuristic Dark Theme Variables */
            --bg-dark: #070913;
            --bg-gradient: radial-gradient(circle at top left, #1a153a 0%, #070913 50%, #091322 100%);
            --glass-bg: rgba(16, 20, 36, 0.45);
            --glass-border: rgba(255, 255, 255, 0.08);
            --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            
            --accent: #3b82f6;          /* Blue */
            --accent-glow: 0 0 15px rgba(59, 130, 246, 0.5);
            --accent-hover: #60a5fa;
            
            --danger: #ef4444;          /* Red */
            --danger-glow: 0 0 15px rgba(239, 68, 68, 0.4);
            
            --success: #10b981;         /* Green */
            --success-bg: rgba(16, 185, 129, 0.1);
            
            --sidebar-width: 280px;
            --card-radius: 20px;
            --input-radius: 12px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Base & Scrollbars */
        body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            background: var(--bg-dark);
            background-image: var(--bg-gradient);
            background-attachment: fixed;
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent); }

        /* General Utilities */
        .glass-panel {
            background: var(--glass-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--glass-border);
            box-shadow: var(--glass-shadow);
            border-radius: var(--card-radius);
        }

        @keyframes fadeInScale { 
            from { opacity: 0; transform: scale(0.95) translateY(10px); } 
            to { opacity: 1; transform: scale(1) translateY(0); } 
        }

        /* --- Login Screen --- */
        .login-wrapper { display: flex; align-items: center; justify-content: center; width: 100%; height: 100vh; padding: 20px; box-sizing: border-box; }
        .login-card {
            width: 100%; max-width: 400px; padding: 40px; text-align: center;
            animation: fadeInScale 0.6s ease-out forwards;
        }
        .login-card h2 { margin: 0 0 35px 0; font-weight: 700; font-size: 28px; letter-spacing: -0.5px; background: linear-gradient(90deg, #fff, var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .login-card .fa-lock { font-size: 48px; color: var(--accent); margin-bottom: 25px; filter: drop-shadow(var(--accent-glow)); }

        .form-group { margin-bottom: 24px; text-align: left; position: relative; }
        .form-group label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;}
        .form-control {
            width: 100%; padding: 14px 18px; border-radius: var(--input-radius); border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.3); color: white; font-size: 15px; outline: none; transition: var(--transition); box-sizing: border-box;
        }
        .form-control:focus { border-color: var(--accent); background: rgba(0,0,0,0.5); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        .form-control::file-selector-button { background: rgba(255,255,255,0.1); border:none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-right: 15px; transition: var(--transition); }
        .form-control::file-selector-button:hover { background: var(--accent); }

        .btn {
            background: linear-gradient(135deg, var(--accent), #2563eb); color: white; border: none; padding: 14px 28px; border-radius: var(--input-radius);
            cursor: pointer; font-size: 15px; font-weight: 600; width: 100%; transition: var(--transition); display: inline-flex; justify-content: center; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .btn:hover { transform: translateY(-3px); box-shadow: var(--accent-glow); background: linear-gradient(135deg, var(--accent-hover), var(--accent)); }
        
        .btn-danger { background: linear-gradient(135deg, var(--danger), #b91c1c); width: auto; }
        .btn-danger:hover { box-shadow: var(--danger-glow); background: linear-gradient(135deg, #f87171, var(--danger)); }
        
        .btn-secondary { background: rgba(255,255,255,0.1); }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); box-shadow: none; transform: translateY(-3px); }

        .msg-box { padding: 16px; border-radius: var(--input-radius); margin-bottom: 24px; font-size: 14px; display:flex; align-items:center; gap: 10px; animation: fadeInScale 0.4s ease-out; }
        .error-msg { color: #fca5a5; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); }
        .success-msg { color: #6ee7b7; background: var(--success-bg); border: 1px solid rgba(16,185,129,0.3); margin: 0 0 30px; }

        /* --- Admin Layout --- */
        .sidebar {
            width: var(--sidebar-width); height: 100vh; position: fixed; display: flex; flex-direction: column;
            border-right: 1px solid var(--glass-border); background: rgba(10, 12, 25, 0.6); backdrop-filter: blur(25px); z-index: 100; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-header { padding: 40px 30px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .sidebar-header img { width: 80px; height: 80px; border-radius: 50%; border: 3px solid transparent; background: linear-gradient(var(--bg-dark), var(--bg-dark)) padding-box, linear-gradient(45deg, var(--accent), #a855f7) border-box; object-fit: cover; margin-bottom: 15px; transition: transform 0.5s; }
        .sidebar-header img:hover { transform: rotate(10deg) scale(1.05); }
        .sidebar-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
        .sidebar-header p { margin: 5px 0 0; color: var(--accent); font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }
        
        .nav-items { flex: 1; padding: 25px 15px; list-style: none; margin: 0; overflow-y: auto; }
        .nav-item { margin-bottom: 8px; }
        .nav-link {
            display: flex; align-items: center; padding: 14px 20px; color: var(--text-muted); text-decoration: none; border-radius: 12px; transition: var(--transition); position: relative; overflow: hidden;
        }
        .nav-link i { width: 28px; font-size: 18px; transition: var(--transition); z-index: 2; }
        .nav-link span { z-index: 2; font-weight: 500; }
        
        .nav-link::before { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 0; background: linear-gradient(90deg, rgba(59,130,246,0.15), transparent); transition: var(--transition); z-index: 1; border-radius: 12px; }
        .nav-link:hover::before, .nav-link.active::before { width: 100%; }
        .nav-link:hover, .nav-link.active { color: white; }
        .nav-link:hover i, .nav-link.active i { color: var(--accent); transform: scale(1.1); filter: drop-shadow(0 0 5px var(--accent)); }
        
        .sidebar-footer { padding: 25px 15px; border-top: 1px solid rgba(255,255,255,0.05); }
        .sidebar-footer .btn { padding: 12px; background: rgba(239, 68, 68, 0.1); color: #fca5a5; font-size: 14px; }
        .sidebar-footer .btn:hover { background: var(--danger); color: white; box-shadow: var(--danger-glow); }

        .main-content { margin-left: var(--sidebar-width); padding: 50px; height: 100vh; overflow-y: auto; box-sizing: border-box; width: calc(100% - var(--sidebar-width)); scroll-behavior: smooth; }
        
        .mobile-header { display: none; }

        /* --- Sections & Cards --- */
        .content-section { display: none; margin-bottom: 50px; animation: fadeInScale 0.5s ease-out; }
        .content-section.active { display: block; }
        .section-header { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
        .section-header h1 { margin: 0; font-size: 36px; font-weight: 700; background: linear-gradient(45deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* Dash Cards */
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .stat-card { padding: 30px; display: flex; align-items: center; gap: 24px; transition: var(--transition); border-top: 1px solid rgba(255,255,255,0.15); border-left: 1px solid rgba(255,255,255,0.05); }
        .stat-card:hover { transform: translateY(-7px); box-shadow: 0 15px 35px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.3); }
        .stat-icon { width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: inset 0 0 20px rgba(255,255,255,0.05); }
        .stat-info h2 { margin: 0; font-size: 34px; font-weight: 800; }
        .stat-info p { margin: 5px 0 0; color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        /* Panels/Forms */
        .admin-panel { padding: 40px; margin-bottom: 30px; border-top: 1px solid rgba(255,255,255,0.15); }
        .admin-panel h3 { margin: 0 0 30px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 20px; font-weight: 600; color: #fff; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        
        /* Lists */
        .item-list { display: flex; flex-direction: column; gap: 16px; margin-top: 30px; }
        .list-item { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; transition: var(--transition); flex-wrap: wrap; gap: 20px; }
        .list-item:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.15); transform: translateX(5px); box-shadow: -5px 5px 20px rgba(0,0,0,0.2); }
        .item-info { flex: 1; min-width: 250px; }
        .item-info h4 { margin: 0 0 8px; font-size: 18px; display:flex; align-items:center; gap:12px; font-weight: 600; }
        .item-info p { margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.5; word-break: break-word; }
        .item-actions { display: flex; gap: 12px; }
        
        /* Gallery Grid */
        .gallery-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; margin-top: 30px;}
        .gallery-img-card { position: relative; border-radius: 16px; overflow: hidden; aspect-ratio: 1; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .gallery-img-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .gallery-img-card:hover img { transform: scale(1.1); }
        .delete-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 20px; opacity: 0; transition: var(--transition); }
        .gallery-img-card:hover .delete-overlay { opacity: 1; }

        /* Uploader */
        .upload-area { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed rgba(255,255,255,0.2); border-radius: 20px; padding: 50px 30px; text-align: center; cursor: pointer; transition: var(--transition); background: rgba(0,0,0,0.2); width: 100%; box-sizing: border-box; }
        .upload-area:hover { border-color: var(--accent); background: rgba(59,130,246,0.05); box-shadow: inset 0 0 30px rgba(59,130,246,0.1); }
        .upload-area i { font-size: 54px; color: var(--accent); margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(59,130,246,0.3)); }
        
        /* Progress Box */
        .progress-box { display: none; margin-top: 25px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .progress-bar { height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; margin-top: 12px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3); }
        #progressBarFill { height: 100%; background: linear-gradient(90deg, var(--accent), #a855f7); width: 0%; transition: width 0.3s ease; box-shadow: 0 0 10px rgba(59,130,246,0.5); }

        /* Modals */
        .tox-tinymce-aux { z-index: 999999 !important; } /* Fix TinyMCE dialog behind custom modal */
        .modal { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: var(--transition); padding: 20px; overflow-y: auto; }
        .modal.active { opacity: 1; visibility: visible; }
        .modal-content { background: var(--bg-dark); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); border-radius: 20px; padding: 40px; width: 100%; max-width: 600px; transform: scale(0.9) translateY(20px); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; max-height: 90vh; overflow-y: auto; }
        .modal.active .modal-content { transform: scale(1) translateY(0); }
        .modal-close { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.05); border: none; color: #fff; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition); z-index: 10; font-size: 16px; }
        .modal-close:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; transform: rotate(90deg); }

        /* Mobile Adjustments */
        @media (max-width: 900px) {
            .sidebar { transform: translateX(-100%); box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
            .sidebar.show { transform: translateX(0); }
            .main-content { margin-left: 0; padding: 25px; width: 100%; }
            .mobile-header { display: flex !important; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .mobile-header h2 { font-size: 24px; font-weight: 700; background: linear-gradient(90deg, #fff, var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .form-row { grid-template-columns: 1fr; gap: 15px; }
            .admin-panel { padding: 25px; margin-bottom: 20px; }
            .section-header { flex-direction: column; align-items: flex-start; gap: 15px; margin-bottom: 25px; }
            .section-header h1 { font-size: 28px; }
            .section-header .btn { width: 100% !important; }
            .item-list .list-item { padding: 20px; flex-direction: column; align-items: flex-start; }
            .item-list .list-item img { width: 100% !important; height: auto !important; aspect-ratio: 16/9; margin: 0 !important; border-radius: 12px; }
            .item-actions { width: 100%; justify-content: flex-end; margin-top: 5px; }
            .gallery-admin-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
        }
    </style>
</head>
<body>

<?php if (!$isLoggedIn): ?>
    <div class="login-wrapper">
        <div class="login-card">
            <i class="fa-solid fa-lock"></i>
            <h2>Admin Login</h2>
            <?php if (isset($error)): ?><div class="error-msg"><?= $error ?></div><?php endif; ?>
            <form method="POST">
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" class="form-control" autofocus required>
                </div>
                <button type="submit" name="login" class="btn"><i class="fa-solid fa-right-to-bracket"></i> Login</button>
                <div style="margin-top: 20px;">
                    <a href="index.php" style="color: var(--text-muted); text-decoration: none; font-size: 14px;"><i class="fa-solid fa-arrow-left"></i> Back to Site</a>
                </div>
            </form>
        </div>
    </div>
<?php else: ?>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <?php 
                $adminImg = $biolink['profile']['image'] ?? 'images/profile.jpg';
                if (file_exists(__DIR__ . '/../' . $adminImg)) {
                    $adminImg .= '?v=' . filemtime(__DIR__ . '/../' . $adminImg);
                }
            ?>
            <img src="<?= app_h($adminImg) ?>" alt="Admin">
            <h3><?= app_h($biolink['profile']['name'] ?? 'Admin') ?></h3>
            <p>Admin Panel</p>
        </div>
        <ul class="nav-items">
            <li class="nav-item"><a href="#" class="nav-link active" onclick="switchTab('dashboard')"><i class="fa-solid fa-chart-line"></i> Dashboard</a></li>
            <li class="nav-item"><a href="#" class="nav-link" onclick="switchTab('profile')"><i class="fa-solid fa-id-badge"></i> Profile & Links</a></li>
            <li class="nav-item"><a href="#" class="nav-link" onclick="switchTab('experience')"><i class="fa-solid fa-briefcase"></i> Experience</a></li>
            <li class="nav-item"><a href="#" class="nav-link" onclick="switchTab('blog')"><i class="fa-solid fa-newspaper"></i> Blog</a></li>
            <li class="nav-item"><a href="#" class="nav-link" onclick="switchTab('gallery')"><i class="fa-solid fa-images"></i> Gallery</a></li>
            <li class="nav-item"><a href="#" class="nav-link" onclick="switchTab('settings')"><i class="fa-solid fa-gear"></i> Settings</a></li>
        </ul>
        <div class="sidebar-footer">
            <a href="?page=admin&logout=1" class="btn"><i class="fa-solid fa-power-off"></i> Logout</a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <div class="mobile-header">
            <h2 style="margin:0"><i class="fa-solid fa-shield-halved"></i> Admin</h2>
            <button class="btn btn-danger" onclick="document.getElementById('sidebar').classList.toggle('show')"><i class="fa-solid fa-bars"></i></button>
        </div>

        <?php if($msg): ?>
            <div class="success-msg"><i class="fa-solid fa-circle-check"></i> <?= app_h($msg) ?></div>
        <?php endif; ?>

        <!-- Dashboard -->
        <section id="tab-dashboard" class="content-section active">
            <div class="section-header">
                <h1>Overview</h1>
                <a href="index.php" class="btn" style="width:auto;" target="_blank"><i class="fa-solid fa-external-link-alt"></i> View Site</a>
            </div>
            
            <div class="dash-grid">
                <div class="stat-card glass-panel">
                    <div class="stat-icon"><i class="fa-solid fa-images"></i></div>
                    <div class="stat-info">
                        <h2><?= count($galleryImages) ?></h2>
                        <p>Total Photos</p>
                    </div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon" style="color:#10b981; background:rgba(16,185,129,0.1);"><i class="fa-solid fa-newspaper"></i></div>
                    <div class="stat-info">
                        <h2><?= count($blogs) ?></h2>
                        <p>Blog Posts</p>
                    </div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon" style="color:#f59e0b; background:rgba(245,158,11,0.1);"><i class="fa-solid fa-briefcase"></i></div>
                    <div class="stat-info">
                        <h2><?= count($experience) ?></h2>
                        <p>Experiences</p>
                    </div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-icon" style="color:#8b5cf6; background:rgba(139,92,246,0.1);"><i class="fa-solid fa-link"></i></div>
                    <div class="stat-info">
                        <h2><?= count($biolink['socials'] ?? []) ?></h2>
                        <p>Social Links</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Profile & Biolink -->
        <section id="tab-profile" class="content-section">
            <div class="section-header"><h1>Profile & Links</h1></div>
            
            <div class="admin-panel glass-panel">
                <h3>Main Details</h3>
                <form method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="update_profile">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" name="name" class="form-control" value="<?= app_h($biolink['profile']['name'] ?? '') ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Tagline</label>
                            <input type="text" name="tagline" class="form-control" value="<?= app_h($biolink['profile']['tagline'] ?? '') ?>" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Upload New Profile Image (Optional)</label>
                        <input type="file" name="profile_image" class="form-control" accept="image/*">
                    </div>
                    <button type="submit" class="btn" style="width:200px;"><i class="fa-solid fa-save"></i> Save Profile</button>
                </form>
            </div>

            <div class="admin-panel glass-panel">
                <h3>Add Social Link</h3>
                <form method="POST">
                    <input type="hidden" name="action" value="add_social">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Platform Name (e.g., Facebook)</label>
                            <input type="text" name="social_name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>URL / Link</label>
                            <input type="url" name="social_url" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>FontAwesome Icon (e.g., fa-facebook)</label>
                            <input type="text" name="social_icon" class="form-control" value="fa-link">
                        </div>
                        <div class="form-group">
                            <label>Brand Color</label>
                            <input type="color" name="social_color" class="form-control" value="#3b82f6" style="padding:4px; height:45px;">
                        </div>
                    </div>
                    <button type="submit" class="btn" style="width:200px;"><i class="fa-solid fa-plus"></i> Add Link</button>
                </form>

                <div class="item-list">
                    <?php foreach ($biolink['socials'] ?? [] as $social): ?>
                        <div class="list-item">
                            <div class="item-info">
                                <h4><i class="fa-brands <?= app_h($social['icon']) ?>" style="color: <?= app_h($social['color']) ?>"></i> <?= app_h($social['name']) ?></h4>
                                <p><?= app_h($social['url']) ?></p>
                            </div>
                            <div class="item-actions">
                                <button type="button" class="btn btn-secondary" onclick='editSocial(<?= json_encode($social) ?>)' style="background:var(--accent);"><i class="fa-solid fa-pen"></i></button>
                                <form method="POST" onsubmit="return confirm('Delete this link?');">
                                    <input type="hidden" name="action" value="delete_social">
                                    <input type="hidden" name="social_id" value="<?= app_h($social['id']) ?>">
                                    <button type="submit" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <!-- Settings -->
        <section id="tab-settings" class="content-section">
            <div class="section-header"><h1>Settings</h1></div>

            <div class="admin-panel glass-panel">
                <h3>Header Menu Visibility</h3>
                <form method="POST">
                    <input type="hidden" name="action" value="update_visibility">
                    <div class="form-row" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin-bottom: 25px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" name="show_home" style="width:18px;height:18px;" <?= ($biolink['settings']['show_home'] ?? true) ? 'checked' : '' ?>> Home
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" name="show_experience" style="width:18px;height:18px;" <?= ($biolink['settings']['show_experience'] ?? true) ? 'checked' : '' ?>> Experience
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" name="show_gallery" style="width:18px;height:18px;" <?= ($biolink['settings']['show_gallery'] ?? true) ? 'checked' : '' ?>> Gallery
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" name="show_blog" style="width:18px;height:18px;" <?= ($biolink['settings']['show_blog'] ?? true) ? 'checked' : '' ?>> Blog
                        </label>
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" name="show_contact" style="width:18px;height:18px;" <?= ($biolink['settings']['show_contact'] ?? true) ? 'checked' : '' ?>> Contact
                        </label>
                    </div>
                    <button type="submit" class="btn" style="width:200px;"><i class="fa-solid fa-eye"></i> Save Visibility</button>
                </form>
            </div>

            <div class="admin-panel glass-panel">
                <h3>Change Password</h3>
                <form method="POST">
                    <input type="hidden" name="action" value="change_password">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Current Password</label>
                            <input type="password" name="current_password" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>New Password</label>
                            <input type="password" name="new_password" class="form-control" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" name="confirm_password" class="form-control" required minlength="6">
                        </div>
                    </div>
                    <button type="submit" class="btn" style="width:200px; background: #eab308; color: #000;"><i class="fa-solid fa-key"></i> Update Password</button>
                </form>
            </div>
        </section>

        <!-- Experience -->
        <section id="tab-experience" class="content-section">
            <div class="section-header"><h1>Experience</h1></div>

            <div class="admin-panel glass-panel">
                <h3>Add New Role</h3>
                <form method="POST">
                    <input type="hidden" name="action" value="add_experience">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Job Title</label>
                            <input type="text" name="title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Company / Location</label>
                            <input type="text" name="company" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="desc" class="form-control" rows="3" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Start Date (MM and YYYY)</label>
                            <div style="display:flex; gap:10px;">
                                <input type="number" name="start_month" class="form-control" placeholder="Month (e.g. 05)" required min="1" max="12">
                                <input type="number" name="start_year" class="form-control" placeholder="Year (e.g. 2021)" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <div style="display:flex; gap:10px; margin-bottom: 10px;">
                                <input type="number" name="end_month" id="end_month" class="form-control" placeholder="Month">
                                <input type="number" name="end_year" id="end_year" class="form-control" placeholder="Year">
                            </div>
                            <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer;">
                                <input type="checkbox" name="is_running" id="is_running" onchange="toggleEndDate()" style="width:18px;height:18px;">
                                Currently Working Here
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="btn" style="width:200px; margin-top:10px;"><i class="fa-solid fa-plus"></i> Add Role</button>
                </form>

                <div class="item-list">
                    <?php foreach ($experience as $exp): ?>
                        <div class="list-item">
                            <div class="item-info">
                                <h4 style="color:var(--accent);"><?= app_h($exp['title']) ?></h4>
                                <p><strong><?= app_h($exp['company']) ?></strong> (<?= app_h($exp['year']) ?>)</p>
                                <p style="font-size:13px; margin-top:5px; opacity:0.8;"><?= app_h($exp['desc']) ?></p>
                            </div>
                            <div class="item-actions">
                                <button type="button" class="btn btn-secondary" onclick='editExperience(<?= json_encode($exp) ?>)' style="background:var(--accent);"><i class="fa-solid fa-pen"></i></button>
                                <form method="POST" onsubmit="return confirm('Delete this role?');">
                                    <input type="hidden" name="action" value="delete_experience">
                                    <input type="hidden" name="exp_id" value="<?= app_h($exp['id']) ?>">
                                    <button type="submit" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <!-- Blog -->
        <section id="tab-blog" class="content-section">
            <div class="section-header"><h1>Blog Manager</h1></div>
            
            <div class="admin-panel glass-panel">
                <h3>Write New Post</h3>
                <form method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="add_blog">
                    <div class="form-group">
                        <label>Post Title</label>
                        <input type="text" name="title" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Content</label>
                        <textarea name="content" class="form-control tinymce-editor" rows="10"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Cover Image (Optional)</label>
                        <input type="file" name="blog_image" class="form-control" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label>Tags / Keywords (Optional)</label>
                        <input type="text" name="tags" class="form-control" placeholder="e.g. SEO, Web Design, HTML">
                        <small style="color:var(--text-muted); display:block; margin-top:5px;">Separate tags with commas</small>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button type="button" class="btn btn-secondary" style="width:120px; background:var(--bg-secondary); color:var(--text-primary);" onclick="previewBlogPost('new')"><i class="fa-solid fa-eye"></i> Preview</button>
                        <button type="submit" class="btn" style="width:200px;"><i class="fa-solid fa-paper-plane"></i> Publish Post</button>
                    </div>
                </form>

                <div class="item-list">
                    <?php foreach ($blogs as $blog): ?>
                        <div class="list-item">
                            <?php if (!empty($blog['image'])): ?>
                                <img src="<?= app_h($blog['image']) ?>" alt="" style="width:80px; height:80px; object-fit:cover; border-radius:10px; margin-right:20px;">
                            <?php endif; ?>
                            <div class="item-info" style="flex:1;">
                                <h4><?= app_h($blog['title']) ?></h4>
                                <p><?= app_h($blog['date']) ?></p>
                            </div>
                            <div class="item-actions">
                                <button type="button" class="btn btn-secondary" onclick='editBlog(<?= json_encode($blog) ?>)' style="background:var(--accent);"><i class="fa-solid fa-pen"></i></button>
                                <form method="POST" onsubmit="return confirm('Delete this post?');">
                                    <input type="hidden" name="action" value="delete_blog">
                                    <input type="hidden" name="blog_id" value="<?= app_h($blog['id'] ?? '') ?>">
                                    <button type="submit" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <!-- Gallery -->
        <section id="tab-gallery" class="content-section">
            <div class="section-header"><h1>Photo Gallery</h1></div>
            
            <div class="admin-panel glass-panel">
                <h3>Upload Photos</h3>
                
                <form id="uploadForm" enctype="multipart/form-data">
                    <label class="upload-area" for="fileInput">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <h3>Click or Drag photos here to upload</h3>
                        <p style="color:var(--text-muted);">Supports JPG, PNG, GIF, WEBP</p>
                    </label>
                    <input type="file" id="fileInput" name="fileToUpload[]" multiple accept="image/*" style="display:none;">
                    
                    <div class="progress-box" id="uploadProgress">
                        <div style="display:flex; justify-content:space-between; font-size:14px;">
                            <span>Uploading...</span>
                            <span id="progressText">0%</span>
                        </div>
                        <div class="progress-bar"><div id="progressBarFill"></div></div>
                    </div>
                </form>
            <div class="admin-panel glass-panel" style="margin-top:40px;">
                <h3>Manage Gallery (<span id="photoCount"><?= count($galleryImages) ?></span>)</h3>
                <div class="gallery-admin-grid" id="photoGrid">
                    <?php foreach (array_reverse($galleryImages) as $img): ?>
                        <div class="gallery-img-card">
                            <img src="<?= app_h($img) ?>" loading="lazy">
                            <div class="delete-overlay">
                                <form method="POST" onsubmit="return confirm('Delete this photo?');">
                                    <input type="hidden" name="action" value="delete_photo">
                                    <input type="hidden" name="photo_name" value="<?= app_h(basename($img)) ?>">
                                    <button type="submit" class="btn btn-danger" style="padding:10px 15px; border-radius:50%;"><i class="fa-solid fa-trash"></i></button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

    </main>

<script>
    // Tab switching
    function switchTab(tabId) {
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.getElementById('tab-' + tabId).classList.add('active');
        event.currentTarget.classList.add('active');
        
        // Hide sidebar on mobile after clicking
        if(window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('show');
        }
    }

    // Toggle end date for experience
    function toggleEndDate() {
        const checked = document.getElementById('is_running').checked;
        const eMonth = document.getElementById('end_month');
        const eYear = document.getElementById('end_year');
        eMonth.disabled = checked;
        eYear.disabled = checked;
        if(checked) { eMonth.value = ''; eYear.value = ''; }
    }

    // Modal Helpers
    function openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        // Reset form inside when closing
        document.querySelector(`#${modalId} form`).reset();
        if(modalId === 'editExpModal') toggleModalEndDate();
    }

    // Toggle end date for experience modal
    function toggleModalEndDate() {
        const checked = document.getElementById('modal_exp_running').checked;
        const eMonth = document.getElementById('modal_exp_e_month');
        const eYear = document.getElementById('modal_exp_e_year');
        eMonth.disabled = checked;
        eYear.disabled = checked;
        if(checked) { eMonth.value = ''; eYear.value = ''; }
    }

    // Edit functions
    function editSocial(data) {
        document.getElementById('modal_social_name').value = data.name;
        document.getElementById('modal_social_url').value = data.url;
        document.getElementById('modal_social_icon').value = data.icon;
        document.getElementById('modal_social_color').value = data.color;
        document.getElementById('modal_social_id').value = data.id;
        openModal('editSocialModal');
    }

    function editExperience(data) {
        document.getElementById('modal_exp_title').value = data.title;
        document.getElementById('modal_exp_company').value = data.company;
        document.getElementById('modal_exp_desc').value = data.desc;
        document.getElementById('modal_exp_s_month').value = data.start_month;
        document.getElementById('modal_exp_s_year').value = data.start_year;
        document.getElementById('modal_exp_e_month').value = data.end_month;
        document.getElementById('modal_exp_e_year').value = data.end_year;
        document.getElementById('modal_exp_running').checked = data.is_running;
        toggleModalEndDate();
        document.getElementById('modal_exp_id').value = data.id;
        openModal('editExpModal');
    }

    function editBlog(data) {
        document.getElementById('modal_blog_title').value = data.title;
        if(tinymce.get('modal_blog_content')) {
            tinymce.get('modal_blog_content').setContent(data.content || "");
        } else {
            document.getElementById('modal_blog_content').value = data.content || "";
        }
        document.getElementById('modal_blog_tags').value = (data.tags && Array.isArray(data.tags)) ? data.tags.join(', ') : "";
        document.getElementById('modal_blog_id').value = data.id;
        openModal('editBlogModal');
    }

    // Initialize TinyMCE for blog textarea
    tinymce.init({
        selector: '.tinymce-editor',
        plugins: 'link image autolink lists code template',
        toolbar: 'bold italic underline | bullist numlist | link image template code | removeformat',
        menubar: false,
        skin: 'oxide-dark',
        content_css: 'dark',
        height: 400,
        paste_data_images: true, // Allows pasting images directly
        images_upload_url: '?page=admin&action=upload_tinymce_image',
        automatic_uploads: true,
        file_picker_callback: function (callback, value, meta) {
            if (meta.filetype === 'image') {
                openModal('imagePickerModal');
                window.tinymceImageCallback = callback;
            }
        },
        templates: [
            {
                title: 'Standard Article',
                description: 'A basic blog post layout with an intro, image, and paragraphs.',
                content: '<h2>Introduction Heading</h2><p>Start your article here...</p><img src="https://via.placeholder.com/800x400" alt="Placeholder" style="width:100%; height:auto; border-radius:8px; margin: 20px 0;"><p>Continue writing here...</p><h3>Subheading</h3><p>More details...</p>'
            },
            {
                title: 'Image Left, Text Right',
                description: 'A layout with an image on the left and text on the right.',
                content: '<div style="display:flex; gap:20px; flex-wrap:wrap; align-items:center;"><div style="flex:1; min-width:250px;"><img src="https://via.placeholder.com/400x300" alt="Placeholder" style="width:100%; height:auto; border-radius:8px;"></div><div style="flex:2; min-width:250px;"><h3>Subject Title</h3><p>Describe the subject here in detail. This text will sit beside the image on larger screens and stack below it on mobile devices.</p></div></div><p style="clear:both; padding-top:20px;">Continue the rest of the blog post down here...</p>'
            },
            {
                title: 'Two Column List / Features',
                description: 'A two-column layout perfect for lists or features.',
                content: '<h2>Key Features</h2><div style="display:flex; gap:20px; flex-wrap:wrap;"><div style="flex:1; min-width:200px; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px;"><h4>Feature 1</h4><p>Description of the first feature.</p></div><div style="flex:1; min-width:200px; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px;"><h4>Feature 2</h4><p>Description of the second feature.</p></div></div><br>'
            },
            {
                title: 'Direct Link Image',
                description: 'Insert an image directly from another website using its URL.',
                content: '<!-- REPLACE THE src LINK BELOW WITH YOUR DIRECT IMAGE LINK -->\n<img src="https://example.com/your-direct-image-link.jpg" alt="Direct Image" style="width:100%; height:auto; border-radius:8px; display:block; margin:20px auto;">\n<p style="text-align:center; color:gray; font-size:14px;">Image Description or Source</p>'
            },
            {
                title: 'Step-by-Step Guide',
                description: 'A structured list layout for tutorials or guides.',
                content: '<h2>How to do X in 3 Steps</h2><div style="margin-top:20px;"><div style="display:flex; gap:15px; margin-bottom:20px;"><div style="width:40px; height:40px; border-radius:50%; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; flex-shrink:0;">1</div><div><h3>First Step Title</h3><p>Detailed explanation of the first step.</p></div></div><div style="display:flex; gap:15px; margin-bottom:20px;"><div style="width:40px; height:40px; border-radius:50%; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; flex-shrink:0;">2</div><div><h3>Second Step Title</h3><p>Detailed explanation of the second step.</p></div></div><div style="display:flex; gap:15px; margin-bottom:20px;"><div style="width:40px; height:40px; border-radius:50%; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; flex-shrink:0;">3</div><div><h3>Third Step Title</h3><p>Detailed explanation of the final step.</p></div></div></div>'
            },
            {
                title: 'Comparison Table',
                description: 'A responsive table ideal for comparing features or specifications.',
                content: '<h2>Feature Comparison</h2><div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; text-align:left; background:rgba(255,255,255,0.02); border-radius:8px; overflow:hidden;"><thead><tr style="background:rgba(255,255,255,0.05);"> <th style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">Feature</th> <th style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">Basic Plan</th> <th style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">Pro Plan</th></tr></thead><tbody><tr> <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">Storage</td> <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">10 GB</td> <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">100 GB</td></tr><tr> <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">Bandwidth</td> <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">Unmetered</td> <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">Unmetered</td></tr><tr> <td style="padding:15px;">Support</td> <td style="padding:15px;">Email</td> <td style="padding:15px;">24/7 Priority</td></tr></tbody></table></div><br>'
            }
        ],
        content_style: 'body { font-family: Inter, sans-serif; } img { display: block; margin: 15px auto; max-width: 100%; height: auto; border-radius: 8px; }',
        setup: function (editor) {
            editor.on('change', function () {
                editor.save();
            });
        }
    });

    // AJAX Bulk File Upload for Gallery
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', async function() {
            if (this.files.length === 0) return;
            
            const progressBox = document.getElementById('uploadProgress');
            const progressFill = document.getElementById('progressBarFill');
            const progressText = document.getElementById('progressText');
            
            progressBox.style.display = 'block';
            let formData = new FormData();
            formData.append('action', 'upload_photo');
            formData.append('is_ajax', '1');
            
            for(let i=0; i<this.files.length; i++) {
                formData.append('fileToUpload[]', this.files[i]);
            }

            try {
                // Simulate progress (since fetch doesn't support trackable upload progress easily without XMLHttpRequest)
                let progress = 0;
                let interval = setInterval(() => {
                    progress += 5;
                    if(progress > 90) clearInterval(interval);
                    progressFill.style.width = progress + '%';
                    progressText.innerText = progress + '%';
                }, 100);

                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData
                });
                
                clearInterval(interval);
                progressFill.style.width = '100%';
                progressText.innerText = 'Complete!';
                
                const result = await response.json();
                if (result.success) {
                    setTimeout(() => window.location.reload(), 500); // Reload to show new images properly
                } else {
                    alert('Upload failed.');
                }
            } catch (err) {
                alert('An error occurred uploading files.');
                console.error(err);
            }
        });
    }
</script>

<!-- Edit Social Modal -->
<div class="modal" id="editSocialModal">
    <div class="modal-content">
        <button class="modal-close" onclick="closeModal('editSocialModal')"><i class="fa-solid fa-times"></i></button>
        <h3><i class="fa-solid fa-pen"></i> Edit Social Link</h3>
        <form method="POST">
            <input type="hidden" name="action" value="edit_social">
            <input type="hidden" name="social_id" id="modal_social_id" value="">
            <div class="form-row">
                <div class="form-group">
                    <label>Platform Name</label>
                    <input type="text" name="social_name" id="modal_social_name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>URL / Link</label>
                    <input type="url" name="social_url" id="modal_social_url" class="form-control" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>FontAwesome Icon</label>
                    <input type="text" name="social_icon" id="modal_social_icon" class="form-control">
                </div>
                <div class="form-group">
                    <label>Brand Color</label>
                    <input type="color" name="social_color" id="modal_social_color" class="form-control" style="padding:4px; height:45px;">
                </div>
            </div>
            <button type="submit" class="btn" style="width:100%; margin-top:15px;"><i class="fa-solid fa-save"></i> Save Changes</button>
        </form>
    </div>
</div>

<!-- Edit Experience Modal -->
<div class="modal" id="editExpModal">
    <div class="modal-content">
        <button class="modal-close" onclick="closeModal('editExpModal')"><i class="fa-solid fa-times"></i></button>
        <h3><i class="fa-solid fa-pen"></i> Edit Experience</h3>
        <form method="POST">
            <input type="hidden" name="action" value="edit_experience">
            <input type="hidden" name="exp_id" id="modal_exp_id" value="">
            <div class="form-row">
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" name="title" id="modal_exp_title" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Company / Location</label>
                    <input type="text" name="company" id="modal_exp_company" class="form-control" required>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="desc" id="modal_exp_desc" class="form-control" rows="3" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <div style="display:flex; gap:10px;">
                        <input type="number" name="start_month" id="modal_exp_s_month" class="form-control" placeholder="MM" required min="1" max="12">
                        <input type="number" name="start_year" id="modal_exp_s_year" class="form-control" placeholder="YYYY" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <div style="display:flex; gap:10px; margin-bottom: 10px;">
                        <input type="number" name="end_month" id="modal_exp_e_month" class="form-control" placeholder="MM">
                        <input type="number" name="end_year" id="modal_exp_e_year" class="form-control" placeholder="YYYY">
                    </div>
                    <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="checkbox" name="is_running" id="modal_exp_running" onchange="toggleModalEndDate()" style="width:18px;height:18px;">
                        Currently Working Here
                    </label>
                </div>
            </div>
            <button type="submit" class="btn" style="width:100%; margin-top:15px;"><i class="fa-solid fa-save"></i> Save Changes</button>
        </form>
    </div>
</div>

<!-- Edit Blog Modal -->
<div class="modal" id="editBlogModal">
    <div class="modal-content">
        <button class="modal-close" onclick="closeModal('editBlogModal')"><i class="fa-solid fa-times"></i></button>
        <h3><i class="fa-solid fa-pen"></i> Edit Blog Post</h3>
        <form method="POST" enctype="multipart/form-data">
            <input type="hidden" name="action" value="edit_blog">
            <input type="hidden" name="blog_id" id="modal_blog_id" value="">
            <div class="form-group">
                <label>Post Title</label>
                <input type="text" name="title" id="modal_blog_title" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea name="content" id="modal_blog_content" class="form-control tinymce-editor" rows="10"></textarea>
            </div>
            <div class="form-group">
                <label>Update Cover Image (Optional)</label>
                <input type="file" name="blog_image" class="form-control" accept="image/*">
                <small style="color:var(--text-muted); display:block; margin-top:5px;">Leave empty to keep existing image</small>
            </div>
            <div class="form-group">
                <label>Tags / Keywords (Optional)</label>
                <input type="text" name="tags" id="modal_blog_tags" class="form-control" placeholder="e.g. SEO, Web Design, HTML">
                <small style="color:var(--text-muted); display:block; margin-top:5px;">Separate tags with commas</small>
            </div>
            <div style="display:flex; gap:10px; margin-top:15px;">
                <button type="button" class="btn btn-secondary" style="width:40%; background:var(--bg-secondary); color:var(--text-primary);" onclick="previewBlogPost('edit')"><i class="fa-solid fa-eye"></i> Preview</button>
                <button type="submit" class="btn" style="width:60%;"><i class="fa-solid fa-save"></i> Save Changes</button>
            </div>
        </form>
    </div>
</div>

<!-- TinyMCE Image Picker Modal -->
<div class="modal" id="imagePickerModal" style="z-index: 9999999;">
    <div class="modal-content" style="max-width: 800px;">
        <button class="modal-close" onclick="closeModal('imagePickerModal')"><i class="fa-solid fa-times"></i></button>
        <h3 style="margin-bottom: 20px;"><i class="fa-solid fa-image"></i> Select Blog Image</h3>
        <div class="gallery-admin-grid" style="max-height: 50vh; overflow-y: auto; padding-right: 10px;">
            <?php
            $blogImgs = array_filter((array)glob(__DIR__ . '/../' . $blogUploadsDir . "*.*"), fn($f) => preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $f));
            foreach($blogImgs as $imgFile):
                $relPath = str_replace(str_replace('\\', '/', __DIR__ . '/../'), '', str_replace('\\', '/', $imgFile));
                $webPath = ltrim($relPath, '/');
            ?>
                <div class="gallery-img-card" style="cursor: pointer; border: 2px solid transparent; transition: all 0.2s;" onclick="selectTinyMceImage('<?= app_h($webPath) ?>')" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='transparent'">
                    <img src="<?= app_h($webPath) ?>" alt="">
                </div>
            <?php endforeach; ?>
            <?php if(empty($blogImgs)): ?>
                <p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No blog images found. Upload one first.</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
function selectTinyMceImage(url) {
    if (window.tinymceImageCallback) {
        window.tinymceImageCallback(url, { alt: 'Blog Image' });
        closeModal('imagePickerModal');
        window.tinymceImageCallback = null;
    }
}

// Live Blog Preview Feature
function previewBlogPost(mode) {
    let title = "", content = "", tagsStr = "";
    
    if (mode === 'new') {
        title = document.querySelector('input[name="title"]').value || 'Untitled Post';
        // The first textarea is the new post content
        let newPostEditor = tinymce.editors.find(e => e.id !== 'modal_blog_content');
        if (newPostEditor) content = newPostEditor.getContent();
        tagsStr = document.querySelector('input[name="tags"]').value;
    } else {
        title = document.getElementById('modal_blog_title').value || 'Untitled Post';
        let editPostEditor = tinymce.get('modal_blog_content');
        if (editPostEditor) content = editPostEditor.getContent();
        tagsStr = document.getElementById('modal_blog_tags').value;
    }

    let tagsHtml = "";
    if (tagsStr) {
        let tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
        if (tags.length > 0) {
            tagsHtml = `<div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 8px;">`;
            tags.forEach(t => {
                tagsHtml += `<span style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; color: var(--accent);">#${t}</span>`;
            });
            tagsHtml += `</div>`;
        }
    }

    document.getElementById('preview_title').innerText = title;
    document.getElementById('preview_tags').innerHTML = tagsHtml;
    document.getElementById('preview_content').innerHTML = content || '<p style="color:var(--text-muted);text-align:center;">No content provided.</p>';
    
    // Set a formatted date
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    document.getElementById('preview_date').innerText = months[d.getMonth()] + ' ' + String(d.getDate()).padStart(2, '0') + ', ' + d.getFullYear();

    openModal('blogPreviewModal');
}
</script>

<!-- Live Blog Preview Modal -->
<div class="modal" id="blogPreviewModal" style="z-index: 999999;">
    <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto; padding: 0;">
        <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: var(--bg-card); z-index: 10;">
            <h3 style="margin: 0;"><i class="fa-solid fa-eye"></i> Live Post Preview</h3>
            <button class="modal-close" style="position: relative; top: 0; right: 0;" onclick="closeModal('blogPreviewModal')"><i class="fa-solid fa-times"></i></button>
        </div>
        <div style="padding: 30px; background: var(--bg-primary);">
            <div class="card" style="padding: 30px;">
                <div class="header" style="margin-bottom: 20px; text-align: left;">
                    <h1 id="preview_title" style="font-size: 2rem; margin-bottom: 10px; color: var(--text-primary);"></h1>
                    <div style="color: var(--text-tertiary); font-size: 0.9rem;">
                        <i class="fa fa-calendar"></i> <span id="preview_date"></span>
                    </div>
                    <div id="preview_tags"></div>
                </div>

                <style>
                    #preview_content img {
                        max-width: 100% !important;
                        height: auto !important;
                        border-radius: 8px;
                        display: block;
                        margin: 15px auto;
                    }
                </style>
                <div id="preview_content" class="content" style="color: var(--text-secondary); line-height: 1.8; font-size: 1.1rem;">
                </div>
            </div>
        </div>
    </div>
</div>

<?php endif; ?>
</body>
</html>