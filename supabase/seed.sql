-- Seed Data: Pre-built Theme Presets
-- Run this AFTER schema.sql

INSERT INTO themes (name, primary_hex, secondary_hex, accent_hex, background_hex, text_hex, font_family) VALUES
  (
    'Ocean Blue',
    '#0ea5e9',
    '#06b6d4',
    '#f59e0b',
    '#ffffff',
    '#0f172a',
    'Inter, system-ui, sans-serif'
  ),
  (
    'Forest Green',
    '#22c55e',
    '#10b981',
    '#eab308',
    '#ffffff',
    '#1e293b',
    'Poppins, system-ui, sans-serif'
  ),
  (
    'Royal Purple',
    '#8b5cf6',
    '#a855f7',
    '#f97316',
    '#ffffff',
    '#1e1b4b',
    'Plus Jakarta Sans, system-ui, sans-serif'
  ),
  (
    'Sunset Orange',
    '#f97316',
    '#fb923c',
    '#0ea5e9',
    '#fffbeb',
    '#431407',
    'DM Sans, system-ui, sans-serif'
  ),
  (
    'Midnight Dark',
    '#6366f1',
    '#818cf8',
    '#22d3ee',
    '#0f172a',
    '#f1f5f9',
    'Space Grotesk, system-ui, sans-serif'
  ),
  (
    'Rose Pink',
    '#ec4899',
    '#f472b6',
    '#8b5cf6',
    '#fdf2f8',
    '#831843',
    'Outfit, system-ui, sans-serif'
  );
