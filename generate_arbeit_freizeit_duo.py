# generate_arbeit_freizeit_duo.py
from gtts import gTTS
from pydub import AudioSegment
import os

# <-- METS ICI LES CHEMINS EXACTS VUS AVEC `where ffmpeg` / `where ffprobe` -->
FFMPEG_PATH = r"C:\ffmpeg\ffmpeg-6.1.1-essentials_build\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\ffmpeg\ffmpeg-6.1.1-essentials_build\bin\ffprobe.exe"

# Indiquer explicitement à pydub où sont les binaires
AudioSegment.converter = FFMPEG_PATH
AudioSegment.ffprobe = FFPROBE_PATH

os.makedirs("audio", exist_ok=True)

dialog = [
    ("Anna", "Hallo Markus! Du siehst heute müde aus. Hattest du eine lange Nacht?"),
    ("Markus", "Ja, ein bisschen. Ich musste gestern bis spät im Büro bleiben, weil wir ein neues Projekt begonnen haben."),
    ("Anna", "Oh je, das klingt stressig. Hast du überhaupt Zeit für dich?"),
    ("Markus", "Im Moment kaum. Ich versuche, am Wochenende mehr zu entspannen, aber es ist nicht immer einfach."),
    ("Anna", "Das kenne ich! Ich arbeite oft zu viel und vergesse, Pausen zu machen."),
    ("Markus", "Genau. Man sollte wirklich auf seine Gesundheit achten. Was machst du in deiner Freizeit zum Abschalten?"),
    ("Anna", "Ich gehe joggen oder treffe Freunde im Park. Und du?"),
    ("Markus", "Ich spiele gern Gitarre oder koche etwas Leckeres. Das hilft mir, den Kopf frei zu bekommen."),
    ("Anna", "Das klingt gut! Wir sollten mal zusammen etwas machen — vielleicht am Samstag?"),
    ("Markus", "Gute Idee! Dann reden wir aber nicht über die Arbeit!"),
    ("Anna", "Versprochen!")
]

segments = []
for i, (speaker, text) in enumerate(dialog):
    tts = gTTS(text=text, lang="de", slow=False)
    tmp = f"audio/temp_{i}.mp3"
    tts.save(tmp)
    seg = AudioSegment.from_file(tmp)   # maintenant pydub sait où est ffmpeg/ffprobe
    # légère variation de volume pour simuler deux voix
    if speaker == "Anna":
        seg = seg + 2
    else:
        seg = seg - 1
    segments.append(seg + AudioSegment.silent(duration=500))

final = AudioSegment.empty()
for s in segments:
    final += s

out = "audio/arbeit_freizeit_duo.mp3"
final.export(out, format="mp3")

# supprimer les fichiers temporaires
for i in range(len(dialog)):
    try:
        os.remove(f"audio/temp_{i}.mp3")
    except:
        pass

print(f"✅ '{out}' wurde erstellt.")
