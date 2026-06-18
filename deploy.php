<?php
/**
 * deploy.php — MENA Advisory webhook
 * Receives JSON { filename, content } and writes to public_html.
 * Auto-chmods every file to 0644 after writing.
 */

// ── Auth ─────────────────────────────────────────────────────────────────────
define('DEPLOY_TOKEN', 'm1dv3s4ry-Ticker-2026-Secure');
define('WEB_ROOT',     '/home/madvisor/public_html');

header('Content-Type: application/json');

$token = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
if ($token !== DEPLOY_TOKEN) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// ── Parse body ────────────────────────────────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
if (!isset($body['filename'], $body['content'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing filename or content']);
    exit;
}

$filename = $body['filename'];
$content  = $body['content'];

// ── Validate filename ─────────────────────────────────────────────────────────
// Allow: plain .html files, sitemap.xml, or paths inside the known subdirectories
// (services/, solutions/) one level deep. No "..", no leading "/", no other traversal.
$allowedSubdirs = ['services', 'solutions'];
$isValid = false;
$dest = null;

if ($filename === 'sitemap.xml') {
    $isValid = true;
    $dest = WEB_ROOT . '/sitemap.xml';
} elseif (preg_match('/^[a-zA-Z0-9][a-zA-Z0-9\-\.]*\.html$/', $filename)) {
    // Root-level .html file
    $isValid = true;
    $dest = WEB_ROOT . '/' . $filename;
} elseif (preg_match('#^([a-zA-Z0-9\-]+)/([a-zA-Z0-9][a-zA-Z0-9\-\.]*\.html)$#', $filename, $m)) {
    // One-level subdirectory, e.g. services/digital-transformation.html
    $subdir = $m[1];
    $file   = $m[2];
    if (in_array($subdir, $allowedSubdirs, true)) {
        $isValid = true;
        $dest = WEB_ROOT . '/' . $subdir . '/' . $file;
    }
}

if (!$isValid || $dest === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid filename: ' . $filename]);
    exit;
}

// ── Write file ────────────────────────────────────────────────────────────────
$bytes = file_put_contents($dest, $content);
if ($bytes === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Write failed for ' . $filename]);
    exit;
}

// ── Fix permissions ───────────────────────────────────────────────────────────
chmod($dest, 0644);

echo json_encode([
    'ok'    => true,
    'file'  => $filename,
    'bytes' => $bytes,
    'perms' => '0644',
]);
