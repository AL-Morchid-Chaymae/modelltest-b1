/* ===== TIMER 60 MINUTES ===== */
let timeLeft = 60 * 60; // 60 minutes en secondes
const timerEl = document.getElementById("timerEl");

function updateTimer() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  timerEl.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
  timeLeft--;

  if (timeLeft < 0) {
    clearInterval(timerInterval);

    alert("⏱️ Le temps est terminé ! Ihre Zeit ist abgelaufen.");

    document.querySelectorAll("input, textarea, select, button").forEach(el => {
      if(el.id !== "submit-all") el.disabled = true;
    });

    document.getElementById("submit-all").click();
  }
}

const timerInterval = setInterval(updateTimer, 1000);






/* ===== STOCKAGE DES RÉPONSES ===== */
const storedAnswers = {
  lesen: {},
  brief: {},
  grammatik: {},
  hoeren: {},
  schreiben: {}
};

/* ===== LESEN ===== */
document.getElementById('lesen-save')?.addEventListener('click', () => {
  storedAnswers.lesen.q1 = document.querySelector('input[name="lesen_q1"]:checked')?.value || null;
  storedAnswers.lesen.q2 = document.querySelector('input[name="lesen_q2"]:checked')?.value || null;
  storedAnswers.lesen.q3 = document.querySelector('input[name="lesen_q3"]:checked')?.value || null;
  storedAnswers.lesen.q4 = document.getElementById('lesen_q4').value.trim();
  storedAnswers.lesen.q5 = document.querySelector('input[name="lesen_q5"]:checked')?.value || null;
  storedAnswers.lesen.q6 = document.getElementById('lesen_q6').value.trim();
});

/* ===== BRIEF ===== */
document.getElementById('brief-save')?.addEventListener('click', () => {
  for (let i = 1; i <= 6; i++) {
    storedAnswers.brief[`l${i}`] = document.getElementById(`brief_l${i}`).value || null;
  }
});

/* ===== GRAMMATIK ===== */
document.getElementById('gram-save')?.addEventListener('click', () => {
  storedAnswers.grammatik.a = document.querySelector('input[name="gram_a"]:checked')?.value || null;
  storedAnswers.grammatik.b = document.querySelector('input[name="gram_b"]:checked')?.value || null;
  storedAnswers.grammatik.c = document.querySelector('input[name="gram_c"]:checked')?.value || null;
});

/* ===== HÖREN ===== */
document.getElementById('hoeren_sm_save')?.addEventListener('click', () => {
  storedAnswers.hoeren.supermarkt = document.getElementById('hoeren_supermarkt').value.trim();
});
document.getElementById('hoeren_bhf_save')?.addEventListener('click', () => {
  storedAnswers.hoeren.bahnhof = document.getElementById('hoeren_bahnhof').value.trim();
});
document.getElementById('hoeren_af_save')?.addEventListener('click', () => {
  storedAnswers.hoeren.arbeit = document.getElementById('hoeren_arbeitfreizeit').value.trim();
});

/* ===== SCHREIBEN ===== */
document.getElementById('schreiben-save')?.addEventListener('click', () => {
  storedAnswers.schreiben.text = document.getElementById('schreiben_text').value.trim();
});

/* ===== CALCUL DES SCORES ===== */
function calculateResults() {
  let lesen = 0, hoeren = 0, schreiben = 0;

  // LESEN (6 questions = 30 points)
  if (storedAnswers.lesen.q1 === "fahrrad") lesen += 5;
  if (storedAnswers.lesen.q2 === "cafe") lesen += 5;
  if (storedAnswers.lesen.q3 === "berge") lesen += 5;
  if ((storedAnswers.lesen.q4 || "").toLowerCase().includes("lesen") || 
      (storedAnswers.lesen.q4 || "").toLowerCase().includes("gärtnern")) lesen += 5;
  if (storedAnswers.lesen.q5 === "falsch") lesen += 5;
  if ((storedAnswers.lesen.q6 || "").toLowerCase().includes("haus")) lesen += 5;

  // HÖREN (3 parties = 30 points)
  if ((storedAnswers.hoeren.supermarkt || "").length > 5) hoeren += 10;
  if ((storedAnswers.hoeren.bahnhof || "").length > 5) hoeren += 10;
  if ((storedAnswers.hoeren.arbeit || "").length > 5) hoeren += 10;

  // 🚫 L'ancien calcul Schreiben est supprimé
  // 🔥 NOTE Schreiben sera calculée dans le serveur Node.js
  schreiben = 0;


  return { lesen, hoeren, schreiben, total: lesen + hoeren + schreiben };
}

