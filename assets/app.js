/* Little Words 小小字卡: speech + parent mode + pop-up cards. No network calls, no tracking. */
(function () {
  "use strict";
  var KEY = "lw-parent-mode";            // "on" = English visible (default), "off" = hidden
  var body = document.body;
  function applyParent(on) {
    body.classList.toggle("no-en", !on);
    var b = document.getElementById("parentToggle");
    if (b) { b.setAttribute("aria-pressed", on ? "true" : "false"); b.textContent = on ? "EN ✓" : "EN"; b.title = "Parent mode: show/hide English"; }
  }
  var on = true;
  try { on = localStorage.getItem(KEY) !== "off"; } catch (e) {}
  applyParent(on);
  var pt = document.getElementById("parentToggle");
  if (pt) pt.addEventListener("click", function () {
    on = !on; applyParent(on);
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {}
  });

  // ---------------- speech (Web Speech API, prefers a Taiwan voice)
  var synth = window.speechSynthesis;
  var voice = null;
  function pickVoice() {
    if (!synth) return null;
    var vs = synth.getVoices() || [];
    function norm(l) { return (l || "").replace("_", "-").toLowerCase(); }
    var tw = vs.filter(function (v) { var l = norm(v.lang); return l === "zh-tw" || l.indexOf("zh-hant") === 0 || /taiwan|臺灣|\u53f0\u7063|mei-?jia/i.test(v.name); });
    var cn = vs.filter(function (v) { var l = norm(v.lang); return l === "zh-cn" || l === "cmn-cn" || l.indexOf("zh-hans") === 0 || l === "zh" || l.indexOf("cmn") === 0; });
    var any = vs.filter(function (v) { var l = norm(v.lang); return l.indexOf("zh") === 0 && l !== "zh-hk" && !/canton|粵/i.test(v.name); });
    voice = tw[0] || cn[0] || any[0] || null;
    var note = document.getElementById("voiceNote");
    if (note && vs.length) {
      if (!voice) { note.hidden = false; note.textContent = "No Chinese voice found on this device. Add one in Settings → Text-to-speech (Chinese, Taiwan)."; }
      else if (!tw[0]) { note.hidden = false; note.textContent = "Using a Mainland Mandarin voice (no Taiwan voice installed)."; }
      else note.hidden = true;
    }
    return voice;
  }
  if (synth) { pickVoice(); if (typeof synth.onvoiceschanged !== "undefined") synth.onvoiceschanged = pickVoice; }
  function say(text, btn) {
    if (!synth) { alert("Speech is not supported in this browser."); return; }
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    if (!voice) pickVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "zh-TW"; }
    u.rate = 0.8; u.pitch = 1.1;
    if (btn) { btn.classList.add("speaking"); u.onend = u.onerror = function () { btn.classList.remove("speaking"); }; }
    synth.speak(u);
  }
  window.LW_say = say;
  // offline cache (no tracking; only caches this site's own files)
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    var swUrl = (document.querySelector('link[rel="stylesheet"]').getAttribute("href") || "").replace("assets/app.css", "sw.js");
    navigator.serviceWorker.register(swUrl).catch(function () {});
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-say]");
    if (t) { say(t.getAttribute("data-say"), t); return; }
    var o = ev.target.closest("[data-open]");
    if (o) {
      var d = document.getElementById(o.getAttribute("data-open"));
      if (d && d.showModal) d.showModal(); else if (d) d.setAttribute("open", "");
    }
  });
  // deep links: .../w/dog/#roleplay or #questions open the card
  var h = (location.hash || "").slice(1);
  if (h === "roleplay" || h === "questions") { var dd = document.getElementById(h); if (dd && dd.showModal) dd.showModal(); }
  // close dialog by tapping the backdrop
  Array.prototype.forEach.call(document.querySelectorAll("dialog"), function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  });
})();
