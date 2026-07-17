// Client-side JavaScript — add project-specific code here.

/**
 * Mobile bottom-sheet navigation — the fixed bottom bar's Menu button toggles
 * an app-style slide-up sheet. Closes on backdrop tap, Escape, the close
 * button, or choosing a link. Purely additive: without JS the sheet stays
 * hidden and desktop navigation is unaffected.
 */
(function () {
  function init() {
    var btn = document.getElementById("mobile-menu-btn");
    var sheet = document.getElementById("mobile-nav");
    var backdrop = document.getElementById("mobile-nav-backdrop");
    var closeBtn = document.getElementById("mobile-nav-close");
    if (!btn || !sheet || !backdrop) return;

    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", String(open));
      sheet.setAttribute("aria-hidden", String(!open));
      if (open) {
        var firstLink = sheet.querySelector("a, button");
        if (firstLink) firstLink.focus();
      } else {
        btn.focus();
      }
    }

    btn.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setOpen(false);
      }
    });
    sheet.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/**
 * Header notifications — the bell toggles a dropdown of alerts (dummy data
 * for now). Closes on Escape or outside click.
 */
(function () {
  function init() {
    var bell = document.getElementById("header-bell");
    var panel = document.getElementById("notifications-panel");
    if (!bell || !panel) return;

    function setOpen(open) {
      panel.hidden = !open;
      bell.setAttribute("aria-expanded", String(open));
    }

    bell.addEventListener("click", function () {
      setOpen(panel.hidden);
    });
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !e.target.closest(".header-bell-wrap")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) {
        setOpen(false);
        bell.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/**
 * Demo scenario widget — fixed corner dropdown of lifecycle states. Choosing
 * one submits the GET form (works without JS via Enter). The toggle button
 * collapses the panel down to just its header row; the choice is remembered
 * in localStorage so it stays out of the way across page loads. Prototype-only.
 */
(function () {
  var STORAGE_KEY = "demoWidgetCollapsed";

  function init() {
    var widget = document.getElementById("demo-widget");
    var toggle = document.getElementById("demo-widget-toggle");
    var select = document.getElementById("demo-scenario-select");
    if (!widget || !toggle) return;

    function setCollapsed(collapsed) {
      widget.classList.toggle("is-collapsed", collapsed);
      toggle.setAttribute("aria-expanded", String(!collapsed));
      try {
        localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
      } catch (e) {
        // localStorage unavailable (private browsing, etc.) — state just won't persist.
      }
    }

    var storedCollapsed = null;
    try {
      storedCollapsed = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setCollapsed(storedCollapsed === "1");

    toggle.addEventListener("click", function () {
      setCollapsed(!widget.classList.contains("is-collapsed"));
    });

    if (select) {
      select.addEventListener("change", function () {
        select.form.submit();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/**
 * All Services A-Z filter — hides services that don't match the query, along
 * with any letter group (and its index chip) left empty. Purely additive:
 * without JS the full A-Z list renders and the anchors still work.
 */
(function () {
  function init() {
    var input = document.getElementById("az-filter-input");
    var status = document.getElementById("az-status");
    if (!input || !status) return;

    var groups = Array.prototype.slice.call(document.querySelectorAll(".az-group"));
    var indexLinks = {};
    Array.prototype.forEach.call(
      document.querySelectorAll(".az-index a"),
      function (a) { indexLinks[a.getAttribute("data-letter")] = a; }
    );

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var total = 0;

      groups.forEach(function (group) {
        var visible = 0;
        Array.prototype.forEach.call(group.querySelectorAll("li"), function (li) {
          var match = !query || li.textContent.toLowerCase().indexOf(query) !== -1;
          li.hidden = !match;
          if (match) visible++;
        });
        group.hidden = visible === 0;
        var chip = indexLinks[group.getAttribute("data-letter")];
        if (chip) chip.hidden = visible === 0;
        total += visible;
      });

      if (!query) {
        status.textContent = "";
      } else if (total === 0) {
        status.textContent = "No services match “" + input.value.trim() + "”.";
      } else {
        status.textContent = total + (total === 1 ? " service matches." : " services match.");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