/* ===== AFFICHAGE & CERTIFICAT ===== */
document.getElementById("submit-all")?.addEventListener("click", async () => {

  // Envoi au serveur pour obtenir le vrai score B1
  const name = localStorage.getItem("candidateName") || "Kandidat";
  const payload = {
    name,
    lesen: calculateResults().lesen,
    hoeren: calculateResults().hoeren,
    schreiben_text: storedAnswers.schreiben.text || ""
  };

  const response = await fetch("https://modelltest-b1-production.up.railway.app/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  // Le serveur renvoie : schreiben et total
  const schreiben = data.schreiben;
  const total = data.total;

  // affichage
  const box = document.getElementById("submit-msg");
  box.innerHTML = `
    <div class="result-box">
      <h3>📊 Endergebnis</h3>

      <div class="scores-row">
        <div>📖 Lesen: <strong>${payload.lesen}/30</strong></div>
        <div>🎧 Hören: <strong>${payload.hoeren}/30</strong></div>
        <div>✍️ Schreiben: <strong>${schreiben}/40</strong></div>
      </div>

      <hr>
      <h4>Gesamtpunktzahl: <strong>${total}/100</strong></h4>

      <div class="progress-wrap">
        <div class="progress-bar" id="progress-bar" style="width:0%"></div>
      </div>

      <p class="${total >= 60 ? "success" : "fail"}">
        ${total >= 60 
          ? "🎉 Herzlichen Glückwunsch! Sie haben bestanden. Zertifikat wird erstellt..." 
          : "❌ Leider nicht bestanden."}
      </p>
    </div>
  `;

  setTimeout(() => { 
    document.getElementById("progress-bar").style.width = total + "%"; 
  }, 200);

  if (total >= 60) {
    setTimeout(() => generateCertificate(name, total), 1200);
  }
});



/* ===== RESET TEST ===== */
document.getElementById("restart-test")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "start.html";
});

/* ===== CERTIFICAT PDF ===== */
function generateCertificate(name, score) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "A4"
  });

  // Charger l'image du drapeau
  const flag = new Image();
  flag.src = "images/de_flag.png";

  flag.onload = () => {

    // Ajouter l'image en fond (pleine page, avec transparence)
    doc.addImage(flag, "PNG", 0, 0, 297, 210);
    doc.setFillColor(255,255,255);
    doc.setDrawColor(255,255,255);
    doc.rect(0, 0, 297, 210, "F"); // légère couche blanche transparente
    doc.setTextColor(0,0,0);

    // Titre
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(21, 101, 192);
    doc.text("ZERTIFIKAT", 148, 40, { align: "center" });

    // Sous-Titre
    doc.setFontSize(18);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(0,0,0);
    doc.text("Deutsch Modelltest B1", 148, 55, { align: "center" });

    // Nom du candidat
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.text(name, 148, 95, { align: "center" });

    // Score
    doc.setFontSize(20);
    doc.text(`Gesamtpunktzahl: ${score}/100`, 148, 118, { align: "center" });

    // Mention réussite
    doc.setFontSize(17);
    doc.text("Der Kandidat hat den Modelltest erfolgreich bestanden.", 148, 140, { align: "center" });

    // Signature
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(16);
    doc.text("Chaymae – Prüfungskommission", 148, 175, { align: "center" });

    // Télécharger
    doc.save(`Zertifikat_${name.replace(" ","_")}.pdf`);
  };
}


/* ===== CLAVIER ALLEMAND ===== */
document.querySelectorAll(".german-keyboard button").forEach(btn => {
  btn.addEventListener("click", () => {
    const textarea = document.getElementById("schreiben_text");
    textarea.value += btn.dataset.char;
    textarea.focus();
  });
});
