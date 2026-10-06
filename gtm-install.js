/* =====================================================================
   INSTALLATION DE GOOGLE TAG MANAGER — toutes les pages sauf installation.html
   ---------------------------------------------------------------------
   PARTIE 1 DE L'EXAMEN : collez l'ID de VOTRE conteneur GTM entre les
   guillemets ci-dessous (exemple : "GTM-ABC1234"), puis enregistrez.
   ===================================================================== */

var GTM_ID = "";

/* ---------------------------------------------------------------------
   Ne modifiez pas la suite : c'est le code officiel de Google Tag Manager.
   --------------------------------------------------------------------- */
(function () {
  "use strict";
  window.dataLayer = window.dataLayer || [];
  var id = (GTM_ID || "").trim().toUpperCase();
  window.KOP_GTM = { id: id || null, source: id ? "élève" : "absent" };

  if (!id) {
    console.warn("[Examen] Aucun conteneur GTM : renseignez GTM_ID dans gtm-install.js");
    return;
  }

  (function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true; j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl; f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", id);
})();
