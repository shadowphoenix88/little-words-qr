/* Continuous QR scan: camera -> BarcodeDetector (if available) or vendored jsQR -> play the word. All on-device. */
(function () {
  "use strict";
  var words = {}; (window.LW_WORDS || []).forEach(function (w) { words[w.id] = w; });
  var video = document.getElementById("video"), status = document.getElementById("status");
  var startBtn = document.getElementById("start"), stopBtn = document.getElementById("stop");
  var canvas = document.createElement("canvas"), ctx = canvas.getContext("2d", { willReadFrequently: true });
  var stream = null, running = false, detector = null, lastId = "", lastAt = 0, wake = null, busy = false;
  if ("BarcodeDetector" in window) { try { detector = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) { detector = null; } }

  function idFromUrl(text) {
    var m = /\/w\/([a-z0-9-]+)\/?(?:[?#].*)?$/i.exec((text || "").trim());
    return m && words[m[1]] ? m[1] : null;
  }
  function show(id) {
    var w = words[id];
    document.getElementById("result").hidden = false;
    document.getElementById("rArt").src = "assets/icons/" + id + ".svg";
    document.getElementById("rZh").textContent = w.zh;
    document.getElementById("rPy").textContent = w.py;
    document.getElementById("rEn").textContent = w.en;
    document.getElementById("rLink").href = "w/" + id + "/";
    if (navigator.vibrate) navigator.vibrate(60);
    window.LW_say(w.zh);
    // say it twice, slowly: hear it, then repeat
    setTimeout(function () { if (lastId === id) window.LW_say(w.zh); }, 1800);
  }
  function handle(text) {
    var id = idFromUrl(text);
    if (!id) { status.textContent = "That code isn't one of our word cards."; return; }
    var now = Date.now();
    if (id === lastId && now - lastAt < 4000) return;   // don't repeat while the card stays in view
    lastId = id; lastAt = now;
    status.textContent = "✓ " + words[id].zh + " " + words[id].py;
    show(id);
  }
  function tick() {
    if (!running) return;
    if (!busy && video.readyState >= 2) {
      busy = true;
      if (detector) {
        detector.detect(video).then(function (r) { if (r && r[0]) handle(r[0].rawValue); })
          .catch(function () { detector = null; }).then(function () { busy = false; });
      } else {
        var vw = video.videoWidth, vh = video.videoHeight, s = Math.min(1, 640 / Math.max(vw, vh));
        canvas.width = Math.round(vw * s); canvas.height = Math.round(vh * s);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (code && code.data) handle(code.data);
        busy = false;
      }
    }
    setTimeout(function () { requestAnimationFrame(tick); }, 120);   // ~8 scans per second
  }
  startBtn.addEventListener("click", function () {
    // unlock speech on iOS with a user gesture
    try { var u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { status.textContent = "Camera not available (needs HTTPS and a modern browser)."; return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then(function (s) {
        stream = s; video.srcObject = s; video.play(); running = true;
        startBtn.hidden = true; stopBtn.hidden = false;
        status.textContent = "Scanning… hold the card inside the yellow box.";
        if (navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { wake = l; }).catch(function () {});
        tick();
      })
      .catch(function (e) { status.textContent = "Camera blocked: " + e.name + ". Allow camera access and try again."; });
  });
  stopBtn.addEventListener("click", function () {
    running = false; if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    if (wake) { wake.release(); wake = null; }
    startBtn.hidden = false; stopBtn.hidden = true; status.textContent = "Stopped.";
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden && running) stopBtn.click(); });
  window.LW_scanTest = handle;   // for testing
})();
