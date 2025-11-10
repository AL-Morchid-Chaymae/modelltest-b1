from gtts import gTTS
text = (
    "Verkäufer: Guten Tag! Kann ich Ihnen helfen?\n"
    "Kundin: Ja, bitte. Ich suche die H-Milch und die frischen Tomaten. "
    "Sind die Tomaten vielleicht im Angebot?\n"
    "Verkäufer: Die Tomaten sind im Regal links neben dem Brot. "
    "Die H-Milch finden Sie im Kühlregal. Sie kosten drei Euro fünfzig.\n"
    "Kundin: Danke! Können Sie mir bitte auch das Datum auf der Packung zeigen?\n"
    "Verkäufer: Natürlich, hier ist das Haltbarkeitsdatum."
)
tts = gTTS(text=text, lang='de')
tts.save("audio/supermarkt.mp3")
print("supermarkt.mp3 erstellt.")
