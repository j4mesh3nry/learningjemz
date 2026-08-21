$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class LineCleaner {
    public static void CleanBottom(string imagePath, int cutoffRows) {
        using (Bitmap bmp = new Bitmap(imagePath)) {
            // Check bottom rows and if row has dark horizontal bar, make transparent
            for (int y = bmp.Height - cutoffRows; y < bmp.Height; y++) {
                for (int x = 0; x < bmp.Width; x++) {
                    Color c = bmp.GetPixel(x, y);
                    if (c.R <= 35 && c.G <= 35 && c.B <= 35) {
                        bmp.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                    }
                }
            }
            bmp.Save(imagePath + ".clean.png", ImageFormat.Png);
        }
        System.IO.File.Delete(imagePath);
        System.IO.File.Move(imagePath + ".clean.png", imagePath);
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing
[LineCleaner]::CleanBottom("C:\projectvc\learningjemz\public\images\characters\bot-pixel.png", 85)
[LineCleaner]::CleanBottom("C:\projectvc\learningjemz\public\images\characters\fox-pixel.png", 85)
Write-Host "Cleaned bottom lines on bot and fox sprites."
