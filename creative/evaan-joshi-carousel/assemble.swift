import AppKit

let root = URL(fileURLWithPath: CommandLine.arguments[1])
let raw = URL(fileURLWithPath: CommandLine.arguments[2])
let outline = URL(fileURLWithPath: CommandLine.arguments[3])
let real = URL(fileURLWithPath: CommandLine.arguments[4])
let width = 1080
let height = 1350

func font(_ name: String, _ size: CGFloat) -> NSFont { NSFont(name: name, size: size) ?? NSFont.systemFont(ofSize: size) }
func label(_ text: String, at x: CGFloat, y: CGFloat, size: CGFloat, color: NSColor, fontName: String, tracking: CGFloat = 0) {
    let style = NSMutableParagraphStyle()
    style.alignment = .left
    let attrs: [NSAttributedString.Key: Any] = [.font: font(fontName, size), .foregroundColor: color, .kern: tracking, .paragraphStyle: style]
    NSAttributedString(string: text, attributes: attrs).draw(at: NSPoint(x: x, y: y))
}
func background(_ url: URL) {
    guard let image = NSImage(contentsOf: url), let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { fatalError("Missing image: \(url.path)") }
    let iw = CGFloat(cg.width), ih = CGFloat(cg.height)
    let scale = max(CGFloat(width)/iw, CGFloat(height)/ih)
    let sw = iw*scale, sh = ih*scale
    let rect = NSRect(x: (CGFloat(width)-sw)/2, y: (CGFloat(height)-sh)/2, width: sw, height: sh)
    NSGraphicsContext.current!.cgContext.draw(cg, in: rect)
}
func shade(_ rect: NSRect, alpha: CGFloat) {
    NSColor(calibratedWhite: 0.04, alpha: alpha).setFill()
    rect.fill()
}
func save(_ url: URL, input: URL, stage: Int) {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    NSGraphicsContext.current!.imageInterpolation = .high
    background(input)
    if stage == 1 {
        shade(NSRect(x: 0, y: 1010, width: width, height: 340), alpha: 0.32)
        shade(NSRect(x: 0, y: 465, width: width, height: 360), alpha: 0.22)
        shade(NSRect(x: 0, y: 0, width: width, height: 150), alpha: 0.35)
        label("EVAAN JOSHI", at: 58, y: 1192, size: 44, color: .white, fontName: "AvenirNext-DemiBold", tracking: 1)
        label("A DMS STUDIO PROJECT", at: 60, y: 1148, size: 22, color: .white, fontName: "AvenirNext-Medium", tracking: 3)
        label("A room reimagined", at: 75, y: 668, size: 76, color: .white, fontName: "NewYorkItalic", tracking: -2)
        label("FROM SHELL TO SPACE", at: 81, y: 598, size: 37, color: NSColor(red: 0.93, green: 0.74, blue: 0.39, alpha: 1), fontName: "AvenirNext-Bold", tracking: 1)
        label("AI CONCEPT VISUALISATION  •  NOT AN ACTUAL BEFORE PHOTO", at: 58, y: 50, size: 16, color: .white, fontName: "AvenirNext-Medium", tracking: 0.7)
    } else if stage == 2 {
        shade(NSRect(x: 0, y: 1125, width: width, height: 225), alpha: 0.32)
        shade(NSRect(x: 0, y: 0, width: width, height: 130), alpha: 0.40)
        label("02  /  THE VISION", at: 58, y: 1220, size: 27, color: .white, fontName: "AvenirNext-DemiBold", tracking: 2)
        label("EVAAN JOSHI  ·  DMS STUDIO", at: 58, y: 54, size: 20, color: .white, fontName: "AvenirNext-Medium", tracking: 1)
    } else {
        shade(NSRect(x: 0, y: 0, width: width, height: 190), alpha: 0.43)
        label("03  /  THE REAL SPACE", at: 58, y: 111, size: 28, color: .white, fontName: "AvenirNext-DemiBold", tracking: 2)
        label("EVAAN JOSHI  ·  DMS STUDIO", at: 58, y: 63, size: 20, color: .white, fontName: "AvenirNext-Medium", tracking: 1)
    }
    NSGraphicsContext.current!.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.92])!
    try! data.write(to: url)
}

save(root.appendingPathComponent("01-raw.jpg"), input: raw, stage: 1)
save(root.appendingPathComponent("02-outline.jpg"), input: outline, stage: 2)
save(root.appendingPathComponent("03-real.jpg"), input: real, stage: 3)
