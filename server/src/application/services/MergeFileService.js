import globalPlan from "../../infrastructure/db/models/globalplan.js";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import KardexError from "../../interface/error/kardexErrors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');

// ============================================================================
// Logo asset — lazy-loaded once and embedded into every merged PDF
// ============================================================================
const LOGO_RELATIVE_PATH = 'src/infrastructure/assets/umss-logo.png';

// Sentinels:  null = not tried yet,  false = tried but missing,  Buffer = loaded
let _logoBytesCache = null;

async function getLogoBytes() {
    if (_logoBytesCache !== null) return _logoBytesCache || null;
    try {
        _logoBytesCache = await fs.readFile(path.join(projectRoot, LOGO_RELATIVE_PATH));
        return _logoBytesCache;
    } catch {
        _logoBytesCache = false; // remember "missing" so we don't retry on every PDF
        return null;
    }
}

/**
 * Embeds the logo into a specific PDFDocument. Each new merged PDF needs its
 * own embed (pdf-lib bindings are doc-scoped). Falls back gracefully if the
 * bytes aren't loadable as PNG or JPG, so a corrupt file doesn't crash the
 * whole upload flow.
 */
async function embedLogoIn(pdf) {
    const bytes = await getLogoBytes();
    if (!bytes) return null;
    try { return await pdf.embedPng(bytes); }
    catch {
        try { return await pdf.embedJpg(bytes); }
        catch { return null; }
    }
}

// ============================================================================
// Design system — colors, fonts, layout constants used across cover/divider
// ============================================================================
const COLORS = {
    primary:     rgb(0.071, 0.271, 0.490), // UMSS-style deep blue
    primaryDark: rgb(0.039, 0.169, 0.314),
    accent:      rgb(0.851, 0.196, 0.243), // warm red accent
    text:        rgb(0.133, 0.133, 0.133),
    muted:       rgb(0.451, 0.451, 0.451),
    lightBg:     rgb(0.961, 0.969, 0.980),
    border:      rgb(0.827, 0.847, 0.882),
    white:       rgb(1, 1, 1),
};

const PAGE_SIZE = { width: 612, height: 792 }; // US Letter
const MARGIN = 50;
const UNIVERSITY = "UNIVERSIDAD MAYOR DE SAN SIMÓN";
const DOC_TITLE = "KARDEX ACADÉMICO";

// ============================================================================
// Drawing helpers
// ============================================================================

/** Colored band across the top of a page with the university name (and optional logo). */
function drawTopBand(page, font, logo) {
    const bandHeight = 70;
    page.drawRectangle({
        x: 0,
        y: PAGE_SIZE.height - bandHeight,
        width: PAGE_SIZE.width,
        height: bandHeight,
        color: COLORS.primary,
    });
    page.drawRectangle({
        x: 0,
        y: PAGE_SIZE.height - bandHeight - 4,
        width: PAGE_SIZE.width,
        height: 4,
        color: COLORS.accent,
    });

    // Logo on the LEFT of the band, vertically centered. Preserves aspect ratio.
    if (logo) {
        const logoMaxH = 48;
        const aspect = logo.width / logo.height;
        const logoH = logoMaxH;
        const logoW = logoH * aspect;
        page.drawImage(logo, {
            x: 18,
            y: PAGE_SIZE.height - bandHeight + (bandHeight - logoH) / 2,
            width: logoW,
            height: logoH,
        });
    }

    // University name stays centered — the logo on the left adds visual weight
    // without forcing us to re-anchor the title.
    const textWidth = font.widthOfTextAtSize(UNIVERSITY, 14);
    page.drawText(UNIVERSITY, {
        x: (PAGE_SIZE.width - textWidth) / 2,
        y: PAGE_SIZE.height - bandHeight / 2 - 5,
        size: 14,
        font,
        color: COLORS.white,
    });
}

