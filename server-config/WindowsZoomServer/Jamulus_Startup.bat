start C:\"Program Files (x86)"\VB\Voicemeeter\voicemeeterpro.exe -L"C:\Users\Administrator\Desktop\Voicemeeter-Config\JamulusToZoomServer.xml"

start C:\"Program Files"\Jamulus\Jamulus.exe --clientname ToZoom -i jamulus-inis/JamulusToZoom.ini -c %JAMULUS_MIXER_IP% -M
start C:\"Program Files"\Jamulus\Jamulus.exe --clientname FromZoom -i jamulus-inis/JamulusFromZoom.ini -c %JAMULUS_BAND_IP%
start C:\"Program Files (x86)"\Zoom\bin\Zoom.exe --url=https://us02web.zoom.us/j/%MEETING_ID%%MEETING_PASSWORD%
