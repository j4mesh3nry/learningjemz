$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class ImageCutout2 {
    private static bool MatchColor(byte[] srcBytes, int width, int x, int y, bool isWhiteBg, int threshold) {
        int idx = (y * width + x) * 4;
        byte b = srcBytes[idx];
        byte g = srcBytes[idx + 1];
        byte r = srcBytes[idx + 2];
        if (isWhiteBg) {
            return (r >= 255 - threshold && g >= 255 - threshold && b >= 255 - threshold);
        } else {
            return (r <= threshold && g <= threshold && b <= threshold);
        }
    }

    public static void Process(string inputPath, string outputPath, bool isWhiteBg, int threshold, int featherRange) {
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
                    if (MatchColor(srcBytes, width, x, 0, isWhiteBg, threshold)) { queue.Enqueue(x | (0 << 16)); visited[x, 0] = true; }
                    if (MatchColor(srcBytes, width, x, height - 1, isWhiteBg, threshold)) { queue.Enqueue(x | ((height - 1) << 16)); visited[x, height - 1] = true; }
                }
                for (int y = 0; y < height; y++) {
                    if (!visited[0, y] && MatchColor(srcBytes, width, 0, y, isWhiteBg, threshold)) { queue.Enqueue(0 | (y << 16)); visited[0, y] = true; }
                    if (!visited[width - 1, y] && MatchColor(srcBytes, width, width - 1, y, isWhiteBg, threshold)) { queue.Enqueue((width - 1) | (y << 16)); visited[width - 1, y] = true; }
                }

                int[] dx = new int[] { 0, 0, 1, -1 };
                int[] dy = new int[] { 1, -1, 0, 0 };

                while (queue.Count > 0) {
                    int packed = queue.Dequeue();
                    int cx = packed & 0xFFFF;
                    int cy = (packed >> 16) & 0xFFFF;

                    int idx = (cy * width + cx) * 4;
                    dstBytes[idx + 3] = 0; // Transparent

                    for (int d = 0; d < 4; d++) {
                        int nx = cx + dx[d];
                        int ny = cy + dy[d];

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            if (!visited[nx, ny]) {
                                visited[nx, ny] = true;
                                if (MatchColor(srcBytes, width, nx, ny, isWhiteBg, threshold)) {
                                    queue.Enqueue(nx | (ny << 16));
                                } else if (featherRange > 0) {
                                    int nidx = (ny * width + nx) * 4;
                                    byte nb = srcBytes[nidx];
                                    byte ng = srcBytes[nidx + 1];
                                    byte nr = srcBytes[nidx + 2];
                                    if (isWhiteBg) {
                                        int minVal = Math.Min(nr, Math.Min(ng, nb));
                                        if (minVal > 255 - threshold - featherRange) {
                                            int alpha = (255 - minVal) * 255 / (threshold + featherRange);
                                            dstBytes[nidx + 3] = (byte)Math.Max(0, Math.Min(255, alpha));
                                        }
                                    } else {
                                        int maxVal = Math.Max(nr, Math.Max(ng, nb));
                                        if (maxVal < threshold + featherRange) {
                                            int alpha = (maxVal - threshold) * 255 / featherRange;
                                            dstBytes[nidx + 3] = (byte)Math.Max(0, Math.Min(255, alpha));
                                        }
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

# 1. Process Fixed Stone Pedestal
$pedestalInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_stone_pedestal_1787301408513.jpg"
$pedestalOutput = "C:\projectvc\learningjemz\public\images\characters\stone-pedestal-pixel.png"
[ImageCutout2]::Process($pedestalInput, $pedestalOutput, $false, 25, 20)
Write-Host "Generated stone pedestal: $pedestalOutput"

# 2. Process Clean Owl Sprite
$owlInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_owl_character_clean_1787301440170.jpg"
$owlOutput = "C:\projectvc\learningjemz\public\images\characters\owl-pixel.png"
[ImageCutout2]::Process($owlInput, $owlOutput, $false, 25, 20)
Write-Host "Generated clean owl: $owlOutput"

# 3. Process Clean Bot Sprite
$botInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_bot_character_clean_1787301479582.jpg"
$botOutput = "C:\projectvc\learningjemz\public\images\characters\bot-pixel.png"
[ImageCutout2]::Process($botInput, $botOutput, $false, 25, 20)
Write-Host "Generated clean bot: $botOutput"

# 4. Process Clean Fox Sprite
$foxInput = "C:\Users\user\.gemini\antigravity-ide\brain\ea48cdee-e704-4675-be54-c8b6bbafacf5\pixel_fox_character_clean_1787301513242.jpg"
$foxOutput = "C:\projectvc\learningjemz\public\images\characters\fox-pixel.png"
[ImageCutout2]::Process($foxInput, $foxOutput, $true, 25, 20)
Write-Host "Generated clean fox: $foxOutput"
