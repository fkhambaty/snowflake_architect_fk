(function () {
  function iconCopy() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="2"/></svg>';
  }
  function iconCheck() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function setCopyLabel(btn, mode) {
    if (mode === "ok") {
      btn.classList.add("copied");
      btn.innerHTML = iconCheck() + " Copied!";
      btn.setAttribute("aria-label", "Copied");
    } else {
      btn.classList.remove("copied");
      btn.innerHTML = iconCopy() + " Copy SQL";
      btn.setAttribute("aria-label", "Copy SQL to clipboard");
    }
  }

  function bindCopy(btn, pre) {
    if (!btn || !pre || btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.type = "button";
    setCopyLabel(btn, "idle");
    btn.addEventListener("click", function () {
      var text = (pre.innerText || pre.textContent || "").replace(/\n$/, "");
      function ok() {
        setCopyLabel(btn, "ok");
        setTimeout(function () { setCopyLabel(btn, "idle"); }, 1600);
      }
      if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok).catch(function () {
          legacyCopy(text, ok);
        });
      } else {
        legacyCopy(text, ok);
      }
    });
  }

  function legacyCopy(text, ok) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    try {
      document.execCommand("copy");
      ok();
    } catch (e) {
      window.prompt("Copy this SQL manually (Ctrl+C):", text);
    } finally {
      document.body.removeChild(ta);
    }
  }

  function cleanIdent(raw) {
    return String(raw || "")
      .replace(/"/g, "")
      .replace(/\s+/g, "")
      .trim();
  }

  /** Match a SQL keyword only at statement start (not inside GRANT CREATE ROLE, etc.). */
  function atStmt(sql, body) {
    return new RegExp("(?:^|;)\\s*" + body, "i").test(sql);
  }

  function firstAtStmt(sql, bodyWithGroup) {
    var m = sql.match(new RegExp("(?:^|;)\\s*" + bodyWithGroup, "i"));
    return m ? cleanIdent(m[1]) : "";
  }

  function describeSql(sql) {
    var raw = String(sql || "");
    var s = raw
      .replace(/--.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();

    // Comment-only teaching blocks (replication / org admin demos)
    if (!s) {
      return raw.trim()
        ? "Reference-only notes for this step — read them; run only if your account allows it."
        : "";
    }

    if (
      /^\s*version:\s*\d+/m.test(s) ||
      /^\s*(sources|models|tables|columns):\s*$/m.test(s) ||
      /^\s{0,4}-\s+name:\s+\S+/m.test(s)
    ) {
      return "dbt YAML — declare source/model config in the repo (not run in Snowsight).";
    }
    if (/^\s*\w+:\s*$/m.test(s) && /target:|outputs:|type:\s*snowflake/i.test(s)) {
      return "dbt profiles.yml — connection target for local/CI runs (keep secrets out of git).";
    }
    if (/\{\{\s*config\s*\(/i.test(s)) {
      return "dbt model SQL — config + SELECT that dbt builds into Snowflake on dbt run.";
    }
    if (/^\s*dbt\s+/m.test(s) || /^\s*cd\s+\S+/m.test(s)) {
      return "Terminal command for the dbt project — run locally or in CI, not in Snowsight.";
    }

    var contextOnly = s.replace(/\s+/g, " ").match(
      /^(USE\s+(ROLE|WAREHOUSE|DATABASE|SCHEMA)\s+[A-Z0-9_."$]+\s*;\s*)+$/i
    );
    if (contextOnly) {
      return "Point this worksheet at the lab role, warehouse, database, and schema.";
    }

    if (atStmt(s, "USE\\s+SECONDARY\\s+ROLES\\s+NONE")) {
      return "Clear secondary roles so this privilege proof uses only the primary role.";
    }

    var stream = firstAtStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?STREAM\\s+([A-Z0-9_.\"]+)");
    if (stream) {
      return "Create stream " + stream + " — the change notebook on the source table.";
    }

    var task = firstAtStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?TASK\\s+([A-Z0-9_.\"]+)");
    if (task) {
      return "Define task " + task + " — the worker that reads the stream into the target.";
    }

    if (atStmt(s, "ALTER\\s+TASK[\\s\\S]*?\\bRESUME\\b")) {
      return "Resume the task so it may run when the stream has unread rows.";
    }
    if (atStmt(s, "ALTER\\s+TASK[\\s\\S]*?\\bSUSPEND\\b")) {
      return "Suspend the task so the warehouse stops waking for this lab.";
    }
    if (atStmt(s, "EXECUTE\\s+TASK\\b")) {
      return "Run the task once now and process whatever is waiting in the stream.";
    }

    var dt = firstAtStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?DYNAMIC\\s+TABLE\\s+([A-Z0-9_.\"]+)");
    if (dt) {
      return "Create dynamic table " + dt + " — Snowflake refreshes it within TARGET_LAG.";
    }

    if (atStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?MASKING\\s+POLICY\\b")) {
      return "Create the masking policy that disguises sensitive values by role.";
    }
    if (atStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?ROW\\s+ACCESS\\s+POLICY\\b")) {
      return "Create the row access policy that filters which rows each role can see.";
    }
    if (atStmt(s, "ALTER\\s+TABLE[\\s\\S]*?SET\\s+MASKING\\s+POLICY\\b") || /SET\s+MASKING\s+POLICY/i.test(s)) {
      return "Attach the masking policy to the column so SELECT actually disguises values.";
    }
    if (/ADD\s+ROW\s+ACCESS\s+POLICY|SET\s+ROW\s+ACCESS\s+POLICY/i.test(s)) {
      return "Attach the row access policy so row filters apply on SELECT.";
    }

    var view = firstAtStmt(
      s,
      "CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:SECURE\\s+)?VIEW\\s+([A-Z0-9_.\"]+)"
    );
    if (view) {
      return "Create view " + view + " — a safe projection of the underlying table.";
    }

    if (atStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:IF\\s+NOT\\s+EXISTS\\s+)?RESOURCE\\s+MONITOR\\b")) {
      return "Create a resource monitor to cap warehouse credits for the lab.";
    }
    if (atStmt(s, "ALTER\\s+(?:WAREHOUSE|ACCOUNT)\\b") && /RESOURCE\s+MONITOR/i.test(s)) {
      return "Attach the resource monitor credit guardrail to the warehouse/account.";
    }

    var tbl = firstAtStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?TABLE\\s+([A-Z0-9_.\"]+)");
    if (tbl) {
      return "Create table " + tbl + " for this step.";
    }

    if (atStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?FILE\\s+FORMAT\\b")) {
      return "Define how Snowflake should parse the inbound files.";
    }
    if (atStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?STAGE\\b")) {
      return "Create the stage — the file landing dock before COPY INTO.";
    }
    if (atStmt(s, "COPY\\s+INTO\\b")) {
      return "Load rows from the stage into the table.";
    }

    if (atStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?SHARE\\b")) {
      return "Create the outbound share for partner read access.";
    }
    if (atStmt(s, "ALTER\\s+SHARE\\b")) {
      return "Add objects or consumer accounts to the share.";
    }
    if (/\bCLONE\b/i.test(s) && atStmt(s, "CREATE\\b")) {
      return "Clone into a fast same-account fork (QA/sandbox), not geo-DR.";
    }
    if (atStmt(s, "UNDROP\\b")) {
      return "Bring back a dropped object from Time Travel retention.";
    }
    if (/\bAT\s*\(|\bBEFORE\s*\(/i.test(s)) {
      return "Query an earlier table version with Time Travel.";
    }

    // Privileges before CREATE ROLE/SCHEMA — avoids "GRANT CREATE ROLE" false hits.
    if (atStmt(s, "GRANT\\b")) {
      return "Grant the privileges/roles so the next steps (and proofs) can succeed.";
    }

    if (atStmt(s, "CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:DATABASE|SCHEMA|ROLE|WAREHOUSE)\\b")) {
      return "Create the Meridian lab object(s) this step needs (database, schema, role, or warehouse).";
    }

    if (atStmt(s, "DELETE\\b") && atStmt(s, "INSERT\\b")) {
      return "Reset the demo row(s), then insert a clean proof row.";
    }
    if (atStmt(s, "DELETE\\s+FROM\\b")) {
      return "Delete demo row(s) so the next proof starts clean.";
    }
    if (atStmt(s, "INSERT\\s+INTO\\b")) {
      return "Insert the demo row(s) this step needs.";
    }
    if (atStmt(s, "MERGE\\s+INTO\\b")) {
      return "MERGE changed rows into the target using the key / watermark logic.";
    }
    if (atStmt(s, "UPDATE\\b")) {
      return "Update existing row(s) for this demo.";
    }
    if (atStmt(s, "DROP\\b")) {
      return "Drop the demo object so you can prove recovery or rebuild cleanly.";
    }
    if (atStmt(s, "SET\\b")) {
      return "Set a session variable used by the next statements.";
    }
    if (atStmt(s, "ALTER\\s+WAREHOUSE\\b") || atStmt(s, "ALTER\\s+ACCOUNT\\b") || atStmt(s, "ALTER\\s+TABLE\\b")) {
      return "Alter the object for this step (warehouse, account, or table setting).";
    }

    if (/CURRENT_ROLE|CURRENT_SECONDARY_ROLES/i.test(s)) {
      return "Show which primary and secondary roles are active in this session.";
    }
    if (/\bPOLICY_REFERENCES\b/i.test(s) || atStmt(s, "SHOW\\b") || atStmt(s, "DESCRIBE\\b") || atStmt(s, "DESC\\b")) {
      return "Inspect metadata — confirm the object, policy, or grant is in place.";
    }
    if (atStmt(s, "SELECT\\b")) {
      return "Check query — confirm what you should see after this step.";
    }
    if (atStmt(s, "CALL\\b")) {
      return "Call the procedure for this step.";
    }

    return "";
  }

  function hintFromHead(block) {
    var span = block.querySelector(".code-head span");
    if (!span) return "";
    var label = (span.textContent || "")
      .replace(/^SQL\s*[·•\-:]+\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!label || /^ready to copy$/i.test(label)) return "";
    return "What this does: " + label + ".";
  }

  function ensureActionHint(block) {
    var pre = block.querySelector("pre");
    var sql = pre ? (pre.innerText || pre.textContent || "") : "";
    var text =
      (block.getAttribute("data-why") || "").trim() ||
      describeSql(sql) ||
      hintFromHead(block) ||
      "Run this SQL for the current step.";

    var prev = block.previousElementSibling;
    if (prev && prev.classList && prev.classList.contains("action-hint")) {
      prev.textContent = text;
      return;
    }
    var hint = document.createElement("div");
    hint.className = "action-hint";
    hint.textContent = text;
    block.parentNode.insertBefore(hint, block);
  }

  function enhanceCodeBlocks() {
    // 1) Existing .code-block structures
    document.querySelectorAll(".code-block").forEach(function (block) {
      var pre = block.querySelector("pre");
      if (!pre) return;

      var head = block.querySelector(".code-head");
      var btn = block.querySelector(".copy-btn");

      if (!head) {
        head = document.createElement("div");
        head.className = "code-head";
        head.innerHTML = "<span>SQL — ready to copy</span>";
        block.insertBefore(head, pre);
      }

      if (!btn) {
        btn = document.createElement("button");
        btn.className = "copy-btn";
        head.appendChild(btn);
      } else if (btn.parentElement !== head) {
        head.appendChild(btn);
      }

      ensureActionHint(block);
      bindCopy(btn, pre);
    });

    // 2) Orphan <pre> tags (wrap + add copy)
    document.querySelectorAll("pre").forEach(function (pre) {
      if (pre.closest(".code-block")) return;

      var wrap = document.createElement("div");
      wrap.className = "code-block";
      var head = document.createElement("div");
      head.className = "code-head";
      head.innerHTML = "<span>SQL — ready to copy</span>";
      var btn = document.createElement("button");
      btn.className = "copy-btn";
      head.appendChild(btn);

      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(head);
      wrap.appendChild(pre);
      ensureActionHint(wrap);
      bindCopy(btn, pre);
    });
  }

  function injectGotchaStrip() {
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!/^lab-\d+\.html$/.test(page) && page !== "story.html" && page !== "index.html") return;
    if (document.getElementById("snowsight-gotcha-strip")) return;

    var strip = document.createElement("aside");
    strip.id = "snowsight-gotcha-strip";
    strip.className = "gotcha-strip";
    strip.innerHTML =
      "<strong>Snowsight:</strong> Role proofs need " +
      "<code>USE SECONDARY ROLES NONE;</code> after <code>USE ROLE FR_*</code> — " +
      "or the vault still opens. Details: <a href=\"SNOWSIGHT_GOTCHAS.md\">Gotchas</a> · " +
      "Smoke: <code>sql/smoke_role_proofs.sql</code>";

    var top = document.querySelector(".topbar");
    if (top && top.parentNode) {
      top.parentNode.insertBefore(strip, top.nextSibling);
    } else {
      document.body.insertBefore(strip, document.body.firstChild);
    }
  }

  function initCdcDemo(root) {
    if (!root || root.dataset.bound === "1") return;
    root.dataset.bound = "1";

    var captions = [
      {
        title: "1 · Build the silver CDC table",
        body: "<code>SILVER_CURATED.TXN_SILVER_CDC</code> is the destination shelf. Nothing in it yet — the stream+task handoff will fill it."
      },
      {
        title: "2 · Create the stream (change notebook)",
        body: "<code>BRONZE_LANDING.TXN_EVENTS_STR</code> watches <code>TXN_EVENTS</code>. New inserts become pages in the notebook (<code>APPEND_ONLY</code>)."
      },
      {
        title: "3 · Create + RESUME the task",
        body: "<code>TASK_TXN_CDC</code> is the worker. It only runs when <code>SYSTEM$STREAM_HAS_DATA(...)</code> is true — not on an empty notebook."
      },
      {
        title: "4 · Insert txn 1099 on the dock",
        body: "Lab cleans old 1099, then <code>INSERT INTO BRONZE_LANDING.TXN_EVENTS</code>. The stream now has a page for 1099."
      },
      {
        title: "5 · EXECUTE TASK — row moves to silver",
        body: "Task runs <code>INSERT … SELECT</code> from the stream into <code>TXN_SILVER_CDC</code>. Prove with <code>SELECT … WHERE TXN_ID = 1099</code>."
      },
      {
        title: "6 · SUSPEND the task",
        body: "Lab done — sleep the worker so <code>WH_BANK_XS</code> doesn’t keep waking. Credits stay sane until you need CDC again."
      }
    ];

    var step = 0;
    var playing = true;
    var timer = null;
    var nodes = root.querySelectorAll(".cdc-node");
    var pipes = root.querySelectorAll(".cdc-pipe");
    var label = root.querySelector("[data-cdc-label]");
    var caption = root.querySelector("[data-cdc-caption]");
    var playBtn = root.querySelector("[data-cdc-play]");
    var packet = root.querySelector("[data-cdc-packet]");

    function render() {
      nodes.forEach(function (n, i) {
        n.classList.toggle("is-active", i === step);
        n.classList.toggle("is-done", i < step);
      });
      pipes.forEach(function (p, i) {
        p.classList.toggle("is-lit", i < step);
      });
      if (label) label.textContent = "Step " + (step + 1) + " / " + captions.length;
      if (caption && captions[step]) {
        caption.innerHTML =
          "<strong>" + captions[step].title + "</strong><p>" + captions[step].body + "</p>";
      }
      if (packet) {
        packet.classList.toggle("is-visible", step >= 3);
        packet.classList.toggle("at-stream", step === 3);
        packet.classList.toggle("at-task", step === 4);
        packet.classList.toggle("at-silver", step >= 5);
      }
      if (playBtn) {
        playBtn.textContent = playing ? "Pause" : "Play";
        playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      }
    }

    function go(n) {
      step = (n + captions.length) % captions.length;
      render();
    }

    function tick() {
      go(step + 1);
    }

    function start() {
      stop();
      playing = true;
      timer = setInterval(tick, 2800);
      render();
    }

    function stop() {
      playing = false;
      if (timer) clearInterval(timer);
      timer = null;
      render();
    }

    var prev = root.querySelector("[data-cdc-prev]");
    var next = root.querySelector("[data-cdc-next]");
    if (prev) prev.addEventListener("click", function () { stop(); go(step - 1); });
    if (next) next.addEventListener("click", function () { stop(); go(step + 1); });
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (playing) stop();
        else start();
      });
    }

    nodes.forEach(function (n, i) {
      n.addEventListener("click", function () { stop(); go(i); });
      n.style.cursor = "pointer";
    });

    render();
    start();
  }

  function initPickDemo(root) {
    if (!root || root.dataset.bound === "1") return;
    root.dataset.bound = "1";

    var section = root.closest(".pick-wrap") || document.getElementById("pick-path");
    var lanes = section ? section.querySelectorAll("[data-pick-lane]") : [];
    var buttons = root.querySelectorAll(".pick-scenario");
    var result = root.querySelector("[data-pick-result]");
    var badge = root.querySelector("[data-pick-badge]");
    var why = root.querySelector("[data-pick-why]");

    var copy = {
      stream: {
        badge: "→ Stream + Task",
        why: "This lab’s path: change notebook + worker. Elena writes the handoff SQL; Jordan audits every step; SUSPEND when done so credits stop."
      },
      dt: {
        badge: "→ Dynamic table",
        why: "Declare the SELECT + TARGET_LAG. No stream object, no task body — Snowflake refreshes the shelf to stay within lag. Optional Step 7."
      },
      dbt: {
        badge: "→ dbt incremental (Lab 02)",
        why: "Repo owns the graph: watermark MERGE, tests, CI. Not a Snowflake task scheduler — engineering ships SQL through Git."
      }
    };

    function apply(mode) {
      var info = copy[mode] || copy.stream;
      if (badge) badge.textContent = info.badge;
      if (why) why.textContent = info.why;
      if (result) result.setAttribute("data-mode", mode);

      lanes.forEach(function (lane) {
        var kind = lane.getAttribute("data-pick-lane");
        var lit = mode === "stream" ? kind === "stream" : mode === "dt" ? kind === "dt" : false;
        lane.classList.toggle("is-lit", lit || mode === "dbt");
        lane.classList.toggle("is-dim", mode !== "dbt" && !lit);
        if (mode === "dbt") {
          lane.classList.add("is-dim");
          lane.classList.remove("is-lit");
        }
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        apply(btn.getAttribute("data-pick") || "stream");
      });
    });

    var active = root.querySelector(".pick-scenario.is-active");
    apply(active ? active.getAttribute("data-pick") || "stream" : "stream");
  }

  function boot() {
    injectGotchaStrip();
    enhanceCodeBlocks();
    document.querySelectorAll("[data-cdc-demo]").forEach(initCdcDemo);
    document.querySelectorAll("[data-pick-demo]").forEach(initPickDemo);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
