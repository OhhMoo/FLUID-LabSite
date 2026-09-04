/* End-to-end: the real CV PDF against the real site data files.
 * Run with `npm test` from cv-tool/. */
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const C = require("../src/core.js");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "..", "src", "data");
const CV = path.join(ROOT, "..", "public", "bilin_zhuang_cv_2024jun.pdf");

let checks = 0;
function check(label, fn) {
  fn();
  checks++;
  console.log("  ok  " + label);
}

/* Parse the real CV through the same extractor the browser runs, rather
 * than a checked-in fixture that could drift away from the code. */
function parseCv() {
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
  pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
    "pdfjs-dist/legacy/build/pdf.worker.js",
  );
  return C.extractPdf(pdfjsLib, new Uint8Array(fs.readFileSync(CV))).then((out) => {
    out.pages.sort((a, b) => a.page - b.page);
    const lines = C.itemsToLines(out.pages, out.fontRoles);
    const blocks = C.attachLinks(C.toBlocks(lines), out.annotations);
    return C.parseAll(C.splitSections(blocks));
  });
}

console.log("cv-tool / core");

parseCv().then((parsed) => {

/* ---- 1. the parse reproduces the CV's own counts ---------------- */
check("section counts match the June 2024 CV", () => {
  assert.strictEqual(parsed.education.length, 2);
  assert.strictEqual(parsed.appointments.length, 3);
  assert.strictEqual(parsed.awards.length, 10);
  assert.strictEqual(parsed.courses.length, 10);
  assert.strictEqual(parsed.theses.length, 4);
  assert.strictEqual(parsed.publications.length, 21);
  assert.strictEqual(parsed.talks.length, 14);
});

check("every publication carries a well-formed DOI", () => {
  parsed.publications.forEach((p) => {
    assert.ok(
      /^10\.\d{4,9}\//.test(p.doi || ""),
      `bad DOI on "${p.title.slice(0, 40)}": ${p.doi}`,
    );
  });
});

check("the paragraph holding two talks was split", () => {
  const grc = parsed.talks.find((t) => t.year === 2015);
  const aps = parsed.talks.find((t) => t.year === 2014);
  assert.ok(grc && /Gordon Research/.test(grc.venue), "2015 GRC talk");
  assert.ok(aps && /APS March Meeting/.test(aps.venue), "2014 APS talk");
  assert.ok(!/APS March/.test(grc.title), "titles did not bleed together");
});

check("invited talks are flagged from the CV's own marker", () => {
  const invited = parsed.talks.filter((t) => t.invited);
  assert.strictEqual(invited.length, 6);
});

check("institution and city are rejoined with a comma", () => {
  assert.strictEqual(
    parsed.education[0].org,
    "California Institute of Technology, Pasadena, California, USA",
  );
  assert.strictEqual(parsed.appointments[0].year, "2023-");
});

/* ---- 2. reading the site's real data files ---------------------- */
const piSrc = fs.readFileSync(path.join(DATA, "pi.ts"), "utf8");
const pubSrc = fs.readFileSync(path.join(DATA, "publications.ts"), "utf8");
const talkSrc = fs.readFileSync(path.join(DATA, "talks.ts"), "utf8");

const site = {
  education: C.readArrayExport(piSrc, "education"),
  appointments: C.readArrayExport(piSrc, "appointments"),
  awards: C.readArrayExport(piSrc, "awards"),
  publications: C.readArrayExport(pubSrc, "publications"),
  talks: C.readArrayExport(talkSrc, "talks"),
  courses: [],
  theses: [],
};

check("site data files parse", () => {
  assert.strictEqual(site.awards.length, 10);
  assert.strictEqual(site.publications.length, 23);
  assert.strictEqual(site.talks.length, 14);
});

/* ---- 3. the diff, which is the whole safety story --------------- */
const diffs = C.diffAll(site, parsed);

check("the two papers newer than the CV are kept, not dropped", () => {
  const d = diffs.publications;
  const kept = d.siteOnly.map((e) => e.site.venue);
  assert.ok(kept.includes("Giant"), "2025 Giant paper survives");
  assert.ok(
    kept.includes("Nature Biomedical Engineering"),
    "2024 Nat BME paper survives",
  );
  d.siteOnly.forEach((e) =>
    assert.strictEqual(e.action, "keep", "site-only defaults to keep"),
  );
});

check("publications already on the site are matched, not duplicated", () => {
  const d = diffs.publications;
  assert.strictEqual(
    d.added.length,
    0,
    "the CV introduces no paper the site lacks: " +
      d.added.map((a) => a.cv.title).join(" | "),
  );
});

check("awards line up one-for-one", () => {
  assert.strictEqual(diffs.awards.added.length, 0);
  assert.strictEqual(diffs.awards.siteOnly.length, 0);
});

check("author strings are never auto-overwritten", () => {
  diffs.publications.changed.forEach((e) => {
    e.fields
      .filter((f) => f.field === "authors")
      .forEach((f) => assert.strictEqual(f.soft, true));
  });
});

/* ---- 4. patching leaves the rest of the file alone -------------- */
check("patching rewrites only the named array", () => {
  const rows = C.applyDecisions("awards", site.awards, diffs.awards);
  const out = C.patchArrayExport(piSrc, "awards", C.formatRows("awards", rows));
  assert.ok(out.includes('import type { PI'), "imports survive");
  assert.ok(out.includes("export const pi: PI"), "the pi object survives");
  assert.ok(out.includes("Leroy Apker Award"), "content is present");
  const reread = C.readArrayExport(out, "awards");
  assert.strictEqual(reread.length, site.awards.length);
  // Everything outside the awards array is byte-identical.
  const before = C.findArrayExport(piSrc, "awards");
  assert.strictEqual(out.slice(0, before.start), piSrc.slice(0, before.start));
});

check("a new row gets a unique id", () => {
  const taken = {};
  const id = C.makeId(
    "talks",
    { title: "A New Talk", venue: "APS March Meeting", year: 2026 },
    taken,
  );
  assert.ok(id.length > 0 && !/^-|-$/.test(id), "id is a clean slug: " + id);
  const id2 = C.makeId(
    "talks",
    { title: "A New Talk", venue: "APS March Meeting", year: 2026 },
    taken,
  );
  assert.notStrictEqual(id, id2, "ids do not collide");
});

console.log(`\n${checks} checks passed\n`);
}).catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
