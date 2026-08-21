$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class UniversalCutout {
    public static void Cutout(string inputPath, string outputPath, bool isWhiteBg, int threshold) {
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

                // Check background match
                Func<int, int, bool> isBg = (x, y) => {
                    int idx = (y * width + x) * 4;
                    byte b = srcBytes[idx];
                    byte g = srcBytes[idx + 1];
                    byte r = srcBytes[idx + 2];
                    if (isWhiteBg) {
                        return (r >= 255 - threshold && g >= 255 - threshold && b >= 255 - threshold);
                    } else {
                        return (r <= threshold && g <= threshold && b <= threshold);
                    }
                };

                // Seed borders
                for (int x = 0; x < width; x++) {
                    if (isBg(x, 0)) { queue.Enqueue(x | (0 << 16)); visited[x, 0] = true; }
                    if (isBg(x, height - 1)) { queue.Enqueue(x | ((height - 1) << 16)); visited[x, height - 1] = true; }
                }
                for (int y = 0; y < height; y++) {
                    if (!visited[0, y] && isBg(0, y)) { queue.Enqueue(0 | (y << 16)); visited[0, y] = true; }
                    if (!visited[width - 1, y] && isBg(width - 1, y)) { queue.Enqueue((width - 1) | (y << 16)); visited[width - 1, y] = true; }
                }

                int[] dx = new int[] { 0, 0, 1, -1, 1, -1, 1, -1 };
                int[] dy = new int[] { 1, -1, 0, 0, 1, -1, -1, 1 };

                while (queue.Count > 0) {
                    int packed = queue.Dequeue();
                    int cx = packed & 0xFFFF;
                    int cy = (packed >> 16) & 0xFFFF;

                    int idx = (cy * width + cx) * 4;
                    dstBytes[idx + 3] = 0; // Transparent

                    for (int d = 0; d < 8; d++) {
                        int nx = cx + dx[d];
                        int ny = cy + dy[d];

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            if (!visited[nx, ny]) {
                                visited[nx, ny] = true;
                                if (isBg(nx, ny)) {
                                    queue.Enqueue(nx | (ny << 16));
                                } else {
                                    // Feather edge
                                    int nidx = (ny * width + nx) * 4;
                                    byte nb = srcBytes[nidx];
                                    byte ng = srcBytes[nidx + 1];
                                    byte nr = srcBytes[nidx + 2];
                                    if (isWhiteBg) {
                                        int minVal = Math.Min(nr, Math.Min(ng, nb));
                                        if (minVal > 255 - threshold - 30) {
                                            int alpha = (255 - minVal) * 255 / (threshold + 30);
                                            dstBytes[nidx + 3] = (byte)Math.Max(0, Math.Min(255, alpha));
                                        }
                                    } else {
                                        int maxVal = Math.Max(nr, Math.Max(ng, nb));
                                        if (maxVal < threshold + 30) {
                                            int alpha = (maxVal - threshold) * 255 / 30;
                                            dstBytes[nidx + 3] = (byte)Math.Max(0, Math.Min(255, alpha));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Remove horizontal floor lines at bottom if any
                for (int y = (int)(height * 0.82); y < height; y++) {
                    for (int x = 0; x < width; x++) {
                        int idx = (y * width + x) * 4;
                        byte b = dstBytes[idx];
                        byte g = dstBytes[idx + 1];
                        byte r = dstBytes[idx + 2];
                        byte a = dstBytes[idx + 3];
                        if (a > 0 && r <= 45 && g <= 45 && b <= 45 && (x < width * 0.3 || x > width * 0.7)) {
                            dstBytes[idx + 3] = 0;
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

# 1. Process Pedestal (black background)
$pedestalInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_stone_pedestal_1787301408513.jpg"
$pedestalOutput = "C:\projectvc\learningjemz\public\images\characters\stone-pedestal-pixel.png"
[UniversalCutout]::Cutout($pedestalInput, $pedestalOutput, $false, 30)
Write-Host "Cutout Pedestal done"

# 2. Process Owl (black background)
$owlInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_owl_character_clean_1787301440170.jpg"
$owlOutput = "C:\projectvc\learningjemz\public\images\characters\owl-pixel.png"
[UniversalCutout]::Cutout($owlInput, $owlOutput, $false, 30)
Write-Host "Cutout Owl done"

# 3. Process Bot (WHITE background!)
$botInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_bot_character_clean_1787301479582.jpg"
$botOutput = "C:\projectvc\learningjemz\public\images\characters\bot-pixel.png"
[UniversalCutout]::Cutout($botInput, $botOutput, $true, 30)
Write-Host "Cutout Bot done"

# 4. Process Fox (WHITE background!)
$foxInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_fox_character_clean_1787301513242.jpg"
$foxOutput = "C:\projectvc\learningjemz\public\images\characters\fox-pixel.png"
[UniversalCutout]::Cutout($foxInput, $foxOutput, $true, 30)
Write-Host "Cutout Fox done"
