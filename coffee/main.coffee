

class Main
  constructor: () ->
    @mouseStatus = 0
    @currentTool = -1
    @canvas = $('#main-canvas')
    @bcanvas = $('#buf-canvas')
    @detectDiv = $('#detect-div')
    @ctx = @canvas[0].getContext('2d')
    @bctx = @bcanvas[0].getContext('2d')
    @tools = []
    @width = @canvas.width()
    @height = @canvas.height()
    @BufDis = 50

  mouseDown: () ->
    @mouseStatus = 1

  mouseUp: () ->
    @mouseStatus = 0

  init: () ->
    can = @canvas[0]
    can.width = @ctx.width = @canvas.width()
    can.height = @ctx.height = @canvas.height()
    can.onselectstart = () -> false

    can = @bcanvas[0]
    can.width = @bctx.width = @bcanvas.width()
    can.height = @bctx.height = @bcanvas.height()
    can.onselectstart = () -> false

    toolDiv = $('#toolbox-wrapper')
    @tools.forEach (tool, idx) ->
      img = $('<img>').attr('src', 'img/' + tool.iconImg).addClass('tool-img')
      wrapDiv = $('<div>')
        .addClass('tool-icon')
        .append(img)
        .click ()->
          main.changeCurrentTool idx

      toolDiv.append(wrapDiv)

    @ctx.fillStyle = 'white'
    @ctx.fillRect 0, 0, @canvas.width(), @canvas.height()

    @bctx.clearAll = () ->
      @clearRect 0, 0, @width, @height

    @detectDiv.mousedown @onMouseDown
    @detectDiv.mousemove @onMouseMove
    @detectDiv.mouseup @onMouseUp

  changeCurrentTool: (idx) ->
    return if idx == @currentTool
    toolDiv = $('#toolbox-wrapper')
    toolDiv.children().removeClass 'active'
    toolDiv.children().eq(idx).addClass 'active'
    topDiv = $('#top-wrapper')
    topDiv.empty()
    @tools[idx].controlVals.forEach (ctr) ->
      ctr.render(topDiv)
    @currentTool = idx

  onMouseDown: (e) =>
    console.log "zz"
    @mouseDown()
    console.log @currentTool
    if @currentTool != -1
      @tools[@currentTool].onMouseDown(e.offsetX - @BufDis, e.offsetY - @BufDis, @ctx, @bctx)
      return

  onMouseUp: (e) =>
    @mouseUp()
    if @currentTool != -1
      @tools[@currentTool].onMouseUp(e.offsetX - @BufDis, e.offsetY - @BufDis, @ctx, @bctx)
      return
    
      
  onMouseMove: (e) =>
    [x, y] = [e.offsetX - @BufDis, e.offsetY - @BufDis]

    if @currentTool != -1
      @tools[@currentTool].onMouseMove(x, y, @ctx, @bctx, @mouseStatus)

    if x < 0 or x >= @width or y < 0 or y >= @height
      @mouseUp()

    return
    

class Tools
  constructor: (o) ->
    _.extend @, o
    return

  getVal: (i) ->
    return @controlVals[i].val()

class ColorInput
  constructor: (o) ->
    _.extend @, o
    return

  render: (par) ->
    textSpan = $('<span> ' + @text + ' </span>').addClass('option-text-span')
    colorInput = $('<input type="text" id="color1"/>')
    wrapDiv = $('<div>').addClass('option-wrapper')
    wrapDiv.append(textSpan).append(colorInput)
    par.append(wrapDiv)
    colorInput.spectrum
      clickoutFiresChange: true
      showPalette: true
      #hideAfterPaletteSelect:true
      palette: [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
      ]
      showAlpha: true
    @spec = colorInput
    return
    

  val: () ->
    console.log @spec.spectrum('get').toRgbString()
    @spec.spectrum('get')

