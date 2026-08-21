Add-Type -AssemblyName System.Drawing
foreach ($name in @('owl-pixel.png', 'bot-pixel.png', 'fox-pixel.png', 'stone-pedestal-pixel.png')) {
    $path = "C:\projectvc\learningjemz\public\images\characters\" + $name
    $img = [System.Drawing.Image]::FromFile($path)
    Write-Host "$name : $($img.Width) x $($img.Height)"
    $img.Dispose()
}
