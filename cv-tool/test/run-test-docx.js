/* The .docx path.
 *
 * No real Word copy of the CV was available, so this builds a .docx
 * with the same structure Word produces — a two-column table, bold and
 * italic runs, superscript markers, and hyperlink relationships — and
 * drives it through the same extractor the browser uses.
 *
 * This proves the code path works. It does NOT prove the tool handles
 * whatever Word actually emits for Bilin's CV; run the real file
 * through the built tool before relying on it. */
"use strict";

const assert = require("assert");
const JSZip = require("jszip");
const C = require("../src/core.js");

let checks = 0;
function check(label, fn) {
  return Promise.resolve(fn()).then(() => {
    checks++;
    console.log("  ok  " + label);
  });
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function run(text, opts) {
  const o = opts || {};
  const props =
    "<w:rPr>" +
    (o.b ? "<w:b/>" : "") +
    (o.i ? "<w:i/>" : "") +
    (o.sup ? '<w:vertAlign w:val="superscript"/>' : "") +
    "</w:rPr>";
  return "<w:r>" + props + "<w:t xml:space=\"preserve\">" + esc(text) + "</w:t></w:r>";
}

/** A two-column table row: gutter cell + content cell. */
function tableRow(gutter, contentXml) {
  return (
    "<w:tr><w:tc>" + run(gutter) + "</w:tc><w:tc>" + contentXml + "</w:tc></w:tr>"
  );
}

function hyperlink(id, text) {
  return '<w:hyperlink r:id="' + id + '">' + run(text) + "</w:hyperlink>";
}

function buildDocx() {
  const body =
    "<w:tbl>" +
    tableRow("EDUCATION", run("California Institute of Technology", { b: true }) + run(" Pasadena, California, USA")) +
    tableRow("2010 - 2016", run("California Institute of Technology", { b: true }) + run(" Pasadena, California, USA")) +
    "</w:tbl>" +
    "<w:p>" + run("Ph.D. in Chemistry, GPA 4.2 Dissertation Title: “Dipolar Liquids and Their Mixtures” Advisor: Professor Zhen-Gang Wang") + "</w:p>" +
    "<w:tbl>" +
    tableRow("APPOINTMENTS", run("Assistant Professor of Chemistry, Harvey Mudd College", { b: true }) + run(" Claremont, California, USA")) +
    tableRow("2023 - Present", run("Assistant Professor of Chemistry, Harvey Mudd College", { b: true }) + run(" Claremont, California, USA")) +
    "</w:tbl>" +
    "<w:tbl>" +
    tableRow("PUBLICATIONS",
      run("M. Li, B. Zhuang") + run("*", { sup: true }) +
      run(", J. Yu*, A Brand New Theory of Everything, ") +
      run("Macromolecules", { i: true }) +
      run(" 58, 1–12 (2026). ") +
      hyperlink("rId9", "link")) +
    "</w:tbl>" +
    "<w:tbl>" +
    tableRow("PRESENTATIONS", run("“A Talk Given Somewhere” (invited talk), APS March Meeting, Denver, CO, USA, 2026.")) +
    "</w:tbl>";

  const doc =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    "<w:body>" + body + "</w:body></w:document>";

  const rels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" ' +
    'Target="https://doi.org/10.1021/acs.macromol.9c99999" TargetMode="External"/>' +
    "</Relationships>";

  const zip = new JSZip();
  zip.file("word/document.xml", doc);
  zip.file("word/_rels/document.xml.rels", rels);
  return zip.generateAsync({ type: "nodebuffer" });
}

console.log("cv-tool / docx");

buildDocx()
  .then((buf) => C.extractDocx(JSZip, buf))
  .then((lines) => {
    const blocks = C.attachDocxLinks(lines, C.toBlocks(lines));
    const sections = C.splitSections(blocks);
    const parsed = C.parseAll(sections);

    return check("headings in the gutter cell split the document", () => {
      assert.ok(sections.education, "EDUCATION found");
      assert.ok(sections.appointments, "APPOINTMENTS found");
      assert.ok(sections.publications, "PUBLICATIONS found");
      assert.ok(sections.talks, "PRESENTATIONS found");
    })
      .then(() =>
        check("bold runs separate institution from city", () => {
          assert.strictEqual(
            parsed.education[0].org,
            "California Institute of Technology, Pasadena, California, USA",
          );
          assert.strictEqual(parsed.education[0].year, "2010-2016");
        }),
      )
      .then(() =>
        check("italic run identifies the journal", () => {
          assert.strictEqual(parsed.publications[0].venue, "Macromolecules");
          assert.strictEqual(parsed.publications[0].year, 2026);
        }),
      )
      .then(() =>
        check("the DOI comes from the hyperlink relationship", () => {
          assert.strictEqual(
            parsed.publications[0].doi,
            "10.1021/acs.macromol.9c99999",
          );
        }),
      )
      .then(() =>
        check("a talk keeps its invited marker and location", () => {
          const t = parsed.talks[0];
          assert.strictEqual(t.invited, true);
          assert.strictEqual(t.year, 2026);
          assert.strictEqual(t.venue, "APS March Meeting");
          assert.strictEqual(t.location, "Denver, CO, USA");
        }),
      )
      .then(() =>
        check("a paper the site lacks is offered as an addition", () => {
          const d = C.diffSection("publications", [], parsed.publications);
          assert.strictEqual(d.added.length, 1);
          assert.strictEqual(d.added[0].action, "add");
        }),
      );
  })
  .then(() => {
    console.log(`\n${checks} checks passed\n`);
  })
  .catch((err) => {
    console.error("\nFAILED:", err.message);
    process.exit(1);
  });
