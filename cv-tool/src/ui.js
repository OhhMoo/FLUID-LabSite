/* ============================================================
 * cv-tool / ui.js
 *
 * DOM wiring only. Every decision about what the CV says and what
 * should change lives in core.js.
 * ============================================================ */
"use strict";

(function () {
  var $ = function (id) {
    return document.getElementById(id);
  };

  // window.SITE_DATA and window.SITE_SOURCES are inlined at build time.
  var siteSources = {};
  var siteData = {};
  var parsed = null;
  var diffs = null;

  function resetSite() {
    siteSources = {};
    Object.keys(window.SITE_SOURCES || {}).forEach(function (f) {
      siteSources[f] = window.SITE_SOURCES[f];
    });
    siteData = readSiteData(siteSources);
  }

  /* Which exported array lives in which file. */
  var FILE_OF = {
    education: "pi.ts",
    appointments: "pi.ts",
    awards: "pi.ts",
    publications: "publications.ts",
    talks: "talks.ts",
    courses: "courses.ts",
    theses: "theses.ts",
  };

  function readSiteData(sources) {
    var out = {};
    CvTool.EXPORTED.forEach(function (kind) {
      var src = sources[FILE_OF[kind]];
      out[kind] = src ? CvTool.readArrayExport(src, kind) || [] : [];
    });
    return out;
  }

  /* ---------------------------------------------------------
   * Drop zones
   * ------------------------------------------------------- */
  function wireDrop(zoneId, inputId, onFiles) {
    var zone = $(zoneId);
    var input = $(inputId);
    zone.addEventListener("click", function () {
      input.click();
    });
    input.addEventListener("change", function () {
      if (input.files && input.files.length) onFiles(input.files);
    });
    ["dragenter", "dragover"].forEach(function (e) {
      zone.addEventListener(e, function (ev) {
        ev.preventDefault();
        zone.classList.add("over");
      });
    });
    ["dragleave", "drop"].forEach(function (e) {
      zone.addEventListener(e, function (ev) {
        ev.preventDefault();
        zone.classList.remove("over");
      });
    });
    zone.addEventListener("drop", function (ev) {
      if (ev.dataTransfer && ev.dataTransfer.files.length) {
        onFiles(ev.dataTransfer.files);
      }
    });
  }

  function say(id, text, cls) {
    var el = $(id);
    el.textContent = text;
    el.className = "msg" + (cls ? " " + cls : "");
  }

  function readAsArrayBuffer(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        res(fr.result);
      };
      fr.onerror = function () {
        rej(new Error("Could not read " + file.name));
      };
      fr.readAsArrayBuffer(file);
    });
  }

  function readAsText(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        res(String(fr.result));
      };
      fr.onerror = function () {
        rej(new Error("Could not read " + file.name));
      };
      fr.readAsText(file);
    });
  }

  /* ---------------------------------------------------------
   * Step 1 — read the CV
   * ------------------------------------------------------- */
  function onCvFile(files) {
    var file = files[0];
    var isDocx = /\.docx$/i.test(file.name);
    var isPdf = /\.pdf$/i.test(file.name);
    if (!isDocx && !isPdf) {
      say("msgCv", "That is not a .docx or .pdf file.", "err");
      return;
    }
    say("msgCv", "Reading " + file.name + "…");

    readAsArrayBuffer(file)
      .then(function (buf) {
        return isDocx ? fromDocx(buf) : fromPdf(buf);
      })
      .then(function (result) {
        parsed = result;
        var total = CvTool.EXPORTED.reduce(function (n, k) {
          return n + (parsed[k] || []).length;
        }, 0);
        if (!total) {
          throw new Error(
            "No CV sections were recognised. Expected headings like EDUCATION, " +
              "APPOINTMENTS, PUBLICATIONS.",
          );
        }
        $("dropCv").innerHTML =
          '<span class="fname">' + escapeHtml(file.name) + "</span>";
        say(
          "msgCv",
          "Read " + total + " entries across " +
            CvTool.EXPORTED.filter(function (k) {
              return (parsed[k] || []).length;
            }).length +
            " sections.",
          "ok",
        );
        runDiff();
      })
      .catch(function (err) {
        parsed = null;
        say("msgCv", err.message || String(err), "err");
      });
  }

  function fromPdf(buf) {
    var pdfjsLib = window.pdfjsLib;
    if (window.PDF_WORKER_SRC) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = window.PDF_WORKER_SRC;
    }
    return CvTool.extractPdf(pdfjsLib, new Uint8Array(buf)).then(function (out) {
      out.pages.sort(function (a, b) {
        return a.page - b.page;
      });
      var lines = CvTool.itemsToLines(out.pages, out.fontRoles);
      var blocks = CvTool.attachLinks(CvTool.toBlocks(lines), out.annotations);
      return CvTool.parseAll(CvTool.splitSections(blocks));
    });
  }

  function fromDocx(buf) {
    return CvTool.extractDocx(window.JSZip, buf).then(function (lines) {
      var blocks = CvTool.attachDocxLinks(lines, CvTool.toBlocks(lines));
      return CvTool.parseAll(CvTool.splitSections(blocks));
    });
  }

  /* ---------------------------------------------------------
   * Optional — override the built-in site data
   * ------------------------------------------------------- */
  function onDataFiles(files) {
    var jobs = [];
    for (var i = 0; i < files.length; i++) {
      (function (f) {
        jobs.push(
          readAsText(f).then(function (text) {
            siteSources[f.name] = text;
          }),
        );
      })(files[i]);
    }
    Promise.all(jobs)
      .then(function () {
        siteData = readSiteData(siteSources);
        say(
          "msgData",
          "Now comparing against " + Object.keys(siteSources).join(", ") + ".",
          "ok",
        );
        renderSnapshot();
        if (parsed) runDiff();
      })
      .catch(function (err) {
        say("msgData", err.message || String(err), "err");
      });
  }

  /* ---------------------------------------------------------
   * Step 2 — review
   * ------------------------------------------------------- */
  function runDiff() {
    diffs = CvTool.diffAll(siteData, parsed);
    renderReview();
    $("secReview").style.display = "";
    $("btnBuild").disabled = false;
    $("secExport").style.display = "none";
  }

  function renderReview() {
    var t = CvTool.diffSummary(diffs);
    $("tally").innerHTML =
      '<span><b>' + t.added + "</b> new</span>" +
      '<span><b>' + t.changed + "</b> differ</span>" +
      '<span><b>' + t.siteOnly + "</b> only on the site</span>" +
      '<span><b>' + t.unchanged + "</b> already match</span>";

    $("reviewNote").textContent =
      t.siteOnly > 0
        ? "Entries the site has and the CV does not are kept. The CV is often " +
          "older than the website, so nothing is removed unless you say so."
        : "Entries the site has and the CV does not are always kept.";

    var host = $("review");
    host.innerHTML = "";

    CvTool.EXPORTED.forEach(function (kind) {
      var d = diffs[kind];
      if (!d.added.length && !d.changed.length && !d.siteOnly.length) return;

      var grp = document.createElement("details");
      grp.className = "grp";
      if (d.added.length) grp.open = true;

      var sum = document.createElement("summary");
      sum.innerHTML =
        "<span>" + label(kind) + "</span>" +
        (d.added.length ? '<span class="pill add">' + d.added.length + " new</span>" : "") +
        (d.changed.length ? '<span class="pill chg">' + d.changed.length + " differ</span>" : "") +
        (d.siteOnly.length ? '<span class="pill">' + d.siteOnly.length + " kept</span>" : "");
      grp.appendChild(sum);

      var body = document.createElement("div");
      body.className = "body";

      d.added.forEach(function (e, i) {
        body.appendChild(addedRow(kind, e, i));
      });
      d.changed.forEach(function (e, i) {
        body.appendChild(changedRow(kind, e, i));
      });
      d.siteOnly.forEach(function (e, i) {
        body.appendChild(siteOnlyRow(kind, e, i));
      });

      grp.appendChild(body);
      host.appendChild(grp);
    });

    if (!host.children.length) {
      host.innerHTML =
        '<p class="small">The CV and the website already agree. Nothing to change.</p>';
    }
  }

  function label(kind) {
    return kind.charAt(0).toUpperCase() + kind.slice(1).replace(/([A-Z])/g, " $1");
  }

  function rowTitle(r) {
    return r.title || r.student || "(untitled)";
  }

  function addedRow(kind, e, i) {
    var el = document.createElement("div");
    el.className = "entry";
    el.innerHTML =
      '<div class="title">' + escapeHtml(rowTitle(e.cv)) + "</div>" +
      '<div class="small">' + escapeHtml(describe(kind, e.cv)) + "</div>";

    var choose = document.createElement("div");
    choose.style.marginTop = "6px";
    choose.appendChild(
      radio("add-" + kind + "-" + i, "Add to the site", true, function () {
        e.action = "add";
      }),
    );
    choose.appendChild(
      radio("add-" + kind + "-" + i, "Skip", false, function () {
        e.action = "skip";
      }),
    );
    el.appendChild(choose);
    return el;
  }

  function changedRow(kind, e, i) {
    var el = document.createElement("div");
    el.className = "entry";
    el.innerHTML = '<div class="title">' + escapeHtml(rowTitle(e.site)) + "</div>";

    e.fields.forEach(function (f, j) {
      // Prose the site has deliberately edited is shown but not ticked.
      f.accepted = !f.soft;
      var row = document.createElement("div");
      row.className = "field";

      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = f.accepted;
      box.id = "f-" + kind + "-" + i + "-" + j;
      box.addEventListener("change", function () {
        f.accepted = box.checked;
        e.action = e.fields.some(function (x) {
          return x.accepted;
        })
          ? "update"
          : "keep";
      });

      var name = document.createElement("label");
      name.className = "name";
      name.htmlFor = box.id;
      name.textContent = f.field;

      var vals = document.createElement("div");
      vals.className = "vals";
      vals.innerHTML =
        '<div class="was">' + escapeHtml(String(f.site == null ? "" : f.site)) + "</div>" +
        '<div class="now">' + escapeHtml(String(f.cv == null ? "" : f.cv)) + "</div>" +
        (f.soft
          ? '<div class="soft-note">The site’s wording is usually the fuller one; ' +
            "left unticked on purpose.</div>"
          : "");

      row.appendChild(box);
      row.appendChild(name);
      row.appendChild(vals);
      el.appendChild(row);
    });

    e.action = e.fields.some(function (x) {
      return x.accepted;
    })
      ? "update"
      : "keep";
    return el;
  }

  function siteOnlyRow(kind, e, i) {
    var el = document.createElement("div");
    el.className = "entry";
    el.innerHTML =
      '<div class="title">' + escapeHtml(rowTitle(e.site)) + "</div>" +
      '<div class="small">Not in this CV &mdash; ' +
      escapeHtml(describe(kind, e.site)) + "</div>";

    var choose = document.createElement("div");
    choose.style.marginTop = "6px";
    choose.appendChild(
      radio("keep-" + kind + "-" + i, "Keep on the site", true, function () {
        e.action = "keep";
      }),
    );
    choose.appendChild(
      radio("keep-" + kind + "-" + i, "Remove", false, function () {
        e.action = "remove";
      }),
    );
    el.appendChild(choose);
    return el;
  }

  function radio(name, text, checked, onPick) {
    var wrap = document.createElement("label");
    wrap.className = "choice";
    var input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.checked = checked;
    input.addEventListener("change", function () {
      if (input.checked) onPick();
    });
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(text));
    return wrap;
  }

  function describe(kind, r) {
    if (kind === "publications") {
      return [r.venue, r.year, r.doi].filter(Boolean).join(" · ");
    }
    if (kind === "talks") {
      return [r.venue, r.location, r.year].filter(Boolean).join(" · ");
    }
    if (kind === "courses") return [r.terms, r.institution].filter(Boolean).join(" · ");
    return [r.year, r.org].filter(Boolean).join(" · ");
  }

  /* ---------------------------------------------------------
   * Step 3 — write the files
   * ------------------------------------------------------- */
  function build() {
    var byFile = {};
    var changedKinds = [];

    CvTool.EXPORTED.forEach(function (kind) {
      var file = FILE_OF[kind];
      if (!siteSources[file]) return;
      var rows = CvTool.applyDecisions(kind, siteData[kind], diffs[kind]);
      var before = CvTool.readArrayExport(siteSources[file], kind);
      var literal = CvTool.formatRows(kind, rows);
      if (!byFile[file]) byFile[file] = siteSources[file];
      if (JSON.stringify(before) === JSON.stringify(rows)) return;
      byFile[file] = CvTool.patchArrayExport(byFile[file], kind, literal);
      changedKinds.push(kind);
    });

    var host = $("files");
    host.innerHTML = "";
    var touched = Object.keys(byFile).filter(function (f) {
      return byFile[f] !== siteSources[f];
    });

    if (!touched.length) {
      host.innerHTML =
        '<p class="small">Nothing was selected, so there is nothing to download.</p>';
    } else {
      touched.forEach(function (f) {
        host.appendChild(fileCard(f, byFile[f]));
      });
    }

    $("secExport").style.display = "";
    say(
      "msgExport",
      touched.length
        ? "Replace these files in src/data/ and commit. Nothing else in them changed."
        : "",
      touched.length ? "ok" : "",
    );
    $("secExport").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fileCard(name, text) {
    var el = document.createElement("div");
    el.className = "file";
    var head = document.createElement("div");
    head.className = "row";
    head.style.justifyContent = "space-between";
    var path = document.createElement("span");
    path.className = "path";
    path.textContent = "src/data/" + name;
    var btn = document.createElement("button");
    btn.className = "btn secondary";
    btn.textContent = "Download";
    btn.addEventListener("click", function () {
      download(name, text);
    });
    head.appendChild(path);
    head.appendChild(btn);
    el.appendChild(head);
    return el;
  }

  function download(name, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2000);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSnapshot() {
    var counts = CvTool.EXPORTED.map(function (k) {
      return (siteData[k] || []).length + " " + k;
    }).join(", ");
    $("snapshot").textContent =
      "Built " + (window.SITE_SNAPSHOT || "unknown") + " from " + counts + ".";
  }

  /* ---------------------------------------------------------
   * Start
   * ------------------------------------------------------- */
  resetSite();
  renderSnapshot();
  wireDrop("dropCv", "fileCv", onCvFile);
  wireDrop("dropData", "fileData", onDataFiles);
  $("btnBuild").addEventListener("click", build);
})();
