$root = (Resolve-Path (Join-Path $PSScriptRoot '.')).Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
Write-Host "Starfall running at http://localhost:8000/ (Ctrl+C to stop)"
try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
    $file = Join-Path $root $relative
    if ((Test-Path -LiteralPath $file -PathType Leaf) -and ((Resolve-Path -LiteralPath $file).Path.StartsWith($root))) {
      $bytes = [IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $file).Path)
      $context.Response.ContentType = switch ([IO.Path]::GetExtension($file).ToLowerInvariant()) { '.html' {'text/html'} '.js' {'text/javascript'} '.css' {'text/css'} '.glb' {'model/gltf-binary'} default {'application/octet-stream'} }
      $context.Response.ContentLength64 = $bytes.Length
      if ($context.Request.HttpMethod -ne 'HEAD') {
        try { $context.Response.OutputStream.Write($bytes, 0, $bytes.Length) } catch { Write-Host "Write failed: $relative" }
      }
    } else { $context.Response.StatusCode = 404 }
    try { $context.Response.Close() } catch {}
  }
} finally { $listener.Stop() }
