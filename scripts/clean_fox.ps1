$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class CleanupFox {
    public static void Clean(string path) {
        using (Bitmap bmp = new Bitmap(path)) {
            for (int y = 840; y < bmp.Height; y++) {
                for (int x = 0; x < bmp.Width; x++) {
                    bmp.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                }
            }
            string tmp = path + ".c.png";
            bmp.Save(tmp, ImageFormat.Png);
        }
        string tmp2 = path + ".c.png";
        System.IO.File.Delete(path);
        System.IO.File.Move(tmp2, path);
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing
[CleanupFox]::Clean("C:\projectvc\learningjemz\public\images\characters\fox-pixel.png")
Write-Host "Cleaned fox sprite."
