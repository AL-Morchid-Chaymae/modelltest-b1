from gtts import gTTS

# Texte B1 en allemand (dialogue simple)
text = """
Anna: Hallo Tom! Wie war dein Wochenende?
Tom: Hallo Anna! Mein Wochenende war super. Ich war mit meinen Freunden im Park.
Anna: Das klingt schön. Was habt ihr gemacht?
Tom: Wir haben gegrillt und Fußball gespielt. Und du?
Anna: Ich habe meine Familie besucht. Wir haben zusammen gekocht und einen Film gesehen.
"""

# Création de l’audio
tts = gTTS(text=text, lang='de')

# Sauvegarde du fichier MP3
tts.save("audio/situation.mp3")

print("✅ L’audio situation.mp3 a été généré avec succès !")
