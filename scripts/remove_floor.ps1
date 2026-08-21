$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class FloorRemover {
    public static void RemoveBottomFloor(string path, int startY) {
        using (Bitmap bmp = new Bitmap(path)) {
            for (int y = startY; y < bmp.Height; y++) {
                for (int x = 0; x < bmp.Width; x++) {
                    Color c = bmp.GetPixel(x, y);
                    // If it's a solid black or dark grey pixel near bottom not connected to paws
                    if (c.A > 0 && c.R <= 45 && c.G <= 45 && c.B <= 45) {
                        bmp.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                    }
                }
            }
            string tmp = path + ".tmp.png";
            bmp.Save(tmp, ImageFormat.Png);
        }
        string tmp2 = path + ".tmp.png";
        System.IO.File.Delete(path);
        System.IO.File.Move(tmp2, path);
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing
[FloorRemover]::RemoveBottomFloor("C:\projectvc\learningjemz\public\images\characters\fox-pixel.png", 830)
[FloorRemover]::RemoveBottomFloor("C:\projectvc\learningjemz\public\images\characters\bot-pixel.png", 850)
Write-Host "Removed floor lines."
