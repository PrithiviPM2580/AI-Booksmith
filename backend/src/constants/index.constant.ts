// ============================================================
// 🧩 Constants — Application-wide constants
// ============================================================

// ------------------------------------------------------
// DOCX_STYLES{} — Styles for DOCX document generation
// ------------------------------------------------------
export const DOCX_STYLES = {
  fonts: {
    body: "Charter",
    heading: "Inter",
  },
  sizes: {
    title: 32,
    subtitle: 20,
    author: 18,
    chapterTitle: 24,
    h1: 20,
    h2: 18,
    h3: 16,
    body: 12,
  },
  spacing: {
    paragraphBefore: 200,
    paragraphAfter: 200,
    chapterBefore: 400,
    chapterAfter: 300,
    headingBefore: 300,
    headingAfter: 150,
  },
};

// ------------------------------------------------------
// TYPOGRAPHY{} — Typography styles for document generation
// ------------------------------------------------------
export const TYPOGRAPHY = {
  fonts: {
    serif: "Times-Roman",
    serifBold: "Times-Bold",
    serifItalic: "Times-Italic",
    sans: "Helvetica",
    sansBold: "Helvetica-Bold",
    sansOblique: "Helvetica-Oblique",
  },
  sizes: {
    title: 28,
    author: 16,
    chapterTitle: 20,
    h1: 18,
    h2: 16,
    h3: 14,
    body: 12,
    captions: 9,
  },
  spacing: {
    paragraphSpacing: 12,
    chapterSpacing: 24,
    headingSpacing: { before: 16, after: 8 },
    listSpacing: 6,
  },
  colors: {
    text: "333333",
    heading: "1a1a1a",
    accent: "4f46e5",
  },
};
