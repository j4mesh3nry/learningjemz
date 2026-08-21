$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class SpriteAutoCropper {
    public static void CropToContent(string path) {
        using (Bitmap src = new Bitmap(path)) {
            int minX = src.Width, maxX = -1;
            int minY = src.Height, maxY = -1;

            for (int y = 0; y < src.Height; y++) {
                for (int x = 0; x < src.Width; x++) {
                    Color c = src.GetPixel(x, y);
                    if (c.A > 20) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (maxX < minX || maxY < minY) {
                Console.WriteLine("No content in " + path);
                return;
            }

            int w = maxX - minX + 1;
            int h = maxY - minY + 1;

            using (Bitmap cropped = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(cropped)) {
                    g.DrawImage(src, new Rectangle(0, 0, w, h), new Rectangle(minX, minY, w, h), GraphicsUnit.Pixel);
                }
                string tmp = path + ".cropped.png";
                cropped.Save(tmp, ImageFormat.Png);
            }
        }
        string tmp2 = path + ".cropped.png";
        System.IO.File.Delete(path);
        System.IO.File.Move(tmp2, path);
        Console.WriteLine("Auto-cropped: " + path);
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing
[SpriteAutoCropper]::CropToContent("C:\projectvc\learningjemz\public\images\characters\owl-pixel.png")
[SpriteAutoCropper]::CropToContent("C:\projectvc\learningjemz\public\images\characters\bot-pixel.png")
[SpriteAutoCropper]::CropToContent("C:\projectvc\learningjemz\public\images\characters\fox-pixel.png")
[SpriteAutoCropper]::CropToContent("C:\projectvc\learningjemz\public\images\characters\stone-pedestal-pixel.png")
