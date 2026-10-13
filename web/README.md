# Starfall browser prototype

Copy `Starfall_Interceptor.glb` into `web/assets/`, then serve this folder over HTTP (modules and GLB loading are blocked by browser security when opened directly).

If Python is installed, run:

```powershell
py -m http.server 8000
```

Open http://localhost:8000 and click the game to capture the mouse.

If Python is not installed, run the included PowerShell server instead:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