/** Builds the polished cover page (1st page of the merged document). */
function buildCoverPage(pdf, fonts, meta, logo) {
    const page = pdf.addPage([PAGE_SIZE.width, PAGE_SIZE.height]);
    drawTopBand(page, fonts.bold, logo);

    // Main title
    const titleSize = 32;
    const titleW = fonts.bold.widthOfTextAtSize(DOC_TITLE, titleSize);
    page.drawText(DOC_TITLE, {
        x: (PAGE_SIZE.width - titleW) / 2,
        y: PAGE_SIZE.height - 175,
        size: titleSize,
        font: fonts.bold,
        color: COLORS.primary,
    });

    // Decorative accent line under the title
    page.drawLine({
        start: { x: PAGE_SIZE.width / 2 - 60, y: PAGE_SIZE.height - 190 },
        end:   { x: PAGE_SIZE.width / 2 + 60, y: PAGE_SIZE.height - 190 },
        thickness: 2,
        color: COLORS.accent,
    });

    // Subtitle
    const subtitle = "Documento oficial";
    const subW = fonts.italic.widthOfTextAtSize(subtitle, 14);
    page.drawText(subtitle, {
        x: (PAGE_SIZE.width - subW) / 2,
        y: PAGE_SIZE.height - 220,
        size: 14,
        font: fonts.italic,
        color: COLORS.muted,
    });

    // Now: 7 data rows → taller card so everything breathes.
    const rows = [
        ["Nombre",           meta.studentName],
        ["Código SIS",       meta.sisCode],
        ["Carrera",          meta.career],
        ["Materia",          meta.subject],
        ["Nota",             meta.nota],
        ["Créditos",         meta.creditos],
        ["Gestión",          meta.gestion],
        ["Fecha de emisión", meta.date],
    ];

    const HEADER_H = 38;
    const ROW_H    = 24;
    const PAD_TOP  = 14;
    const PAD_BOT  = 14;
    const boxH    = HEADER_H + PAD_TOP + ROW_H * rows.length + PAD_BOT;
    const boxY    = PAGE_SIZE.height - 280 - boxH;

    page.drawRectangle({
        x: MARGIN,
        y: boxY,
        width: PAGE_SIZE.width - 2 * MARGIN,
        height: boxH,
        color: COLORS.lightBg,
        borderColor: COLORS.border,
        borderWidth: 1,
    });
    page.drawRectangle({
        x: MARGIN,
        y: boxY + boxH - HEADER_H,
        width: PAGE_SIZE.width - 2 * MARGIN,
        height: HEADER_H,
        color: COLORS.primary,
    });
    page.drawText("INFORMACIÓN DEL ESTUDIANTE", {
        x: MARGIN + 20,
        y: boxY + boxH - 25,
        size: 12,
        font: fonts.bold,
        color: COLORS.white,
    });

    let rowY = boxY + boxH - HEADER_H - PAD_TOP - 11;
    for (const [label, value] of rows) {
        page.drawText(`${label}:`, {
            x: MARGIN + 25,
            y: rowY,
            size: 11,
            font: fonts.bold,
            color: COLORS.text,
        });
        page.drawText(String(value ?? '—'), {
            x: MARGIN + 175,
            y: rowY,
            size: 11,
            font: fonts.regular,
            color: COLORS.text,
        });
        rowY -= ROW_H;
    }

    // Discreet decoration above the bottom info line
    const infoY = 90;
    page.drawLine({
        start: { x: MARGIN, y: infoY + 25 },
        end:   { x: PAGE_SIZE.width - MARGIN, y: infoY + 25 },
        thickness: 0.5,
        color: COLORS.border,
    });
    const footerInfo = `Sistema de Gestión de Kardex  ·  Generado: ${meta.date}`;
    const fW = fonts.regular.widthOfTextAtSize(footerInfo, 9);
    page.drawText(footerInfo, {
        x: (PAGE_SIZE.width - fW) / 2,
        y: infoY,
        size: 9,
        font: fonts.regular,
        color: COLORS.muted,
    });
}

/** Builds the divider page between the student-data PDF and the plan-global PDF. */
function buildDividerPage(pdf, fonts, meta, logo) {
    const page = pdf.addPage([PAGE_SIZE.width, PAGE_SIZE.height]);
    drawTopBand(page, fonts.bold, logo);

    const sectionLabel = "PLAN GLOBAL";
    const labelW = fonts.bold.widthOfTextAtSize(sectionLabel, 16);
    page.drawText(sectionLabel, {
        x: (PAGE_SIZE.width - labelW) / 2,
        y: PAGE_SIZE.height / 2 + 80,
        size: 16,
        font: fonts.bold,
        color: COLORS.accent,
    });

    page.drawLine({
        start: { x: PAGE_SIZE.width / 2 - 50, y: PAGE_SIZE.height / 2 + 65 },
        end:   { x: PAGE_SIZE.width / 2 + 50, y: PAGE_SIZE.height / 2 + 65 },
        thickness: 1.5,
        color: COLORS.accent,
    });

    const materiaText = String(meta.subject ?? 'Materia');
    const mW = fonts.bold.widthOfTextAtSize(materiaText, 28);
    page.drawText(materiaText, {
        x: (PAGE_SIZE.width - mW) / 2,
        y: PAGE_SIZE.height / 2 + 20,
        size: 28,
        font: fonts.bold,
        color: COLORS.primary,
    });

    const careerText = `Carrera: ${meta.career ?? '—'}`;
    const cW = fonts.regular.widthOfTextAtSize(careerText, 12);
    page.drawText(careerText, {
        x: (PAGE_SIZE.width - cW) / 2,
        y: PAGE_SIZE.height / 2 - 20,
        size: 12,
        font: fonts.regular,
        color: COLORS.muted,
    });
}

