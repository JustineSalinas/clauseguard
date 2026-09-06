/**
 * A deliberately tiny PDF writer, for test fixtures only.
 *
 * Checked in as a generator rather than as binary .pdf files so that a
 * payload is diffable and reviewable in a pull request. A committed PDF is
 * opaque: nobody reviewing a diff can tell whether the "invisible" text in it
 * is actually invisible. Here the fill colour and font size are right there in
 * the source.
 *
 * Not a general PDF library. It emits exactly what the extraction tests need:
 * one page size, one Type1 font, and a content stream the caller supplies.
 */

/** Escapes a string for a PDF literal-string operand. */
function esc(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * One text-drawing instruction.
 *
 * `rgb` is the fill colour in PDF's 0..1 range, so [1,1,1] on a white page is
 * the white-on-white case. `size` is the font size in points, so 1 is the
 * "1pt text" case. `y` below 0 (or above the page height) is the off-page
 * case. Those three are exactly the techniques eval/adversarial/README.md
 * names.
 */
export function drawText({ text, x, y, size = 11, rgb = [0, 0, 0] }) {
  const [r, g, b] = rgb;
  return `${r} ${g} ${b} rg BT /F1 ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET`;
}

/**
 * Assembles a single-page PDF from content-stream operators.
 *
 * Builds the cross-reference table from real byte offsets as it goes; a PDF
 * with a wrong xref may still open in a lenient viewer but is not something to
 * hand a parser under test.
 */
export function makePdf(operators, { width = 612, height = 792 } = {}) {
  const content = operators.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
      `/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];

  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;

  return new Uint8Array(Buffer.from(pdf, "latin1"));
}
