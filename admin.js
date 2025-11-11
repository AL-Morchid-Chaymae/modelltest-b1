$(document).ready(function () {
  $('#results').DataTable({
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
});
