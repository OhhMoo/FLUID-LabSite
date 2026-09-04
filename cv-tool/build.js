/* ============================================================
 * Inlines the vendor libraries, a snapshot of the site's data
 * files, core.js and ui.js into template.html, producing one
 * offline HTML file that opens by double-clicking.
 *
 * Usage: node build.js
 * ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DATA = path.join(ROOT, "..", "src", "data");
const OUT_DIR = path.join(ROOT, "dist");
const OUT_FILE = path.join(OUT_DIR, "update-site-from-cv.html");

/* The site data files the tool reads and rewrites. */
const DATA_FILES = [
  "pi.ts",
  "publications.ts",
  "talks.ts",
  "courses.ts",
  "theses.ts",
];

function read(p) {
  return fs.readFileSync(p, "utf8");
}

/* Stops inlined content from closing the surrounding <script> early. */
function safeInline(js) {
  return js.replace(/<\/script/gi, "<\\/script");
}

function must(html, marker) {
  if (html.indexOf(marker) < 0) {
    throw new Error("template.html is missing the placeholder " + marker);
  }
}

function build() {
  let html = read(path.join(ROOT, "src", "template.html"));

  const jszip = read(path.join(ROOT, "vendor", "jszip.min.js"));
  const pdfjs = read(path.join(ROOT, "vendor", "pdf.min.js"));
  const pdfWorker = read(path.join(ROOT, "vendor", "pdf.worker.min.js"));
  const core = read(path.join(ROOT, "src", "core.js"));
  const ui = read(path.join(ROOT, "src", "ui.js"));

  // The worker is inlined as a blob so the tool stays a single file
  // and never reaches the network for it.
  const workerBoot =
    "<script>window.PDF_WORKER_SRC = URL.createObjectURL(new Blob([" +
    JSON.stringify(pdfWorker) +
    '], {type:"text/javascript"}));</script>';

  const sources = {};
  DATA_FILES.forEach((f) => {
    const p = path.join(DATA, f);
    if (!fs.existsSync(p)) {
      throw new Error("Missing site data file: " + p);
    }
    sources[f] = read(p);
  });

  // Fail loudly at build time rather than in front of a user.
  const CvTool = require("./src/core.js");
  const counts = {};
  CvTool.EXPORTED.forEach((kind) => {
    const file = {
      education: "pi.ts",
      appointments: "pi.ts",
      awards: "pi.ts",
      publications: "publications.ts",
      talks: "talks.ts",
      courses: "courses.ts",
      theses: "theses.ts",
    }[kind];
    const rows = CvTool.readArrayExport(sources[file], kind);
    if (!rows) {
      throw new Error(
        "Could not read `export const " + kind + "` from " + file +
          " — the tool would ship with an empty comparison.",
      );
    }
    counts[kind] = rows.length;
  });

  const snapshot = new Date().toISOString().slice(0, 10);

  const replacements = [
    ["<!--VENDOR_JSZIP-->", "<script>" + safeInline(jszip) + "</script>"],
    ["<!--VENDOR_PDFJS-->", "<script>" + safeInline(pdfjs) + "</script>"],
    ["<!--PDF_WORKER-->", workerBoot],
    [
      "<!--SITE_DATA-->",
      "<script>window.SITE_SOURCES = " +
        safeInline(JSON.stringify(sources)) +
        "; window.SITE_SNAPSHOT = " +
        JSON.stringify(snapshot) +
        ";</script>",
    ],
    ["<!--CORE_JS-->", "<script>" + safeInline(core) + "</script>"],
    ["<!--UI_JS-->", "<script>" + safeInline(ui) + "</script>"],
  ];

  replacements.forEach(([marker, replacement]) => {
    must(html, marker);
    html = html.replace(marker, () => replacement);
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, html, "utf8");

  const mb = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2);
  console.log("built " + OUT_FILE + " (" + mb + " MB)");
  console.log(
    "snapshot " + snapshot + ": " +
      Object.keys(counts).map((k) => counts[k] + " " + k).join(", "),
  );
}

build();
