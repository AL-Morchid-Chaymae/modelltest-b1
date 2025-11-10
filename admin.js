$(document).ready(function () {

  fetch("/results")
    .then(res => res.json())
    .then(data => {

      $('#results').DataTable({
        data: data,
        columns: [
          { data: "name" },
          { data: "lesen" },
          { data: "hoeren" },
          { data: "schreiben" },
          { data: "total" },
          { data: "date" }
        ],
        pageLength: 10,
        order: [[5, "desc"]],
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/de-DE.json"
        }
      });

    });
});