class RangeInput
  constructor: (o) ->
    _.extend @, o
    return

  render: (par) ->
    textSpan = $('<span> ' + @text + ' </span>').addClass('option-text-span')
    rangeInput = $('<input type="range" id="range2" min="0" max="100" value="3"/>')
    wrapDiv = $('<div>').addClass('option-wrapper')
    wrapDiv.append(textSpan).append(rangeInput)
    par.append(wrapDiv)
    @inp = rangeInput
    return
    

  val: () ->
    @inp.val()

pencilTool = new Tools
  controlVals: [
    new ColorInput( text: 'Draw color:' ),
    new RangeInput( text: 'Draw width:' ),
  ]
  onMouseDown: (x, y, ctx) ->
    color = @controlVals[0].val()
    ctx.beginPath()
    ctx.strokeStyle = color.toRgbString()
    ctx.lineJoin = ctx.lineCap = 'round'
    ctx.lineWidth = @controlVals[1].val()
    ctx.moveTo x, y

  onMouseMove: (x, y, ctx, bctx, status) ->
    console.log status
    return if status == 0
    console.log x, y
    ctx.lineTo x, y
    ctx.stroke()

  onMouseUp: (x, y, ctx, status) ->
    return

  iconImg: 'pencil-icon.svg'

paintTool = new Tools
  controlVals: [
    new ColorInput( text: 'Fill color:' ),
  ]
  onMouseDown: (x, y, ctx) ->
    color = @controlVals[0].val().toRgb()
    rawData = ctx.getImageData(0, 0, ctx.width, ctx.height)

    width = ctx.width
    height = ctx.height

    getData = (x, y) ->
      o = (y*width + x)*4
      return [ rawData.data[o], rawData.data[o+1], rawData.data[o+2], rawData.data[o+3] ]

    putData = (x, y) ->
      o = (y*width + x)*4
      rawData.data[o] = color.r
      rawData.data[o+1] = color.g
      rawData.data[o+2] = color.b
      rawData.data[o+3] = color.a*255
      
    isEqual3 = (l1, l2) ->
      return (l1[0] == l2[0]) && (l1[1] == l2[1]) && (l1[2] == l2[2])

    inRange = (_x, _y) ->
      return _x >= 0 and _x < width and _y >= 0 and _y < height

    
    cur = getData x, y
    queue = [ [x, y] ]
    dir = [ [1, 0], [0, 1], [-1, 0], [0, -1] ]
    visited = {}
    visited[y*width+x] =  true

    while queue.length > 0

      np = queue.pop()
      [nx, ny] = [np[0], np[1]]
      putData nx, ny
      
      for d in dir
        [qx, qy] = [nx + d[0], ny + d[1]]
        continue if not inRange qx, qy
        if visited[ qy*width + qx ]
          continue
        visited[qy*width+qx] = true
        nex = getData qx, qy
        if isEqual3 nex, cur
          queue.unshift [qx, qy]


    ctx.putImageData rawData, 0, 0


  onMouseMove: (x, y, ctx, bctx, status) ->
    return

  onMouseUp: (x, y, ctx) ->
    return

  iconImg: 'paint-icon.png'

rectTool = new Tools
  controlVals: [
    new ColorInput( text: 'Border color:' )
    new ColorInput( text: 'Fill color:' )
    new RangeInput( text: 'Border width:' )
  ]
  onMouseDown: (x, y, ctx) ->
    @startx = x
    @starty = y
  onMouseMove: (x, y, ctx, bctx, st) ->
    return if st == 0
    @endx = x
    @endy = y
    bctx.clearRect 0, 0, bctx.width, bctx.height
    bctx.beginPath()
    bctx.strokeStyle = @getVal(0).toRgbString()
    bctx.fillStyle = @getVal(1).toRgbString()
    bctx.lineWidth = @getVal(2)
    bctx.rect(@startx, @starty, @endx - @startx, @endy - @starty)
    bctx.fill()
    bctx.stroke()
    
  onMouseUp: (x, y, ctx, bctx) ->
    ctx.beginPath()
    ctx.strokeStyle = @controlVals[0].val().toRgbString()
    ctx.fillStyle = @getVal(1).toRgbString()
    ctx.lineWidth = @getVal(2)
    ctx.rect(@startx, @starty, @endx - @startx, @endy - @starty)
    ctx.fill()
    ctx.stroke()
    bctx.clearRect 0, 0, bctx.width, bctx.height

  iconImg: 'rect-icon.png'

