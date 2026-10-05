# Regenerate the deterministic social card on Windows. No runtime dependency.
Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$cream = [System.Drawing.ColorTranslator]::FromHtml('#f7f6f0')
$navyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#17332f'))
$tealBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#236c5e'))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#60716b'))
$mintBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#dbece3'))
$graphics.Clear($cream)
$fontBrand = New-Object System.Drawing.Font('Malgun Gothic', 23, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font('Malgun Gothic', 62, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font('Malgun Gothic', 22)
$fontSmall = New-Object System.Drawing.Font('Malgun Gothic', 16)
$graphics.FillEllipse($mintBrush, 900, -120, 430, 430)
$graphics.FillEllipse($mintBrush, 960, 440, 250, 250)
$graphics.DrawString('머니마라톤', $fontBrand, $navyBrush, 78, 57)
$graphics.DrawString('무료 목표기간 계산기', $fontSmall, $mutedBrush, 82, 124)
$graphics.DrawString('1억까지 몇 년?', $fontTitle, $navyBrush, 70, 205)
$graphics.DrawString('나의 속도로, 나의 목표까지.', $fontSub, $tealBrush, 81, 342)
$graphics.DrawString('현재 모은 돈 + 매달 모으는 돈 → 나의 도착 시간', $fontSmall, $mutedBrush, 82, 409)
$graphics.DrawString('회원가입 없이 · 브라우저에서 안전하게 · 무료로 바로 계산', $fontSmall, $mutedBrush, 82, 535)
$routePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#b8d2c1'), 12)
$points = [System.Drawing.PointF[]]@((New-Object System.Drawing.PointF(860,450)), (New-Object System.Drawing.PointF(940,450)), (New-Object System.Drawing.PointF(910,330)), (New-Object System.Drawing.PointF(1070,350)))
$graphics.DrawBezier($routePen, $points[0], $points[1], $points[2], $points[3])
$graphics.FillEllipse($tealBrush, 851, 441, 18, 18)
$flagPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#236c5e'), 5)
$graphics.DrawLine($flagPen, 1070, 350, 1070, 280)
$flagPoints = [System.Drawing.Point[]]@((New-Object System.Drawing.Point(1070,280)), (New-Object System.Drawing.Point(1120,290)), (New-Object System.Drawing.Point(1070,308)))
$graphics.FillPolygon($tealBrush, $flagPoints)
$output = Join-Path (Split-Path $PSScriptRoot -Parent) 'public/og-image.png'
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
foreach ($resource in @($graphics, $bitmap, $navyBrush, $tealBrush, $mutedBrush, $mintBrush, $fontBrand, $fontTitle, $fontSub, $fontSmall, $routePen, $flagPen)) { $resource.Dispose() }
Write-Output "Generated 1200x630 OG image: $output"

