$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class ImageCutout {
    private static bool IsDark(byte[] srcBytes, int width, int x, int y, int darkThreshold) {
        int idx = (y * width + x) * 4;
        byte b = srcBytes[idx];
        byte g = srcBytes[idx + 1];
        byte r = srcBytes[idx + 2];
        return (r <= darkThreshold && g <= darkThreshold && b <= darkThreshold);
    }

    public static void Process(string inputPath, string outputPath, int darkThreshold, int featherRange) {
        using (Bitmap src = new Bitmap(inputPath)) {
            int width = src.Width;
            int height = src.Height;
            using (Bitmap dst = new Bitmap(width, height, PixelFormat.Format32bppArgb)) {
                Rectangle rect = new Rectangle(0, 0, width, height);
                BitmapData srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                BitmapData dstData = dst.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

                int bytes = srcData.Stride * height;
                byte[] srcBytes = new byte[bytes];
                byte[] dstBytes = new byte[bytes];

                Marshal.Copy(srcData.Scan0, srcBytes, 0, bytes);
                Array.Copy(srcBytes, dstBytes, bytes);

                bool[,] visited = new bool[width, height];
                Queue<int> queue = new Queue<int>();

                // Seed outer borders
                for (int x = 0; x < width; x++) {
                    if (IsDark(srcBytes, width, x, 0, darkThreshold)) { queue.Enqueue(x | (0 << 16)); visited[x, 0] = true; }
                    if (IsDark(srcBytes, width, x, height - 1, darkThreshold)) { queue.Enqueue(x | ((height - 1) << 16)); visited[x, height - 1] = true; }
                }
                for (int y = 0; y < height; y++) {
                    if (!visited[0, y] && IsDark(srcBytes, width, 0, y, darkThreshold)) { queue.Enqueue(0 | (y << 16)); visited[0, y] = true; }
                    if (!visited[width - 1, y] && IsDark(srcBytes, width, width - 1, y, darkThreshold)) { queue.Enqueue((width - 1) | (y << 16)); visited[width - 1, y] = true; }
                }

                int[] dx = new int[] { 0, 0, 1, -1 };
                int[] dy = new int[] { 1, -1, 0, 0 };

                while (queue.Count > 0) {
                    int packed = queue.Dequeue();
                    int cx = packed & 0xFFFF;
                    int cy = (packed >> 16) & 0xFFFF;

                    int idx = (cy * width + cx) * 4;
                    dstBytes[idx + 3] = 0; // Set outer background to fully transparent

                    for (int d = 0; d < 4; d++) {
                        int nx = cx + dx[d];
                        int ny = cy + dy[d];

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            if (!visited[nx, ny]) {
                                visited[nx, ny] = true;
                                if (IsDark(srcBytes, width, nx, ny, darkThreshold)) {
                                    queue.Enqueue(nx | (ny << 16));
                                } else {
                                    // Feather edge
                                    int nidx = (ny * width + nx) * 4;
                                    byte nb = srcBytes[nidx];
                                    byte ng = srcBytes[nidx + 1];
                                    byte nr = srcBytes[nidx + 2];
                                    int maxVal = Math.Max(nr, Math.Max(ng, nb));
                                    if (maxVal < darkThreshold + featherRange) {
                                        int alpha = (maxVal - darkThreshold) * 255 / featherRange;
                                        if (alpha < 0) alpha = 0;
                                        if (alpha > 255) alpha = 255;
                                        dstBytes[nidx + 3] = (byte)alpha;
                                    }
                                }
                            }
                        }
                    }
                }

                Marshal.Copy(dstBytes, 0, dstData.Scan0, bytes);
                src.UnlockBits(srcData);
                dst.UnlockBits(dstData);
                dst.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

# 1. Process Hero Companion Sprite
$heroInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_owl_hero_sprite_1787299559954.jpg"
$heroOutput = "C:\projectvc\learningjemz\public\images\characters\owl-pixel.png"
[ImageCutout]::Process($heroInput, $heroOutput, 25, 25)
Write-Host "Generated hero sprite: $heroOutput"

# 2. Process Profile Avatar Token
$avatarInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_owl_avatar_token_1787299591006.jpg"
$avatarOutput = "C:\projectvc\learningjemz\public\images\characters\owl-avatar-pixel.png"
[ImageCutout]::Process($avatarInput, $avatarOutput, 25, 25)
Write-Host "Generated avatar token: $avatarOutput"
