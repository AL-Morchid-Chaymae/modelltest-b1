from gtts import gTTS
text = (
    "Durchsage: Achtung, der Zug nach München fährt ab Gleis fünf. "
    "Der Zug hat heute eine Verspätung von zwanzig Minuten. "
    "Reisender: Entschuldigung, wissen Sie, ob der IC 123 auf Gleis 5 bleibt?\n"
    "Bahnhofspersonal: Ja, der Zug wird gleich einfahren. Die Abfahrt ist um 15 Uhr 40."
)
tts = gTTS(text=text, lang='de')
tts.save("audio/bahnhof.mp3")
print("bahnhof.mp3 erstellt.")
