import AppKit

let out = URL(fileURLWithPath: CommandLine.arguments[1])
let raw = URL(fileURLWithPath: CommandLine.arguments[2])
let outline = URL(fileURLWithPath: CommandLine.arguments[3])
let study = URL(fileURLWithPath: CommandLine.arguments[4])
let bedroomWide = URL(fileURLWithPath: CommandLine.arguments[5])
let bedroomDetail = URL(fileURLWithPath: CommandLine.arguments[6])
let W = 1080, H = 1350
let cream = NSColor(red: 0.97, green: 0.95, blue: 0.90, alpha: 1)
let gold = NSColor(red: 0.83, green: 0.69, blue: 0.45, alpha: 1)
let navy = NSColor(red: 0.04, green: 0.08, blue: 0.15, alpha: 1)

func font(_ name: String, _ size: CGFloat) -> NSFont { NSFont(name: name, size: size) ?? NSFont.systemFont(ofSize: size) }
func text(_ s: String, x: CGFloat, y: CGFloat, size: CGFloat, name: String, color: NSColor = cream, tracking: CGFloat = 0) {
    let a: [NSAttributedString.Key: Any] = [.font: font(name,size), .foregroundColor: color, .kern: tracking]
    NSAttributedString(string:s, attributes:a).draw(at:NSPoint(x:x,y:y))
}
func line(_ x1: CGFloat,_ y1: CGFloat,_ x2: CGFloat,_ y2: CGFloat, color: NSColor = cream, width: CGFloat = 1) {
    let p = NSBezierPath(); p.lineWidth = width; p.move(to:NSPoint(x:x1,y:y1)); p.line(to:NSPoint(x:x2,y:y2)); color.setStroke(); p.stroke()
}
func image(_ url: URL) {
    guard let im = NSImage(contentsOf:url), let cg = im.cgImage(forProposedRect:nil, context:nil, hints:nil) else { fatalError("Bad image \(url.path)") }
    let iw = CGFloat(cg.width), ih = CGFloat(cg.height)
    let scale = max(CGFloat(W)/iw, CGFloat(H)/ih)
    let sw = iw*scale, sh = ih*scale
    NSGraphicsContext.current!.cgContext.draw(cg,in:CGRect(x:(CGFloat(W)-sw)/2,y:(CGFloat(H)-sh)/2,width:sw,height:sh))
}
func gradient(_ rect: NSRect, from: NSColor, to: NSColor, angle: CGFloat) {
    NSGradient(starting:from,ending:to)!.draw(in:rect,angle:angle)
}
func overlayTop() { gradient(NSRect(x:0,y:930,width:W,height:420),from:.clear,to:NSColor(calibratedWhite:0,alpha:0.65),angle:90) }
func overlayBottom() { gradient(NSRect(x:0,y:0,width:W,height:560),from:NSColor(calibratedWhite:0,alpha:0.82),to:.clear,angle:90) }
func brand(_ index: Int, light: Bool = true) {
    let c = light ? cream : navy
    line(64,1264,1016,1264,color:c.withAlphaComponent(0.75))
    text("DMS",x:64,y:1280,size:25,name:"Didot",color:c,tracking:4)
    text("STUDIO",x:145,y:1280,size:17,name:"AvenirNext-Medium",color:c,tracking:5)
    text(String(format:"%02d / 05",index),x:915,y:1280,size:17,name:"AvenirNext-Medium",color:c,tracking:2)
}
func bottomLine(_ label: String) {
    line(64,104,1016,104,color:cream.withAlphaComponent(0.7))
    text(label,x:64,y:62,size:20,name:"AvenirNext-Medium",tracking:2)
}
func draw(_ number: Int, photo: URL) {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:W,pixelsHigh:H,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep:bitmap)
    NSGraphicsContext.current!.imageInterpolation = .high
    image(photo)
    switch number {
    case 1:
        overlayTop(); overlayBottom(); brand(number)
        text("THE EVAAN JOSHI PROJECT",x:68,y:424,size:22,name:"AvenirNext-DemiBold",color:gold,tracking:3)
        text("A space to",x:64,y:286,size:94,name:"Didot",tracking:-2)
        text("make his own.",x:64,y:185,size:94,name:"Didot",tracking:-2)
        bottomLine("A ROOM, FROM IDEA TO REALITY   →  SWIPE")
    case 2:
        overlayTop(); overlayBottom(); brand(number)
        text("01  /  THE STARTING POINT",x:64,y:1140,size:25,name:"AvenirNext-DemiBold",color:gold,tracking:2)
        text("Every room begins",x:64,y:317,size:79,name:"Didot",tracking:-1)
        text("with possibility.",x:64,y:219,size:79,name:"Didot",tracking:-1)
        line(64,159,1016,159,color:cream.withAlphaComponent(0.75))
        text("AI CONCEPT OF A BARE SHELL  ·  NOT AN ACTUAL BEFORE PHOTO",x:64,y:92,size:17,name:"AvenirNext-Medium",tracking:1)
    case 3:
        overlayTop(); overlayBottom(); brand(number)
        text("02  /  THE DESIGN VISION",x:64,y:1140,size:25,name:"AvenirNext-DemiBold",color:gold,tracking:2)
        text("Storage. Study. Space to play.",x:64,y:185,size:48,name:"Didot")
        bottomLine("CONCEPTUAL ARCHITECTURAL OUTLINE")
    case 4:
        overlayTop(); overlayBottom(); brand(number)
        text("03  /  BROUGHT TO LIFE",x:64,y:1140,size:25,name:"AvenirNext-DemiBold",color:gold,tracking:2)
        text("Made for the way",x:64,y:215,size:69,name:"Didot")
        text("Evaan lives.",x:64,y:130,size:75,name:"Didot")
        bottomLine("CUSTOM STUDY + INTEGRATED STORAGE")
    default:
        overlayTop(); overlayBottom(); brand(number)
        text("THE FINISHED ROOM",x:64,y:1140,size:25,name:"AvenirNext-DemiBold",color:gold,tracking:2)
        text("A little world of",x:64,y:290,size:75,name:"Didot")
        text("his own.",x:64,y:190,size:89,name:"Didot")
        bottomLine("EVAAN JOSHI  ·  A DMS STUDIO PROJECT")
    }
    NSGraphicsContext.current!.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    let result = out.appendingPathComponent(String(format:"%02d-carousel.jpg",number))
    try! bitmap.representation(using:.jpeg,properties:[.compressionFactor:0.94])!.write(to:result)
}
draw(1,photo:bedroomWide)
draw(2,photo:raw)
draw(3,photo:outline)
draw(4,photo:study)
draw(5,photo:bedroomDetail)
