import PDFDocument from 'pdfkit';
import type { IQuestionPaper } from '../models/QuestionPaper.js';
import { logger } from '../utils/logger.js';

/**
 * Generate a PDF buffer from a question paper using pdfkit.
 * No Chrome/browser needed — pure Node.js.
 */
export async function generatePdf(paper: IQuestionPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 56, bottom: 56, left: 42, right: 42 }, // ~20mm top/bottom, 15mm sides
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
    const GRAY = '#6B7280';
    const DARK = '#374151';

    const difficultyColor: Record<string, string> = {
      Easy: '#166534',
      Moderate: '#92400E',
      Challenging: '#991B1B',
    };

    // ─── HELPER: horizontal rule ───────────────────────────────
    function hRule(weight = 1, color = BLACK) {
      doc.moveDown(0.3);
      doc
        .moveTo(L, doc.y)
        .lineTo(doc.page.width - R, doc.y)
        .lineWidth(weight)
        .strokeColor(color)
        .stroke();
      doc.moveDown(0.4);
    }

    // ─── HEADER ───────────────────────────────────────────────
    doc
      .fontSize(17)
      .font('Helvetica-Bold')
      .fillColor(BLACK)
      .text(paper.schoolName, L, doc.y, { align: 'center', width: pageW });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Subject: ${paper.subject}`, { align: 'center', width: pageW })
      .text(`Class: ${paper.className}`, { align: 'center', width: pageW });

    hRule(2);

    // ─── TIME / MARKS ROW ─────────────────────────────────────
    const metaY = doc.y;
    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor(BLACK)
      .text(`Time Allowed: ${paper.timeAllowed}`, L, metaY, {
        width: pageW / 2,
        lineBreak: false,
      });
    doc.text(`Maximum Marks: ${paper.maxMarks}`, L + pageW / 2, metaY, {
      width: pageW / 2,
      align: 'right',
      lineBreak: false,
    });
    doc.moveDown(1.2);

    // ─── GENERAL INSTRUCTIONS ─────────────────────────────────
    doc
      .fontSize(10)
      .font('Helvetica-Oblique')
      .fillColor(GRAY)
      .text(paper.generalInstructions, L, doc.y, { width: pageW });

    doc.moveDown(0.8);

    // ─── STUDENT INFO ─────────────────────────────────────────
    doc.fontSize(11).font('Helvetica').fillColor(BLACK);
    doc.text('Name: _________________________________________________', L, doc.y, { width: pageW });
    doc.moveDown(0.4);
    doc.text(
      `Roll No: _______________     Class: ${paper.className}     Section: _______________`,
      L,
      doc.y,
      { width: pageW }
    );
    doc.moveDown(1.2);

    // ─── SECTIONS ─────────────────────────────────────────────
    for (const section of paper.sections) {
      // Section header
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor(BLACK)
        .text(section.title, L, doc.y, { align: 'center', width: pageW });

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(section.sectionType, L, doc.y, { align: 'center', width: pageW });

      doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .fillColor(GRAY)
        .text(section.instruction, L, doc.y, { align: 'center', width: pageW });

      doc.moveDown(0.6);

      // Questions
      for (const q of section.questions) {
        // Check if we're near the bottom — add page if needed
        if (doc.y > doc.page.height - doc.page.margins.bottom - 80) {
          doc.addPage();
        }

        const marksLabel = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;
        const diffLabel = `[${q.difficulty}]`;
        const diffColor = difficultyColor[q.difficulty] ?? DARK;

        // Question number + difficulty badge
        const questionStartY = doc.y;
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor(BLACK)
          .text(`${q.number}.`, L, questionStartY, { continued: true, width: 20 });

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(diffColor)
          .text(` ${diffLabel} `, { continued: true });

        // Question text + marks
        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor(BLACK)
          .text(`${q.text}  `, { continued: true, width: pageW - 80 });

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(GRAY)
          .text(marksLabel, { align: 'right' });

        // Options (MCQ)
        if (q.options && q.options.length > 0) {
          const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
          const optionText = q.options
            .map((o, i) => `(${letters[i]}) ${o}`)
            .join('     ');

          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor(DARK)
            .text(optionText, L + 20, doc.y, { width: pageW - 20 });
        }

        doc.moveDown(0.5);
      }

      doc.moveDown(0.8);
    }

    // ─── FOOTER ───────────────────────────────────────────────
    hRule(1, GRAY);
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(BLACK)
      .text('★  End of Question Paper  ★', L, doc.y, { align: 'center', width: pageW });

    // ─── ANSWER KEY ───────────────────────────────────────────
    if (paper.answerKey.length > 0) {
      doc.addPage();

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor(BLACK)
        .text('Answer Key', L, doc.y, { underline: true, width: pageW });

      hRule(2);

      for (const a of paper.answerKey) {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 40) {
          doc.addPage();
        }

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(BLACK)
          .text(`${a.questionNumber}.  `, L, doc.y, { continued: true, width: 30 });

        doc
          .font('Helvetica')
          .fillColor(DARK)
          .text(a.answer, { width: pageW - 30 });

        doc.moveDown(0.3);
      }
    }

    doc.end();
  });
}