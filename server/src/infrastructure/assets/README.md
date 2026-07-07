# Static assets

Static files consumed by infrastructure-layer code (PDF generation,
mail templates, etc.). Read at runtime via `fs/promises`.

## umss-logo.png

The university logo embedded in the **cover page** and **section divider**
of every merged kardex PDF.

- **Expected path:** `src/infrastructure/assets/umss-logo.png`
- **Format:** PNG (recommended, supports transparency) or JPG.
- **Recommended size:** 400×400 to 800×800 px. The MergeFileService scales
  it down to fit the colored band on the cover.
- **Aspect ratio:** Preserved at render time; cuadrado o rectangular OK.
- **If the file is missing:** the cover and divider render without a logo
  (no crash, no warning). Drop the file in this folder and restart the
  server to make it appear.

## Adding new assets

If you add more static files here:

1. Use `path.join(projectRoot, 'src/infrastructure/assets/<name>')` to
   resolve the absolute path.
2. Cache the bytes after the first read (the MergeFileService logo loader
   is a good template — see `getLogoBytes()`).
3. Handle missing files gracefully — the application should keep working
   even if a non-critical asset is absent.
