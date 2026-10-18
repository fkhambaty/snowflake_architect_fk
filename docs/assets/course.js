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

  function ensureActionHint(block) {
    var prev = block.previousElementSibling;
    if (prev && prev.classList && prev.classList.contains("action-hint")) return;
    var hint = document.createElement("div");
    hint.className = "action-hint";
    hint.textContent = "Your turn — Copy SQL, paste into Snowsight, Run";
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
