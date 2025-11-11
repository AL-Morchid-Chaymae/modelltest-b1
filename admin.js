// Remplacer par ton domaine Railway :
const API_URL = "https://modelltest-b1-production.up.railway.app/results";

$(document).ready(function () {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      $("#results").DataTable({
        data: data,
        columns: [
          { data: "name" },
          { data: "lesen" },
          { data: "hoeren" },
          { data: "schreiben" },
          { data: "total" },
          { data: "date" }
        ],
        order: [[5, "desc"]]
      });
    })
    .catch(err => console.error("❌ Erreur chargement résultats:", err));
});
