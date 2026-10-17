(function () {
  function iconCopy() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="2"/></svg>';
  }
  function iconCheck() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll("pre[data-copy], .code-block pre").forEach(function (pre) {
      if (pre.closest(".code-block")) {
        var existing = pre.closest(".code-block").querySelector(".copy-btn");
        if (existing) {
          bindCopy(existing, pre);
          return;
        }
      }

      var wrap = document.createElement("div");
      wrap.className = "code-block";
      var label = pre.getAttribute("data-label") || "SQL — click Copy, then paste in Snowsight";
      var head = document.createElement("div");
      head.className = "code-head";
      head.innerHTML = "<span>" + label + "</span>";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.innerHTML = iconCopy() + " Copy";
      head.appendChild(btn);

      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(head);
      wrap.appendChild(pre);
      bindCopy(btn, pre);
    });

    document.querySelectorAll(".code-block .copy-btn").forEach(function (btn) {
      var pre = btn.closest(".code-block").querySelector("pre");
      if (pre) bindCopy(btn, pre);
    });
  }

  function bindCopy(btn, pre) {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function () {
      var text = pre.innerText.replace(/\n$/, "");
      function ok() {
        btn.classList.add("copied");
        btn.innerHTML = iconCheck() + " Copied!";
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.innerHTML = iconCopy() + " Copy";
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
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
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      ok();
    } finally {
      document.body.removeChild(ta);
    }
  }

  document.addEventListener("DOMContentLoaded", enhanceCodeBlocks);
})();
