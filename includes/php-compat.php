<?php

declare(strict_types=1);

const APP_TARGET_PHP_VERSION = '8.4';
const APP_MIN_PHP_VERSION = '8.1.0';

if (version_compare(PHP_VERSION, APP_MIN_PHP_VERSION, '<')) {
    http_response_code(500);
    exit('This application requires PHP ' . APP_MIN_PHP_VERSION . ' or newer.');
}

function app_h(mixed $value): string
{
    return htmlspecialchars((string)($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function app_json_read(string $path, array $default = []): array
{
    if (!is_file($path) || !is_readable($path)) {
        return $default;
    }

    $contents = file_get_contents($path);
    if ($contents === false || trim($contents) === '') {
        return $default;
    }

    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : $default;
}

function app_json_write(string $path, array $data): bool
{
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        return false;
    }

    return file_put_contents($path, $json . PHP_EOL, LOCK_EX) !== false;
}

function app_string_excerpt(string $value, int $length): string
{
    $clean = trim(preg_replace('/\s+/', ' ', strip_tags($value)) ?? '');
    if ($clean === '') {
        return '';
    }

    if (function_exists('mb_substr')) {
        return mb_substr($clean, 0, $length, 'UTF-8');
    }

    return substr($clean, 0, $length);
}
