import PDFDocument from 'pdfkit';
import type { IQuestionPaper } from '../models/QuestionPaper.js';
import { logger } from '../utils/logger.js';

export async function generatePdf(paper: IQuestionPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 56, bottom: 56, left: 57, right: 57 },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      logger.info('PDF generated successfully');
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);

    const L = doc.page.margins.left;
    const R = doc.page.margins.right;
    const pageW = doc.page.width - L - R;

    const BLACK = '#111827';
    const GRAY  = '#6B7280';
    const DARK  = '#374151';

    const difficultyColor: Record<string, string> = {
      Easy:        '#166534',
      Moderate:    '#92400E',
      Challenging: '#991B1B',
    };

    // ── helpers ──────────────────────────────────────────────────
    function hRule(weight = 1, color = BLACK) {
      doc.moveDown(0.3);
      doc.moveTo(L, doc.y)
         .lineTo(doc.page.width - R, doc.y)
         .lineWidth(weight)
         .strokeColor(color)
         .stroke();
      doc.moveDown(0.5);
    }

    /** Write text at an explicit (x, y); returns the new doc.y after the block. */
    function put(
      text: string,
      x: number,
      y: number,
      opts: PDFKit.Mixins.TextOptions & { fontSize?: number; font?: string; color?: string } = {}
    ) {
      const { fontSize = 11, font = 'Helvetica', color = BLACK, ...rest } = opts;
      doc.fontSize(fontSize).font(font).fillColor(color).text(text, x, y, rest);
    }

    // ── HEADER ───────────────────────────────────────────────────
    put(paper.schoolName, L, doc.y, {
      fontSize: 17, font: 'Helvetica-Bold', align: 'center', width: pageW,
    });
    put(`Subject: ${paper.subject}`, L, doc.y, {
      fontSize: 12, align: 'center', width: pageW,
    });
    put(`Class: ${paper.className}`, L, doc.y, {
      fontSize: 12, align: 'center', width: pageW,
    });
    hRule(2);

    // ── TIME / MARKS ─────────────────────────────────────────────
    const metaY = doc.y;
    put(`Time Allowed: ${paper.timeAllowed}`, L, metaY, {
      fontSize: 11, width: pageW / 2,
    });
    put(`Maximum Marks: ${paper.maxMarks}`, L + pageW / 2, metaY, {
      fontSize: 11, width: pageW / 2, align: 'right',
    });
    doc.moveDown(0.8);

    // ── GENERAL INSTRUCTIONS ─────────────────────────────────────
    put(paper.generalInstructions, L, doc.y, {
      fontSize: 10, font: 'Helvetica-Oblique', color: GRAY, width: pageW,
    });
    doc.moveDown(0.8);

    // ── STUDENT INFO ─────────────────────────────────────────────
    put('Name: _________________________________________________', L, doc.y, {
      fontSize: 11, width: pageW,
    });
    doc.moveDown(0.4);
    put(
      `Roll No: _______________     Class: ${paper.className}     Section: _______________`,
      L, doc.y, { fontSize: 11, width: pageW }
    );
    doc.moveDown(1.2);

    // ── SECTIONS ─────────────────────────────────────────────────
    for (const section of paper.sections) {
      put(section.title, L, doc.y, {
        fontSize: 13, font: 'Helvetica-Bold', align: 'center', width: pageW,
      });
      put(section.sectionType, L, doc.y, {
        fontSize: 11, font: 'Helvetica-Bold', align: 'center', width: pageW,
      });
      put(section.instruction, L, doc.y, {
        fontSize: 10, font: 'Helvetica-Oblique', color: GRAY, align: 'center', width: pageW,
      });
      doc.moveDown(0.7);

      for (const q of section.questions) {
        // Page break guard
        if (doc.y > doc.page.height - doc.page.margins.bottom - 100) {
          doc.addPage();
        }

        const diffColor  = difficultyColor[q.difficulty] ?? DARK;
        const marksLabel = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;
        const indent     = L + 22;     // question text indent
        const indentW    = pageW - 22; // question text width

        // ── row 1: number | badge | marks ──────────────────────
        // Each written to an explicit (x, y) — NO continued:true, NO shared width
        const rowY = doc.y;

        put(`${q.number}.`, L, rowY, {
          fontSize: 11, font: 'Helvetica-Bold', width: 18, lineBreak: false,
        });

        put(`[${q.difficulty}]`, L + 20, rowY, {
          fontSize: 9, font: 'Helvetica-Bold', color: diffColor, width: 70, lineBreak: false,
        });

        put(marksLabel, doc.page.width - R - 70, rowY, {
          fontSize: 9, font: 'Helvetica-Bold', color: GRAY, width: 70, align: 'right',
        });
        // ↑ last put() with explicit y — doc.y is now rowY + one line-height

        // ── row 2: question text ────────────────────────────────
        put(q.text, indent, doc.y, {
          fontSize: 11, width: indentW,
        });

        // ── row 3: options (MCQ) ────────────────────────────────
        if (q.options && q.options.length > 0) {
          const letters = ['a', 'b', 'c', 'd', 'e'];
          // Write all options as one string — pdfkit will wrap naturally
          const optLine = q.options
            .map((o, i) => `(${letters[i]}) ${o}`)
            .join('     ');

          put(optLine, indent, doc.y, {
            fontSize: 10, color: DARK, width: indentW,
          });
        }

        doc.moveDown(0.7);
      }

      doc.moveDown(0.5);
    }

    // ── FOOTER ───────────────────────────────────────────────────
    hRule(1, GRAY);
    put('★  End of Question Paper  ★', L, doc.y, {
      fontSize: 11, font: 'Helvetica-Bold', align: 'center', width: pageW,
    });

    // ── ANSWER KEY ───────────────────────────────────────────────
    if (paper.answerKey.length > 0) {
      doc.addPage();

      put('Answer Key', L, doc.y, {
        fontSize: 14, font: 'Helvetica-Bold', underline: true,
      });
      hRule(2);

      for (const a of paper.answerKey) {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 40) {
          doc.addPage();
        }

        const ansY = doc.y;
        put(`${a.questionNumber}.`, L, ansY, {
          fontSize: 10, font: 'Helvetica-Bold', width: 22, lineBreak: false,
        });
        put(a.answer, L + 24, ansY, {
          fontSize: 10, color: DARK, width: pageW - 24,
        });
        doc.moveDown(0.3);
      }
    }

    doc.end();
  });
}