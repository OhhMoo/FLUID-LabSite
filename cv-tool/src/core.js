/* ============================================================
 * cv-tool / core.js
 *
 * All business logic. Pure: no DOM, no network, no file system.
 * The browser and the Node tests run this exact file.
 *
 * Pipeline:
 *   .docx/.pdf --(extractor in ui.js)--> Line[]
 *   Line[] --toBlocks--> Block[] --splitSections--> {SECTION: Block[]}
 *   --parseX--> canonical rows --diffSection--> review --emitTs--> file text
 *
 * ES5-flavoured on purpose: this file is inlined verbatim into a
 * single-file HTML tool that has to open anywhere.
 * ============================================================ */
"use strict";

var CvTool = (function () {
  /* ---------------------------------------------------------
   * Column geometry of the CV's two-column layout, in PDF user
   * units. Overridable because a future CV revision may move them.
   * ------------------------------------------------------- */
  /* The CV is a two-column document: a gutter carrying section
   * headings and date ranges, and a content column. Headings and
   * dates never share a line, so one x split is enough. */
  var LAYOUT = {
    gutterMaxX: 168, // everything left of this is heading-or-date
    headerMinY: 720, // running head ("Zhuang Bilin - CV")
    footerMaxY: 60, // "Page n of 7"
    lineTolerance: 3.5, // y within this counts as the same line
    spaceGap: 1.2, // x gap (pt) that implies a missing space
    paraGapRatio: 1.45, // y gap over median leading that ends a block
    supRatio: 0.86, // font size below this fraction of body = superscript
  };

  /* Section headings as they appear in the CV, mapped to the data
   * files they feed. Sections not listed are read but not exported. */
  var SECTIONS = [
    { head: "EDUCATION", key: "education" },
    { head: "APPOINTMENTS", key: "appointments" },
    { head: "AWARDS AND FELLOWSHIPS", key: "awards" },
    { head: "TEACHING EXPERIENCE", key: "teachingExperience" },
    { head: "RESEARCH EXPERIENCE", key: "researchExperience" },
    { head: "COURSES TAUGHT", key: "courses" },
    { head: "SENIOR THESES SUPERVISED", key: "theses" },
    { head: "SERVICES", key: "services" },
    { head: "PUBLICATIONS", key: "publications" },
    { head: "PRESENTATIONS", key: "talks" },
  ];

  /* Sections this tool actually writes back to the site. */
  var EXPORTED = [
    "education",
    "appointments",
    "awards",
    "courses",
    "theses",
    "publications",
    "talks",
  ];

  /* =========================================================
   * Normalisation helpers
   * ======================================================= */

  function norm(s) {
    return String(s == null ? "" : s)
      .replace(/ /g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Comparison key: case, punctuation, and accents folded away. */
  function normKey(s) {
    return norm(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[‐-―]/g, "-")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  /** Straightens the quotes and dashes Word leaves behind. */
  function unsmart(s) {
    return norm(s)
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"');
  }

  /** First 4-digit year in a string, or null. */
  function firstYear(s) {
    var m = String(s).match(/\b(19|20)\d{2}\b/);
    return m ? parseInt(m[0], 10) : null;
  }

  /** Last 4-digit year in a string, or null. */
  function lastYear(s) {
    var all = String(s).match(/\b(19|20)\d{2}\b/g);
    return all ? parseInt(all[all.length - 1], 10) : null;
  }

  /**
   * Normalises a CV date column to the site's year format.
   * "2010 - 2016" -> "2010-2016"; "2023 - Present" -> "2023-";
   * "01/2020 - 06/2023" -> "2020-2023".
   */
  function normalizeYearRange(raw) {
    var s = norm(raw).replace(/[‐-―]/g, "-");
    if (!s) return "";
    var present = /present|current/i.test(s);
    var years = s.match(/\b(19|20)\d{2}\b/g) || [];
    if (!years.length) return s;
    if (present) return years[0] + "-";
    if (years.length === 1) return years[0];
    return years[0] + "-" + years[years.length - 1];
  }

  /* =========================================================
   * Stage 1 — positioned PDF items to Lines
   *
   * A Line carries the three columns the CV uses, plus the runs
   * so bold/italic survive into the parsers.
   *   { label, year, runs: [{text,bold,italic,sup}], text }
   * ======================================================= */

  /**
   * Style from the embedded PostScript font name
   * ("AAAAAC+TimesNewRomanPS-BoldItalicMT"). Reading the name rather
   * than trusting the internal font id means a re-exported CV, whose
   * ids will differ, still parses.
   */
  function roleFromFontName(name) {
    var n = String(name || "");
    return {
      bold: /bold|black|heavy|semib/i.test(n),
      italic: /italic|oblique/i.test(n),
    };
  }

  /** The most common glyph size on the page — i.e. the body text. */
  function dominantSize(pages) {
    var counts = {};
    var best = 0;
    var bestN = 0;
    pages.forEach(function (p) {
      p.items.forEach(function (it) {
        if (!norm(it.s)) return;
        var k = Math.round((it.sz || 0) * 2) / 2;
        if (!k) return;
        counts[k] = (counts[k] || 0) + it.s.length;
        if (counts[k] > bestN) {
          bestN = counts[k];
          best = k;
        }
      });
    });
    return best;
  }

  function itemsToLines(pages, fontRoles, layout) {
    var L = layout || LAYOUT;
    var lines = [];
    var body = dominantSize(pages);

    for (var p = 0; p < pages.length; p++) {
      var items = pages[p].items.filter(function (it) {
        return norm(it.s) !== "" && it.y < L.headerMinY && it.y > L.footerMaxY;
      });

      // Group by baseline, descending y (PDF origin is bottom-left).
      var groups = [];
      items
        .slice()
        .sort(function (a, b) {
          return b.y - a.y || a.x - b.x;
        })
        .forEach(function (it) {
          var g = groups.length ? groups[groups.length - 1] : null;
          if (g && Math.abs(g.y - it.y) <= L.lineTolerance) {
            g.items.push(it);
          } else {
            groups.push({ y: it.y, items: [it] });
          }
        });

      var pageLines = groups.map(function (g) {
        g.items.sort(function (a, b) {
          return a.x - b.x;
        });
        var gutter = [];
        var runs = [];
        var prev = null;

        g.items.forEach(function (it) {
          var role = (fontRoles && fontRoles[it.f]) || {};
          // pdf.js emits no space between items — restore it from the
          // horizontal gap, or the words run together.
          var lead =
            prev && it.x - (prev.x + prev.w) > L.spaceGap ? " " : "";
          if (it.x < L.gutterMaxX) {
            gutter.push(lead + it.s);
          } else {
            runs.push({
              text: lead + it.s,
              bold: !!role.bold,
              italic: !!role.italic,
              // A marker glyph is set smaller than the body text.
              sup:
                !!role.sup ||
                (!!body && !!it.sz && it.sz < body * L.supRatio),
            });
          }
          prev = it;
        });

        return makeLine(gutter.join(""), runs, g.y, p);
      });

      // Record the leading before each line so blocks can be split on
      // paragraph gaps — the only separator the PUBLICATIONS and
      // PRESENTATIONS sections offer.
      var gaps = [];
      for (var i = 1; i < pageLines.length; i++) {
        var d = pageLines[i - 1].y - pageLines[i].y;
        pageLines[i].gapBefore = d;
        if (d > 0) gaps.push(d);
      }
      var lead = median(gaps);
      pageLines.forEach(function (ln) {
        ln.paraBreak =
          ln.gapBefore != null &&
          lead > 0 &&
          ln.gapBefore > lead * L.paraGapRatio;
      });

      // A page boundary carries no gap signal, so an entry at the top of
      // a page would otherwise be absorbed into the last entry of the
      // previous one. Treat the break as a paragraph break; entries that
      // genuinely span pages are rejoined by the section parsers, which
      // know what a complete entry looks like.
      if (p > 0 && pageLines.length) pageLines[0].paraBreak = true;

      lines = lines.concat(pageLines);
    }
    return lines;
  }

  function median(xs) {
    if (!xs.length) return 0;
    var s = xs.slice().sort(function (a, b) {
      return a - b;
    });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function makeLine(gutter, runs, y, page) {
    return {
      gutter: norm(gutter),
      runs: mergeRuns(runs),
      text: norm(
        runs
          .map(function (r) {
            return r.text;
          })
          .join(""),
      ),
      y: y,
      page: page,
      gapBefore: null,
      paraBreak: false,
    };
  }

  /** Collapses adjacent runs that share formatting. */
  function mergeRuns(runs) {
    var out = [];
    for (var i = 0; i < runs.length; i++) {
      var r = runs[i];
      if (!r.text) continue;
      var prev = out[out.length - 1];
      if (
        prev &&
        prev.bold === !!r.bold &&
        prev.italic === !!r.italic &&
        prev.sup === !!r.sup
      ) {
        prev.text += r.text;
      } else {
        out.push({
          text: r.text,
          bold: !!r.bold,
          italic: !!r.italic,
          sup: !!r.sup,
        });
      }
    }
    return out;
  }

  /* =========================================================
   * Stage 2 — Lines to Blocks
   *
   * A Block is one logical CV entry. A new block starts when a
   * line brings its own year, its own section label, or a bullet;
   * everything else is a wrapped continuation of the block above.
   * ======================================================= */

  var BULLET = /^[•●·∙]\s*/;
  /** Gutter text that is a date range rather than a section heading. */
  var GUTTER_DATE = /\d/;

  function toBlocks(lines) {
    var blocks = [];
    var cur = null;

    function push() {
      if (cur && (cur.text || cur.gutter)) blocks.push(cur);
      cur = null;
    }

    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      var startsBlock =
        cur === null ||
        !!ln.gutter || // a date or a heading always begins an entry
        BULLET.test(ln.text) ||
        ln.paraBreak; // a wider-than-normal gap ends the previous entry

      if (startsBlock) {
        push();
        cur = {
          gutter: ln.gutter,
          isDate: GUTTER_DATE.test(ln.gutter),
          bullet: BULLET.test(ln.text),
          text: ln.text.replace(BULLET, ""),
          runs: stripBulletRuns(ln.runs),
          page: ln.page,
          yTop: ln.y,
          yBottom: ln.y,
        };
      } else {
        cur.text = norm(cur.text + " " + ln.text);
        // The line break itself is a space. Without this the runs and
        // the text disagree, and locating an italic venue inside the
        // text fails on any citation whose journal name wraps.
        cur.runs = mergeRuns(cur.runs.concat(spaceLead(ln.runs)));
        cur.yBottom = ln.y;
        // A heading that wraps onto the next gutter line joins the first.
        if (ln.gutter) cur.gutter = norm(cur.gutter + " " + ln.gutter);
      }
    }
    push();
    return blocks;
  }

  /** Prefixes a line's runs with the space the line break implies. */
  function spaceLead(runs) {
    if (!runs.length) return runs;
    var out = runs.map(function (r) {
      return { text: r.text, bold: r.bold, italic: r.italic, sup: r.sup };
    });
    if (!/^\s/.test(out[0].text)) out[0].text = " " + out[0].text;
    return out;
  }

  function stripBulletRuns(runs) {
    var out = runs.map(function (r) {
      return { text: r.text, bold: r.bold, italic: r.italic, sup: r.sup };
    });
    if (out.length) out[0].text = out[0].text.replace(BULLET, "");
    return mergeRuns(out);
  }

  /* =========================================================
   * Stage 3 — split blocks into sections
   * ======================================================= */

  function splitSections(blocks) {
    var out = { _front: [] };
    var currentKey = "_front";
    var pending = ""; // a heading that arrived split across two blocks

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var head = null;

      if (b.gutter && !b.isDate) {
        head =
          matchHead(b.gutter) || matchHead(norm(pending + " " + b.gutter));
        pending = head ? "" : norm(pending + " " + b.gutter);
      }

      if (head) {
        currentKey = head.key;
        if (!out[currentKey]) out[currentKey] = [];
        // The heading line usually carries the section's first entry.
        if (b.text) out[currentKey].push(b);
        continue;
      }

      if (!out[currentKey]) out[currentKey] = [];
      out[currentKey].push(b);
    }
    return out;
  }

  function matchHead(text) {
    var k = normKey(text);
    for (var i = 0; i < SECTIONS.length; i++) {
      if (k === normKey(SECTIONS[i].head)) return SECTIONS[i];
    }
    return null;
  }

  /* =========================================================
   * Stage 3.5 — attach PDF link annotations to blocks
   *
   * Every citation ends in a "link" hyperlink pointing at the DOI,
   * which is the site's primary key for a publication. Without this
   * a new paper cannot be added automatically.
   * ======================================================= */

  function attachLinks(blocks, annotations) {
    if (!annotations || !annotations.length) return blocks;
    blocks.forEach(function (b) {
      b.links = [];
    });
    annotations.forEach(function (a) {
      if (!a.url) return;
      var mid = (a.rect[1] + a.rect[3]) / 2;
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        if (b.page !== a.page) continue;
        // yTop is the highest baseline, yBottom the lowest.
        if (mid <= b.yTop + 10 && mid >= b.yBottom - 6) {
          b.links.push(a.url);
          return;
        }
      }
    });
    return blocks;
  }

  /**
   * Pulls the DOI out of a link. Two entries in the June 2024 CV are
   * routed through a university library proxy
   * (libproxy1.nus.edu.sg/10.1021/...), so the DOI is matched wherever
   * it sits in the URL rather than only after doi.org.
   *
   * Returns null rather than guessing at a malformed identifier; the
   * raw URL is kept on the row so review can show what was found.
   */
  function doiFromUrl(url) {
    var m = String(url).match(/\b(10\.\d{4,9}\/[^\s"'<>)]+)/);
    return m ? m[1].replace(/[.,;]+$/, "") : null;
  }

  /* =========================================================
   * Stage 4 — section parsers
   *
   * Every parser returns rows shaped exactly like the site's data
   * files, so the diff compares like with like.
   * ======================================================= */

  /** Splits on a delimiter, ignoring delimiters inside parentheses. */
  function splitTopLevel(text, delim) {
    var out = [];
    var depth = 0;
    var buf = "";
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (c === "(") depth++;
      if (c === ")") depth = Math.max(0, depth - 1);
      if (c === delim && depth === 0) {
        out.push(buf);
        buf = "";
      } else {
        buf += c;
      }
    }
    out.push(buf);
    return out.map(norm).filter(function (s) {
      return s !== "";
    });
  }

  var QUOTED = /[“"]([^”"]+)[”"]/;

  /**
   * The CV sets the institution bold and the city that follows it plain,
   * separated by nothing but space. Splitting on weight recovers the
   * comma the site's format expects.
   */
  function splitBold(runs) {
    var bold = "";
    var rest = "";
    (runs || []).forEach(function (r) {
      if (r.bold) bold += r.text;
      else rest += r.text;
    });
    return { bold: norm(bold), rest: norm(rest) };
  }

  function joinOrg(a, b) {
    a = norm(a).replace(/[,\s]+$/, "");
    b = norm(b).replace(/^[,\s]+/, "");
    if (!a) return b;
    if (!b) return a;
    return a + ", " + b;
  }

  function parseEducation(blocks) {
    var rows = [];
    var cur = null;
    blocks.forEach(function (b) {
      if (b.isDate) {
        if (cur) rows.push(cur);
        var parts = splitBold(b.runs);
        cur = {
          year: normalizeYearRange(b.gutter),
          title: "",
          org: parts.bold
            ? joinOrg(unsmart(parts.bold), unsmart(parts.rest))
            : unsmart(b.text),
        };
      } else if (cur) {
        var t = unsmart(b.text);
        // "Ph.D. in Chemistry, GPA 4.2 Dissertation Title: "…" Advisor: …"
        var degree = t.split(/,\s*GPA|Dissertation Title:/i)[0];
        cur.title = norm(degree);
        var q = t.match(QUOTED);
        if (q) cur.dissertation = norm(q[1]);
        var adv = t.match(/Advisor:\s*(.+)$/i);
        if (adv) cur.advisor = norm(adv[1]);
      }
    });
    if (cur) rows.push(cur);
    return rows;
  }

  function parseAppointments(blocks) {
    return blocks
      .filter(function (b) {
        return b.isDate;
      })
      .map(function (b) {
        var parts = splitBold(b.runs);
        // Role and employer are bold; the city that follows is not.
        var head = unsmart(parts.bold || b.text);
        var i = head.indexOf(",");
        return {
          year: normalizeYearRange(b.gutter),
          title: i < 0 ? head : norm(head.slice(0, i)),
          org: joinOrg(
            i < 0 ? "" : head.slice(i + 1),
            parts.bold ? unsmart(parts.rest) : "",
          ),
        };
      });
  }

  function parseAwards(blocks) {
    return blocks
      .filter(function (b) {
        return b.text;
      })
      .map(function (b) {
        var t = unsmart(b.text);
        var note = "";
        // Trailing "(Role: PI)" is a note, not part of the name.
        t = t.replace(/\(\s*(Role:[^)]*)\)\s*$/i, function (_, r) {
          note = norm(r);
          return "";
        });
        var year = lastYear(t);
        // Drop the trailing ", 2023"
        t = norm(t.replace(/,?\s*\b(19|20)\d{2}\b\s*\.?\s*$/, ""));
        var parts = splitTopLevel(t, ",");
        return {
          year: year ? String(year) : "",
          title: parts.length ? parts[0] : t,
          org: parts.slice(1).join(", "),
          note: note,
        };
      })
      .filter(function (r) {
        return r.title;
      });
  }

  var TERMISH = /\b(Fall|Spring|Summer|Winter|IAP|Jan|May)\b|\b(19|20)\d{2}\b/i;

  function parseCourses(blocks) {
    return blocks
      .filter(function (b) {
        return b.text;
      })
      .map(function (b) {
        var t = unsmart(b.text);
        var open = t.lastIndexOf("(");
        var close = t.lastIndexOf(")");
        var title = t;
        var terms = "";
        var note = "";
        if (open > 0 && close > open) {
          title = norm(t.slice(0, open));
          var inner = norm(t.slice(open + 1, close));
          var parts = splitTopLevel(inner, ",");
          var termParts = [];
          var noteParts = [];
          parts.forEach(function (p) {
            if (!noteParts.length && TERMISH.test(p)) termParts.push(p);
            else noteParts.push(p);
          });
          terms = termParts.join(", ");
          note = noteParts.join(", ");
        }
        return { title: title, terms: terms, institution: "", note: note };
      })
      .filter(function (r) {
        return r.title;
      });
  }

  function parseTheses(blocks) {
    return blocks
      .filter(function (b) {
        return b.text;
      })
      .map(function (b) {
        var t = unsmart(b.text);
        var q = t.match(QUOTED);
        var title = q ? norm(q[1]) : "";
        var head = q ? norm(t.slice(0, t.indexOf(q[0]))) : t;
        var year = firstYear(head);
        var student = norm(head.replace(/\(\s*(19|20)\d{2}\s*\)/, ""));
        var tail = q ? norm(t.slice(t.indexOf(q[0]) + q[0].length)) : "";
        var note = tail.replace(/^\(|\)$/g, "");
        return {
          student: student,
          year: year || null,
          title: title,
          note: norm(note),
        };
      })
      .filter(function (r) {
        return r.student && r.title;
      });
  }

  /* A citation author looks like "M. Li", "Z.-G. Wang", "B. Zhuang*",
   * or "N. von Solms" — the nobiliary particle is lowercase. */
  var NAMEISH =
    /^(and\s+)?[A-Z]\.(\s*-?\s*[A-Z]\.?)*\s*((von|van|de[nr]?|du|da|di|del|della|la|le|ter|bin|al)\s+)?[A-Z]/;

  function parsePublications(blocks) {
    return blocks
      .filter(function (b) {
        return b.text && b.text.length > 40;
      })
      .map(function (b) {
        var full = unsmart(b.text);

        // The venue is the one italic run in a citation — far more
        // reliable than guessing where the title ends.
        var venue = "";
        var beforeText = full;
        var afterText = "";
        var italic = pickVenueRun(b.runs);
        if (italic) {
          venue = norm(italic.text).replace(/^[,.\s]+|[,.\s]+$/g, "");
          var at = full.indexOf(norm(italic.text).replace(/^[,\s]+/, ""));
          if (at > 0) {
            beforeText = norm(full.slice(0, at));
            afterText = norm(full.slice(at + venue.length));
          }
        }

        var year = lastYearInParens(afterText) || lastYearInParens(full);
        var volPages = afterText.match(/(\d+)\s*,\s*([0-9]+\s*[–\-—]?\s*[0-9]*)/);

        var split = splitAuthorsTitle(beforeText);
        var doi = null;
        (b.links || []).forEach(function (u) {
          var d = doiFromUrl(u);
          if (d && !doi) doi = d;
        });

        return {
          authors: split.authors,
          title: split.title,
          venue: venue,
          year: year,
          volume: volPages ? volPages[1] : "",
          pages: volPages ? norm(volPages[2]).replace(/\s*[–\-—]\s*/, "–") : "",
          doi: doi,
          // Kept so review can show why a DOI is missing.
          rawLinks: (b.links || []).slice(),
        };
      })
      .filter(function (r) {
        return r.title;
      });
  }

  /** The venue italic: skip short italic fragments inside a title. */
  function pickVenueRun(runs) {
    var best = null;
    (runs || []).forEach(function (r) {
      if (!r.italic) return;
      var t = norm(r.text).replace(/^[,.\s]+|[,.\s]+$/g, "");
      if (t.length < 4) return;
      if (!best || t.length > norm(best.text).length) best = r;
    });
    return best;
  }

  function lastYearInParens(s) {
    var all = String(s).match(/\((19|20)\d{2}\)/g);
    if (!all) return null;
    return parseInt(all[all.length - 1].replace(/[()]/g, ""), 10);
  }

  /* pdf.js emits superscript markers at their own x, so a marker can
   * land ahead of the name it belongs to ("W. # W. Y. Lim"). Reordering
   * it is not recoverable, so ignore stray markers when deciding where
   * the author list ends — and drop them from the author string, which
   * is a review-only field anyway. */
  var STRAY_MARKER = /(^|\s)[#‡†*]+(?=\s|$)/g;

  function splitAuthorsTitle(before) {
    var segs = splitTopLevel(before, ",");
    var i = 0;
    while (i < segs.length && NAMEISH.test(norm(segs[i].replace(STRAY_MARKER, " "))))
      i++;
    if (i === 0 || i >= segs.length) {
      return { authors: "", title: norm(before) };
    }
    return {
      authors: norm(segs.slice(0, i).join(", ").replace(STRAY_MARKER, " ")),
      title: norm(segs.slice(i).join(", ")).replace(/[.,]\s*$/, ""),
    };
  }

  /* A presentation: "Title" (invited talk), Venue, Location, Year. */
  function parseTalks(blocks) {
    var rows = [];
    blocks.forEach(function (b) {
      if (!b.text) return;
      // One paragraph can hold two talks — the June 2024 CV runs the
      // 2015 and 2014 entries together. Split on a quote that opens
      // after a sentence has ended.
      var chunks = unsmart(b.text).split(/(?<=\.)\s+(?=[“"])/);
      chunks.forEach(function (c) {
        var t = norm(c);
        if (!t) return;
        var q = t.match(QUOTED);
        if (!q) return;
        var rest = norm(t.slice(t.indexOf(q[0]) + q[0].length));
        var invited = /\(\s*invited talk\s*\)/i.test(rest);
        rest = norm(rest.replace(/\(\s*invited talk\s*\)/i, ""));
        rest = norm(rest.replace(/^[,\s]+/, "").replace(/\.\s*$/, ""));
        var year = lastYear(rest);
        rest = norm(rest.replace(/,?\s*\b(19|20)\d{2}\b\s*$/, ""));
        var parts = splitTopLevel(rest, ",");
        // Trailing 1–3 segments are the location; the rest is the venue.
        var locCount = Math.min(parts.length - 1, guessLocationParts(parts));
        var venue = parts.slice(0, parts.length - locCount).join(", ");
        var location = parts.slice(parts.length - locCount).join(", ");
        rows.push({
          title: norm(q[1]),
          invited: invited,
          venue: venue || rest,
          location: location,
          year: year,
        });
      });
    });
    return rows;
  }

  var PLACE_TAIL =
    /^(USA|UK|Singapore|China|Portugal|Germany|Hong Kong|Japan|France|Canada|Australia|India|Korea|[A-Z]{2})$/;

  /**
   * The trailing run of segments that reads as a place. The last one
   * must be a country or state; the ones before it must be short and
   * start with a capital, so a venue that itself contains commas
   * ("…Soft Matter Theory, Computation, and Simulation, Shanghai,
   * China") keeps its tail out of the location.
   */
  function guessLocationParts(parts) {
    var last = parts[parts.length - 1] || "";
    if (!PLACE_TAIL.test(last)) return 0;
    var n = 1;
    for (var i = parts.length - 2; i >= 0 && n < 3; i--) {
      var p = parts[i];
      if (p.split(/\s+/).length <= 3 && /^[A-Z]/.test(p)) n++;
      else break;
    }
    return n;
  }

  function parseAll(sections) {
    return {
      education: parseEducation(sections.education || []),
      appointments: parseAppointments(sections.appointments || []),
      awards: parseAwards(sections.awards || []),
      courses: parseCourses(sections.courses || []),
      theses: parseTheses(sections.theses || []),
      publications: parsePublications(sections.publications || []),
      talks: parseTalks(sections.talks || []),
    };
  }

  /* =========================================================
   * Stage 5 — diff against what the site already has
   *
   * The CV is not authoritative. The June 2024 CV is *behind* the
   * site: publications.ts already carries the 2025 Giant and 2024
   * Nature Biomedical Engineering papers that the CV never listed.
   * So a row the site has and the CV lacks defaults to KEEP, never
   * to delete, and only an explicit choice removes anything.
   * ======================================================= */

  /* How rows are identified across the two sides, and which fields
   * may be updated automatically when they disagree.
   *
   * `soft` fields are shown but never pre-selected for overwrite:
   * the site's curated author strings (with ‡/†/* markers intact)
   * beat anything recoverable from a PDF's reading order. */
  /* The split follows one question: does the CV know this field better
   * than the site does?
   *
   * Facts the CV settles — a year, a DOI, a volume, whether a talk was
   * invited — are hard, and a difference is pre-selected.
   *
   * Prose is soft. The site deliberately expands what the CV
   * abbreviates ("Journal of Physical Chemistry Letters" against
   * "J. Phys. Chem. Lett"), writes notes in the third person, and
   * carries author markers a PDF cannot reproduce. Overwriting those
   * automatically would undo editing work every time the CV is
   * re-imported, so they are shown and left unchecked. */
  var SCHEMA = {
    education: { key: eduKey, hard: ["year"], soft: ["title", "org", "dissertation", "advisor"] },
    appointments: { key: eduKey, hard: ["year"], soft: ["title", "org"] },
    awards: { key: awardKey, hard: ["year"], soft: ["title", "org", "note"] },
    courses: { key: titleKey, hard: [], soft: ["terms", "institution", "note"] },
    theses: { key: thesisKey, hard: ["year"], soft: ["title", "note"] },
    publications: {
      key: pubKey,
      hard: ["year", "volume", "pages", "doi"],
      soft: ["authors", "title", "venue"],
    },
    talks: { key: titleKey, hard: ["invited", "year"], soft: ["venue", "location"] },
  };

  function titleKey(r) {
    return normKey(r.title);
  }
  function eduKey(r) {
    return normKey(r.title) + "|" + String(r.year || "").slice(0, 4);
  }
  function awardKey(r) {
    return normKey(r.title) + "|" + String(r.year || "");
  }
  function thesisKey(r) {
    return normKey(r.student) + "|" + String(r.year || "");
  }
  /* DOI when both sides have one, normalised title otherwise — the CV
   * and the site sometimes abbreviate a venue differently, but never
   * the title. */
  function pubKey(r) {
    return r.doi ? "doi:" + String(r.doi).toLowerCase() : "t:" + normKey(r.title);
  }

  function indexBy(rows, keyFn) {
    var m = {};
    (rows || []).forEach(function (r, i) {
      var k = keyFn(r);
      if (!(k in m)) m[k] = { row: r, index: i };
    });
    return m;
  }

  /**
   * Three-way comparison for one section.
   *   added    — in the CV, not on the site        -> default ADD
   *   changed  — on both, some field differs       -> default UPDATE (hard fields only)
   *   siteOnly — on the site, not in the CV        -> default KEEP
   */
  function diffSection(kind, siteRows, cvRows) {
    var spec = SCHEMA[kind];
    if (!spec) throw new Error("cv-tool: no schema for section " + kind);

    var site = indexBy(siteRows, spec.key);
    var cv = indexBy(cvRows, spec.key);
    var added = [];
    var changed = [];
    var siteOnly = [];
    var unchanged = 0;

    // The site abbreviates what the CV spells out ("SERC Career
    // Development Award" against "Science and Engineering Research
    // Council Career Development Award"), and drops leading articles.
    // Pair those up before calling anything new, or every rename would
    // arrive as a duplicate.
    var alias = fuzzyPair(site, cv, spec);

    Object.keys(cv).forEach(function (k) {
      var c = cv[k].row;
      var sk = k in site ? k : alias[k];
      if (!sk) {
        added.push({ key: k, cv: c, action: "add" });
        return;
      }
      var s = site[sk].row;
      var fields = [];
      spec.hard.concat(spec.soft).forEach(function (f) {
        var a = fieldText(s[f]);
        var b = fieldText(c[f]);
        // An empty CV value is missing information, not a deletion.
        if (b === "" || a === b) return;
        fields.push({
          field: f,
          site: s[f],
          cv: c[f],
          soft: spec.soft.indexOf(f) >= 0,
        });
      });
      if (fields.length) {
        changed.push({
          key: sk,
          site: s,
          cv: c,
          index: site[sk].index,
          fields: fields,
          // Only hard-field differences are pre-selected.
          action: fields.some(function (f) {
            return !f.soft;
          })
            ? "update"
            : "keep",
        });
      } else {
        unchanged++;
      }
    });

    var matchedSite = {};
    Object.keys(cv).forEach(function (k) {
      var sk = k in site ? k : alias[k];
      if (sk) matchedSite[sk] = true;
    });

    Object.keys(site).forEach(function (k) {
      if (!matchedSite[k]) {
        siteOnly.push({
          key: k,
          site: site[k].row,
          index: site[k].index,
          action: "keep",
        });
      }
    });

    return {
      kind: kind,
      added: added,
      changed: changed,
      siteOnly: siteOnly,
      unchanged: unchanged,
    };
  }

  /* Words that carry no identifying weight when comparing titles. */
  var STOP = { the: 1, a: 1, an: 1, of: 1, for: 1, in: 1, on: 1, and: 1 };

  function tokens(s) {
    return normKey(s)
      .split(" ")
      .filter(function (w) {
        return w && !STOP[w];
      });
  }

  /** Fraction of the shorter title's words that the longer one contains. */
  function containment(a, b) {
    var A = tokens(a);
    var B = tokens(b);
    if (!A.length || !B.length) return 0;
    var set = {};
    B.forEach(function (w) {
      set[w] = 1;
    });
    var hits = 0;
    A.forEach(function (w) {
      if (set[w]) hits++;
    });
    return hits / Math.min(A.length, B.length);
  }

  function keyYear(row) {
    return String(row.year == null ? "" : row.year).slice(0, 4);
  }

  var FUZZY_MIN = 0.6;

  /**
   * Pairs leftover CV rows with leftover site rows of the same year.
   * Deliberately conservative: the year must match exactly and the
   * titles must share most of their meaningful words, so a rename is
   * matched but two different awards from the same year are not.
   */
  function fuzzyPair(site, cv, spec) {
    var alias = {};
    var freeSite = Object.keys(site).filter(function (k) {
      return !(k in cv);
    });
    if (!freeSite.length) return alias;
    var used = {};

    Object.keys(cv).forEach(function (ck) {
      if (ck in site) return;
      var c = cv[ck].row;
      var best = null;
      var bestScore = FUZZY_MIN;
      freeSite.forEach(function (sk) {
        if (used[sk]) return;
        var s = site[sk].row;
        if (keyYear(s) !== keyYear(c)) return;
        var score = containment(
          c.title || c.student || "",
          s.title || s.student || "",
        );
        if (score > bestScore) {
          bestScore = score;
          best = sk;
        }
      });
      if (best) {
        alias[ck] = best;
        used[best] = true;
      }
    });
    return alias;
  }

  function fieldText(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "boolean") return v ? "true" : "false";
    return normKey(String(v));
  }

  function diffAll(siteData, cvData) {
    var out = {};
    EXPORTED.forEach(function (k) {
      out[k] = diffSection(k, siteData[k] || [], cvData[k] || []);
    });
    return out;
  }

  /** Totals for the summary line above the review list. */
  function diffSummary(diffs) {
    var t = { added: 0, changed: 0, siteOnly: 0, unchanged: 0 };
    Object.keys(diffs).forEach(function (k) {
      t.added += diffs[k].added.length;
      t.changed += diffs[k].changed.length;
      t.siteOnly += diffs[k].siteOnly.length;
      t.unchanged += diffs[k].unchanged;
    });
    return t;
  }

  /* =========================================================
   * Stage 6 — read and rewrite the site's data files
   *
   * The tool patches the array body of one named export and leaves
   * every other byte of the file alone, so imports, types, the `pi`
   * object, and comments survive untouched. This is the same
   * discipline as the roster tool: never regenerate what you were
   * only asked to amend.
   * ======================================================= */

  /** Locates `export const <name> ... = [ ... ];` by bracket matching. */
  function findArrayExport(src, name) {
    var re = new RegExp(
      "export\\s+const\\s+" + name + "\\s*(?::[^=]*)?=\\s*\\[",
      "m",
    );
    var m = re.exec(src);
    if (!m) return null;
    var open = m.index + m[0].length - 1;
    var depth = 0;
    var inStr = null;
    for (var i = open; i < src.length; i++) {
      var c = src[i];
      if (inStr) {
        if (c === "\\") i++;
        else if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        inStr = c;
        continue;
      }
      if (c === "[") depth++;
      else if (c === "]") {
        depth--;
        if (depth === 0) {
          return { start: open, end: i + 1, literal: src.slice(open, i + 1) };
        }
      }
    }
    return null;
  }

  /**
   * Reads one exported array out of a .ts source as plain data.
   *
   * Data files may hoist repeated strings into module constants
   * (courses.ts does: `const HMC = "Harvey Mudd College"`), so those
   * are resolved into scope first. `asset()` is stubbed because pi.ts
   * imports it.
   */
  function readArrayExport(src, name) {
    var found = findArrayExport(src, name);
    if (!found) return null;

    var names = ["asset"];
    var values = [
      function (p) {
        return p;
      },
    ];
    var re = /^\s*const\s+([A-Za-z_$][\w$]*)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|-?\d+(?:\.\d+)?|true|false)\s*;/gm;
    var m;
    while ((m = re.exec(src))) {
      if (names.indexOf(m[1]) >= 0) continue;
      names.push(m[1]);
      values.push(new Function("return (" + m[2] + ");")());
    }

    var fn = Function.apply(
      null,
      names.concat(["return (" + found.literal + ");"]),
    );
    return fn.apply(null, values);
  }

  function patchArrayExport(src, name, literal) {
    var found = findArrayExport(src, name);
    if (!found) {
      throw new Error(
        "cv-tool: could not find `export const " + name + "` to patch.",
      );
    }
    return src.slice(0, found.start) + literal + src.slice(found.end);
  }

  /* ---- formatting rows back into TypeScript ---- */

  var KEY_ORDER = {
    education: ["year", "title", "org", "dissertation", "advisor", "note"],
    appointments: ["year", "title", "org", "note"],
    awards: ["year", "title", "org", "note"],
    courses: ["id", "title", "terms", "institution", "note"],
    theses: ["id", "student", "year", "title", "note"],
    publications: [
      "id", "authors", "title", "venue", "year",
      "volume", "pages", "doi", "preprintUrl", "pdfUrl", "note",
    ],
    talks: ["id", "title", "invited", "venue", "location", "year"],
  };

  /** Fields that stay in the file even when empty. */
  var REQUIRED = {
    talks: ["invited"],
  };

  function tsString(s) {
    return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }

  function tsValue(v) {
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") return String(v);
    return tsString(v);
  }

  function formatRows(kind, rows, indent) {
    var pad = indent || "  ";
    var order = KEY_ORDER[kind] || [];
    var required = REQUIRED[kind] || [];
    var body = (rows || [])
      .map(function (r) {
        var lines = [];
        order.forEach(function (k) {
          var v = r[k];
          var missing =
            v === undefined ||
            v === null ||
            (typeof v === "string" && norm(v) === "");
          if (missing && required.indexOf(k) < 0) return;
          lines.push(pad + pad + k + ": " + tsValue(missing ? "" : v) + ",");
        });
        return pad + "{\n" + lines.join("\n") + "\n" + pad + "},";
      })
      .join("\n");
    return rows && rows.length ? "[\n" + body + "\n]" : "[]";
  }

  /* ---- ids for rows the CV introduces ---- */

  function slug(s) {
    return normKey(s).replace(/\s+/g, "-").slice(0, 48).replace(/-+$/, "");
  }

  function makeId(kind, row, taken) {
    var base;
    if (kind === "publications") {
      var first = norm(row.authors).split(/[,\s]+/)[1] || "anon";
      base = slug(first) + "-" + (row.year || "") + "-" + slug(row.venue).split("-")[0];
    } else if (kind === "theses") {
      base = slug(norm(row.student).split(/\s+/).pop()) + "-" + (row.year || "");
    } else if (kind === "talks") {
      base = slug(row.venue).split("-").slice(0, 2).join("-") + "-" + (row.year || "") + "-" + slug(row.title).split("-").slice(0, 3).join("-");
    } else {
      base = slug(row.title);
    }
    base = base.replace(/^-+|-+$/g, "") || kind;
    var id = base;
    var n = 2;
    while (taken[id]) id = base + "-" + n++;
    taken[id] = true;
    return id;
  }

  /**
   * Applies the review decisions to the site's rows.
   * Order is preserved; additions are merged in by year, newest first,
   * which is how every list on the site already reads.
   */
  function applyDecisions(kind, siteRows, diff) {
    var spec = SCHEMA[kind];
    var rows = (siteRows || []).slice();
    var drop = {};

    diff.siteOnly.forEach(function (e) {
      if (e.action === "remove") drop[e.index] = true;
    });

    diff.changed.forEach(function (e) {
      if (e.action !== "update") return;
      var merged = {};
      Object.keys(rows[e.index]).forEach(function (k) {
        merged[k] = rows[e.index][k];
      });
      e.fields.forEach(function (f) {
        if (f.accepted) merged[f.field] = f.cv;
      });
      rows[e.index] = merged;
    });

    rows = rows.filter(function (_, i) {
      return !drop[i];
    });

    var taken = {};
    rows.forEach(function (r) {
      if (r.id) taken[r.id] = true;
    });

    var additions = diff.added
      .filter(function (e) {
        return e.action === "add";
      })
      .map(function (e) {
        var row = {};
        (KEY_ORDER[kind] || []).forEach(function (k) {
          if (k === "id") return;
          if (e.cv[k] !== undefined) row[k] = e.cv[k];
        });
        if ((KEY_ORDER[kind] || [])[0] === "id") row.id = makeId(kind, e.cv, taken);
        return row;
      });

    rows = rows.concat(additions);
    if (spec.sortByYear !== false) rows = sortNewestFirst(rows);
    return rows;
  }

  function sortNewestFirst(rows) {
    return rows
      .map(function (r, i) {
        return { r: r, i: i, y: rowYear(r) };
      })
      .sort(function (a, b) {
        if (a.y === b.y) return a.i - b.i; // stable
        return b.y - a.y;
      })
      .map(function (x) {
        return x.r;
      });
  }

  function rowYear(r) {
    if (typeof r.year === "number") return r.year;
    var s = String(r.year || r.terms || "");
    // "2023-" (present) sorts above a closed range ending the same year.
    if (/^\d{4}-\s*$/.test(s)) return parseInt(s, 10) + 0.5;
    return lastYear(s) || firstYear(s) || 0;
  }

  /* =========================================================
   * Stage 0 — file to Lines
   *
   * The libraries are passed in rather than reached for, so the Node
   * tests exercise the same functions the browser runs, and core.js
   * still touches no globals.
   * ======================================================= */

  /**
   * PDF. Text position gives the two columns; the embedded font names
   * give bold/italic; link annotations give the DOIs.
   */
  function extractPdf(pdfjsLib, data) {
    return pdfjsLib
      .getDocument({ data: data, useSystemFonts: true })
      .promise.then(function (doc) {
        var pages = [];
        var annotations = [];
        var fontRoles = {};
        var chain = Promise.resolve();

        for (var i = 1; i <= doc.numPages; i++) {
          chain = chain.then(readPage(doc, i, pages, annotations, fontRoles));
        }
        return chain.then(function () {
          return { pages: pages, annotations: annotations, fontRoles: fontRoles };
        });
      });
  }

  function readPage(doc, n, pages, annotations, fontRoles) {
    return function () {
      return doc.getPage(n).then(function (page) {
        // Populates commonObjs, without which the font names are not
        // yet resolved and every run would look like body text.
        return page
          .getOperatorList()
          .then(function () {
            return page.getTextContent();
          })
          .then(function (tc) {
            tc.items.forEach(function (it) {
              if (it.fontName && !(it.fontName in fontRoles)) {
                var obj = null;
                try {
                  obj = page.commonObjs.get(it.fontName);
                } catch (e) {
                  obj = null;
                }
                fontRoles[it.fontName] = roleFromFontName(obj && obj.name);
              }
            });
            pages.push({
              page: n,
              items: tc.items.map(function (it) {
                return {
                  s: it.str,
                  x: it.transform[4],
                  y: it.transform[5],
                  w: it.width,
                  f: it.fontName,
                  sz: Math.abs(it.transform[3]),
                };
              }),
            });
            return page.getAnnotations();
          })
          .then(function (anns) {
            anns.forEach(function (a) {
              if (a.url) {
                annotations.push({ page: n - 1, url: a.url, rect: a.rect });
              }
            });
          });
      });
    };
  }

  /* ---- DOCX ---------------------------------------------------- */

  function xmlText(s) {
    return String(s)
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, function (_, d) {
        return String.fromCharCode(parseInt(d, 10));
      })
      .replace(/&amp;/g, "&");
  }

  /** Runs inside one <w:p> or <w:tc>, with their formatting. */
  function docxRuns(xml) {
    var runs = [];
    var re = /<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g;
    var m;
    while ((m = re.exec(xml))) {
      var body = m[1];
      var props = (body.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [""])[0];
      var text = "";
      var tre = /<w:(t|tab)(?:\s[^>]*)?(?:\/>|>([\s\S]*?)<\/w:\1>)/g;
      var t;
      while ((t = tre.exec(body))) {
        text += t[1] === "tab" ? "\t" : xmlText(t[2] || "");
      }
      if (!text) continue;
      runs.push({
        text: text,
        bold: /<w:b\b(?![^>]*w:val="(?:0|false)")/.test(props),
        italic: /<w:i\b(?![^>]*w:val="(?:0|false)")/.test(props),
        sup: /w:val="superscript"/.test(props),
      });
    }
    return runs;
  }

  /**
   * DOCX. Word keeps real paragraph and run structure, so there is no
   * geometry to reconstruct: a paragraph is a block, and the gutter is
   * whatever sits in the first table cell or before the first tab.
   */
  function extractDocx(JSZip, data) {
    return JSZip.loadAsync(data).then(function (zip) {
      var docFile = zip.file("word/document.xml");
      if (!docFile) throw new Error("Not a Word document: word/document.xml is missing.");
      return Promise.all([
        docFile.async("string"),
        zip.file("word/_rels/document.xml.rels")
          ? zip.file("word/_rels/document.xml.rels").async("string")
          : Promise.resolve(""),
      ]).then(function (parts) {
        return docxToLines(parts[0], parts[1]);
      });
    });
  }

  function docxToLines(xml, relsXml) {
    var rels = {};
    var rre = /Id="([^"]+)"[^>]*Target="([^"]+)"/g;
    var rm;
    while ((rm = rre.exec(relsXml || ""))) rels[rm[1]] = rm[2];

    var lines = [];
    var body = (xml.match(/<w:body>[\s\S]*<\/w:body>/) || [xml])[0];

    // Walk tables and loose paragraphs in document order.
    var re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p\b[\s\S]*?<\/w:p>|<w:p\b[^>]*\/>/g;
    var m;
    while ((m = re.exec(body))) {
      var chunk = m[0];
      if (chunk.indexOf("<w:tbl>") === 0) {
        var rows = chunk.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) || [];
        rows.forEach(function (tr) {
          var cells = tr.match(/<w:tc>[\s\S]*?<\/w:tc>/g) || [];
          var gutter = cells.length > 1 ? runsText(docxRuns(cells[0])) : "";
          var contentXml = cells.length > 1 ? cells.slice(1).join("") : cells[0] || "";
          pushDocxLine(lines, gutter, docxRuns(contentXml), contentXml, rels);
        });
      } else {
        var runs = docxRuns(chunk);
        var gutter = "";
        // Before the first tab is the gutter, as in the printed CV.
        var joined = runsText(runs);
        if (joined.indexOf("\t") >= 0) {
          gutter = norm(joined.slice(0, joined.indexOf("\t")));
          runs = splitRunsAtTab(runs);
        }
        pushDocxLine(lines, gutter, runs, chunk, rels);
      }
    }
    return lines;
  }

  function runsText(runs) {
    return runs
      .map(function (r) {
        return r.text;
      })
      .join("");
  }

  function splitRunsAtTab(runs) {
    var out = [];
    var seen = false;
    runs.forEach(function (r) {
      if (seen) {
        out.push(r);
        return;
      }
      var i = r.text.indexOf("\t");
      if (i < 0) return;
      seen = true;
      var rest = r.text.slice(i + 1);
      if (rest) out.push({ text: rest, bold: r.bold, italic: r.italic, sup: r.sup });
    });
    return seen ? out : runs;
  }

  function pushDocxLine(lines, gutter, runs, xmlChunk, rels) {
    var text = norm(runsText(runs).replace(/\t/g, " "));
    if (!text && !gutter) return;
    var line = makeLine(gutter, runs, -lines.length, 0);
    // Every Word paragraph is its own entry; there are no wrapped
    // continuation lines to rejoin.
    line.paraBreak = true;
    line.links = docxLinks(xmlChunk, rels);
    lines.push(line);
  }

  function docxLinks(xmlChunk, rels) {
    var out = [];
    var re = /<w:hyperlink[^>]*r:id="([^"]+)"/g;
    var m;
    while ((m = re.exec(xmlChunk || ""))) {
      if (rels[m[1]]) out.push(rels[m[1]]);
    }
    return out;
  }

  /** Carries DOCX per-line links onto the blocks they belong to. */
  function attachDocxLinks(lines, blocks) {
    var byText = {};
    lines.forEach(function (ln) {
      if (ln.links && ln.links.length) byText[normKey(ln.text)] = ln.links;
    });
    blocks.forEach(function (b) {
      b.links = b.links || [];
      var hit = byText[normKey(b.text)];
      if (hit) b.links = b.links.concat(hit);
    });
    return blocks;
  }

  return {
    LAYOUT: LAYOUT,
    SECTIONS: SECTIONS,
    EXPORTED: EXPORTED,
    SCHEMA: SCHEMA,
    KEY_ORDER: KEY_ORDER,
    roleFromFontName: roleFromFontName,
    dominantSize: dominantSize,
    extractPdf: extractPdf,
    extractDocx: extractDocx,
    docxToLines: docxToLines,
    docxRuns: docxRuns,
    attachDocxLinks: attachDocxLinks,
    findArrayExport: findArrayExport,
    readArrayExport: readArrayExport,
    patchArrayExport: patchArrayExport,
    formatRows: formatRows,
    makeId: makeId,
    applyDecisions: applyDecisions,
    sortNewestFirst: sortNewestFirst,
    diffSection: diffSection,
    diffAll: diffAll,
    diffSummary: diffSummary,
    splitTopLevel: splitTopLevel,
    attachLinks: attachLinks,
    doiFromUrl: doiFromUrl,
    parseEducation: parseEducation,
    parseAppointments: parseAppointments,
    parseAwards: parseAwards,
    parseCourses: parseCourses,
    parseTheses: parseTheses,
    parsePublications: parsePublications,
    parseTalks: parseTalks,
    parseAll: parseAll,
    norm: norm,
    normKey: normKey,
    unsmart: unsmart,
    firstYear: firstYear,
    lastYear: lastYear,
    normalizeYearRange: normalizeYearRange,
    itemsToLines: itemsToLines,
    makeLine: makeLine,
    mergeRuns: mergeRuns,
    toBlocks: toBlocks,
    splitSections: splitSections,
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = CvTool;
