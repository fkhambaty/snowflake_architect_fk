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

  function boot() {
    injectGotchaStrip();
    enhanceCodeBlocks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