// ============================================================================
// Service
// ============================================================================

class MergeFilesService {

    /**
     * Builds the merged kardex PDF: styled cover (with all student/grade data
     * from the meta arg) + section divider + plan-global pages. The uploaded
     * `requestPdf` is intentionally NOT appended anymore — its plain-text page
     * was redundant once the styled cover was introduced. The argument is kept
     * in the signature for backwards-compatibility with existing callers but
     * its content is no longer used.
     */
    async mergePdfs(_requestPdf, existingPdfPath, meta = {}) {
        try {
            const existingPdfBytes = await fs.readFile(path.join(projectRoot, existingPdfPath));
            const existingDoc = await PDFDocument.load(existingPdfBytes);

            const mergedPdf = await PDFDocument.create();

            const fonts = {
                bold:    await mergedPdf.embedFont(StandardFonts.HelveticaBold),
                regular: await mergedPdf.embedFont(StandardFonts.Helvetica),
                italic:  await mergedPdf.embedFont(StandardFonts.HelveticaOblique),
            };

            const enriched = { ...meta, date: dayjs().format('DD/MM/YYYY') };
            const logo = await embedLogoIn(mergedPdf);

            // 1) Cover page — now contains every field the old plain page used to show
            buildCoverPage(mergedPdf, fonts, enriched, logo);

            // 2) Section divider
            buildDividerPage(mergedPdf, fonts, enriched, logo);

            // 3) Plan-global pages
            const planPages = await mergedPdf.copyPages(existingDoc, existingDoc.getPageIndices());
            planPages.forEach((p) => mergedPdf.addPage(p));

            // 4) PDF metadata (shown in Properties / file managers)
            mergedPdf.setTitle(`Kardex - ${enriched.sisCode ?? ''} - ${enriched.subject ?? ''}`.trim());
            mergedPdf.setAuthor(UNIVERSITY);
            mergedPdf.setSubject('Kardex académico');
            mergedPdf.setProducer('Sistema de Gestión de Kardex UMSS');
            mergedPdf.setCreator('UniversityDApp Backend');

            return await mergedPdf.save();
        } catch (error) {
            if (error instanceof KardexError) throw error;
            throw KardexError.kardexProcessingError({
                operation: "merge_pdfs",
                details: `Error al fusionar PDFs: ${error.message}`,
                existingPdfPath,
            });
        }
    }

    async processFiles(files) {
        const processedFiles = [];

        for (const file of files) {
            try {
                if (!file.subject) {
                    throw KardexError.badRequest(
                        "El campo 'subject' es requerido para cada archivo",
                        { filename: file.filename },
                        "MISSING_SUBJECT_FIELD"
                    );
                }

                const baseName = file.subject;
                const materia = await globalPlan.findOne({ where: { materia: baseName } });

                if (!materia) {
                    throw KardexError.notFound(
                        `No se encontró la materia '${baseName}' en el plan global`,
                        { subject: baseName },
                        "SUBJECT_NOT_FOUND"
                    );
                }

                if (!materia.path) {
                    throw KardexError.internal(
                        `La materia '${baseName}' no tiene un path definido`,
                        { materiaId: materia.id },
                        "MISSING_SUBJECT_PATH"
                    );
                }

                const mergedPdf = await this.mergePdfs(file.blob, materia.path, {
                    sisCode:     file.sisCode,
                    subject:     file.subject,
                    career:      file.career,
                    studentName: file.studentName,
                    nota:        file.nota,
                    creditos:    file.creditos,
                    gestion:     file.gestion,
                    originalFilename: file.filename,
                });

                processedFiles.push({
                    originalFilename: file.filename,
                    mergedFilename:   `${baseName}.pdf`,
                    blob: mergedPdf,
                    path: file.path,
                    status: 'merged',
                    materiaId: materia.id,
                });
            } catch (error) {
                if (error instanceof KardexError) throw error;
                throw KardexError.kardexProcessingError({
                    operation: "process_files",
                    filename: file.filename,
                    details: error.message,
                    errorCode: "PDF_PROCESSING_ERROR",
                });
            }
        }

        if (processedFiles.length === 0) {
            throw KardexError.kardexProcessingError(
                "No se pudo procesar ningún archivo",
                { totalFiles: files.length },
                "NO_FILES_PROCESSED"
            );
        }

        return processedFiles;
    }
}

export default new MergeFilesService();
