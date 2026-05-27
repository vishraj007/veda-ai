import type { IQuestionPaper } from '../models/QuestionPaper.js';
import { logger } from '../utils/logger.js';

/**
 * Generate a PDF buffer from a question paper using puppeteer.
 * Renders an HTML template then converts to PDF.
 */
export async function generatePdf(paper: IQuestionPaper): Promise<Buffer> {
  // Dynamic import to avoid loading puppeteer at startup
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const html = buildPaperHtml(paper);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
    });
    logger.info('PDF generated successfully');
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/** Build HTML template for the question paper */
function buildPaperHtml(paper: IQuestionPaper): string {
  const difficultyColor: Record<string, string> = {
    Easy: '#166534',
    Moderate: '#92400E',
    Challenging: '#991B1B',
  };
  const difficultyBg: Record<string, string> = {
    Easy: '#DCFCE7',
    Moderate: '#FEF3C7',
    Challenging: '#FEE2E2',
  };

  const sectionsHtml = paper.sections
    .map(
      (section) => `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <p class="section-type">${section.sectionType}</p>
        <p class="section-instruction">${section.instruction}</p>
        <div class="questions">
          ${section.questions
            .map(
              (q) => `
            <div class="question">
              <span class="q-number">${q.number}.</span>
              <span class="q-badge" style="background:${difficultyBg[q.difficulty]};color:${difficultyColor[q.difficulty]}">[${q.difficulty}]</span>
              <span class="q-text">${q.text}</span>
              <span class="q-marks">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
              ${
                q.options && q.options.length > 0
                  ? `<div class="options">${q.options.map((o, i) => `<span class="option">(${String.fromCharCode(97 + i)}) ${o}</span>`).join('')}</div>`
                  : ''
              }
            </div>`
            )
            .join('')}
        </div>
      </div>`
    )
    .join('');

  const answerKeyHtml =
    paper.answerKey.length > 0
      ? `
    <div class="answer-key">
      <h2>Answer Key</h2>
      <ol>
        ${paper.answerKey.map((a) => `<li><strong>${a.questionNumber}.</strong> ${a.answer}</li>`).join('')}
      </ol>
    </div>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.6; color: #111827; padding: 10px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #111; padding-bottom: 15px; }
    .header h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 13px; margin: 2px 0; }
    .meta-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 12px; }
    .instructions { font-style: italic; margin: 8px 0 15px; font-size: 11px; color: #444; }
    .student-info { margin: 15px 0; font-size: 12px; }
    .student-info p { margin: 6px 0; }
    .student-info span { display: inline-block; min-width: 200px; border-bottom: 1px solid #333; margin-left: 5px; }
    .section { margin: 20px 0; page-break-inside: avoid; }
    .section-title { text-align: center; font-size: 15px; font-weight: 700; margin-bottom: 5px; }
    .section-type { text-align: center; font-size: 13px; font-weight: 600; margin-bottom: 3px; }
    .section-instruction { font-style: italic; font-size: 11px; color: #555; margin-bottom: 12px; text-align: center; }
    .question { margin: 10px 0; padding-left: 5px; line-height: 1.7; }
    .q-number { font-weight: 600; }
    .q-badge { font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; margin: 0 4px; }
    .q-marks { font-weight: 600; font-size: 11px; color: #555; }
    .options { margin: 5px 0 5px 25px; }
    .option { display: inline-block; margin-right: 20px; font-size: 11px; }
    .answer-key { margin-top: 30px; padding-top: 15px; border-top: 2px solid #111; }
    .answer-key h2 { font-size: 14px; margin-bottom: 10px; text-decoration: underline; }
    .answer-key ol { padding-left: 20px; }
    .answer-key li { margin: 5px 0; font-size: 11px; line-height: 1.5; }
    .footer { text-align: center; margin-top: 25px; font-weight: 600; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${paper.schoolName}</h1>
    <p>Subject: ${paper.subject}</p>
    <p>Class: ${paper.className}</p>
  </div>
  <div class="meta-row">
    <span>Time Allowed: ${paper.timeAllowed}</span>
    <span>Maximum Marks: ${paper.maxMarks}</span>
  </div>
  <p class="instructions">${paper.generalInstructions}</p>
  <div class="student-info">
    <p>Name: <span>&nbsp;</span></p>
    <p>Roll Number: <span>&nbsp;</span></p>
    <p>Class: ${paper.className} &nbsp;&nbsp; Section: <span>&nbsp;</span></p>
  </div>
  ${sectionsHtml}
  <div class="footer">End of Question Paper</div>
  ${answerKeyHtml}
</body>
</html>`;
}
