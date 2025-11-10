# generate_arbeit_freizeit.py
from gtts import gTTS
import os

# Texte du dialogue (niveau B1)
text = (
    "Anna: Hallo Markus! Du siehst heute müde aus. Hattest du eine lange Nacht? "
    "Markus: Ja, ein bisschen. Ich musste gestern bis spät im Büro bleiben, weil wir ein neues Projekt begonnen haben. "
    "Anna: Oh je, das klingt stressig. Hast du überhaupt Zeit für dich? "
    "Markus: Im Moment kaum. Ich versuche, am Wochenende mehr zu entspannen, aber es ist nicht immer einfach. "
    "Anna: Das kenne ich! Ich arbeite oft zu viel und vergesse, Pausen zu machen. "
    "Markus: Genau. Man sollte wirklich auf seine Gesundheit achten. Was machst du in deiner Freizeit zum Abschalten? "
    "Anna: Ich gehe joggen oder treffe Freunde im Park. Und du? "
    "Markus: Ich spiele gern Gitarre oder koche etwas Leckeres. Das hilft mir, den Kopf frei zu bekommen. "
    "Anna: Das klingt gut! Wir sollten mal zusammen etwas machen — vielleicht am Samstag? "
    "Markus: Gute Idee! Dann reden wir aber nicht über die Arbeit! "
    "Anna: Versprochen!"
)

# Créer le dossier audio s’il n’existe pas
os.makedirs("audio", exist_ok=True)

# Générer l’audio en allemand
tts = gTTS(text=text, lang="de")

# Sauvegarder le fichier MP3
out_path = os.path.join("audio", "arbeit_freizeit.mp3")
tts.save(out_path)
print(f"✅ '{out_path}' wurde erfolgreich erstellt.")