circleTool = new Tools
  controlVals: [
    new ColorInput( text: 'Border color:' )
    new ColorInput( text: 'Fill color:' )
    new RangeInput( text: 'Border width:' )
  ]
  drawEllipse: (x1, y1, x2, y2, ctx) ->
    [x1, x2] = [x2, x1] if x1 > x2
    [y1, y2] = [y2, y1] if y1 > y2
    centx = (x1 + x2) / 2
    centy = (y1 + y2) / 2
    lenx = (x2 - x1) / 2
    leny = (y2 - y1) / 2
    return [centx, centy, lenx, leny]

  onMouseDown: (x, y, ctx) ->
    @startx = x
    @starty = y

  onMouseMove: (x, y, ctx, bctx, st) ->
    return if st == 0
    @endx = x
    @endy = y
    bctx.clearAll()
    bctx.clearRect 0, 0, bctx.width, bctx.height
    bctx.beginPath()
    bctx.strokeStyle = @controlVals[0].val().toRgbString()
    bctx.fillStyle = @getVal(1).toRgbString()
    bctx.lineWidth = parseInt(@getVal(2))
    res = @drawEllipse(@startx, @starty, @endx, @endy, bctx)
    bctx.ellipse(res[0], res[1], res[2], res[3] ,0, 0, 2*Math.PI)
    bctx.fill()
    bctx.stroke()

  onMouseUp: (x, y, ctx, bctx) ->
    bctx.clearAll()
    ctx.beginPath()
    ctx.strokeStyle = @controlVals[0].val().toRgbString()
    ctx.fillStyle = @getVal(1).toRgbString()
    ctx.lineWidth = parseInt(@getVal(2))
    console.log ctx.lineWidth, @getVal(2)

    res = @drawEllipse(@startx, @starty, @endx, @endy, ctx)
    ctx.ellipse(res[0], res[1], res[2], res[3] ,0, 0, 2*Math.PI)
    
    ctx.fill()
    ctx.stroke()
    console.log "fill"
    ctx.beginPath()

    @drawEllipse(@startx+200, @starty+200, @endx, @endy, ctx)
    ctx.stroke()

  iconImg: 'circle-icon.png'

main = new Main()
main.tools = [
  pencilTool,
  paintTool,
  rectTool,
  circleTool,
]
main.init()




#handleMouseDown = (e) ->
  #color = $("#color1").spectrum("get").toRgbString()
  #console.log color
  #Mainctx.beginPath()
  #Mainctx.strokeStyle = color
  #Mainctx.lineWidth = $('#range2').val()
  #Mainctx.moveTo(e.offsetX, e.offsetY)
  #window.mouseStatus = 1
  #return

#handleMouseMove = (e) ->
  #console.log e.offsetX, e.offsetY
  #console.log mouseStatus
  #if mouseStatus == 1
    #Mainctx.lineTo e.offsetX, e.offsetY
    #console.log e.offsetX, e.offsetY
    #Mainctx.stroke()
  #return

#handleMouseUp = (e) ->
  #window.mouseStatus = 0
  #return


#handleDocumentReady = () ->
  #window.MainCanvas = $('#main-canvas')
  #window.Mainctx = MainCanvas[0].getContext "2d"
  #window.mouseStatus = 0
  #can = MainCanvas[0]
  #can.width = MainCanvas.width()
  #can.height = MainCanvas.height()
  #can.onselectstart = () -> false
  #$("#color1").spectrum()
  #MainCanvas.mousedown( handleMouseDown )
  #MainCanvas.mousemove( handleMouseMove )
  #MainCanvas.mouseup( handleMouseUp )
  #MainCanvas.mouseleave( handleMouseUp )
  #return

#$( handleDocumentReady )
