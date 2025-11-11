$(document).ready(function () {

  const table = $('#results').DataTable({
    ajax: {
      url: "https://modelltest-b1-production.up.railway.app/results",
      dataSrc: ""
    },
    columns: [
      { data: "name" },
      { data: "lesen" },
      { data: "hoeren" },
      { data: "schreiben" },
      { data: "total" },

      // ✅  Affichage du texte dans un bouton
      {
        data: "schreiben_text",
        render: function (data) {
          return `<button class="view-btn" data-text="${encodeURIComponent(data || '')}">📄 Voir</button>`;
        }
      },

      { data: "date" }
    ],
    language: {
      "emptyTable": "Keine Daten verfügbar",
      "search": "Suchen:",
      "lengthMenu": "Zeige _MENU_ Einträge",
      "info": "Zeige _START_ bis _END_ von _TOTAL_",
      "paginate": { "next": "Weiter", "previous": "Zurück" }
    }
  });

  // ✅ Clique pour afficher le texte
  $('#results tbody').on('click', '.view-btn', function () {
    const text = decodeURIComponent($(this).data('text'));
    $('#popup-text').text(text || "(Kein Text)");
    $('#popup').fadeIn(200);
  });

  // ✅ Fermer la popup
  $('#popup-close').click(function () {
    $('#popup').fadeOut(200);
  });

});
