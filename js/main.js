// Generated by CoffeeScript 1.9.0
var ColorInput, Layer, Main, MountPoint, PencilTool, RangeInput, RectSelectTool, ShapeTools, Tools, UndoOp, circleTool, downloadTool, lineTool, main, paintTool, rectTool, sprayTool, undoTool,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

Math.random2DNormal = function(c) {
  var r, theta;
  if (c == null) {
    c = 1;
  }
  r = Math.sqrt(-2.0 * Math.log(Math.random()));
  theta = Math.random() * 2.0 * Math.PI;
  return [c * r * Math.cos(theta), c * r * Math.sin(theta)];
};

Math.euclidDistance = function(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

Main = (function() {
  function Main() {
    this.onMouseMove = __bind(this.onMouseMove, this);
    this.onMouseUp = __bind(this.onMouseUp, this);
    this.onMouseDown = __bind(this.onMouseDown, this);
    this.upLayer = __bind(this.upLayer, this);
    this.downLayer = __bind(this.downLayer, this);
    this.removeLayer = __bind(this.removeLayer, this);
    this.addLayer = __bind(this.addLayer, this);
    this.changeCurrentLayer = __bind(this.changeCurrentLayer, this);
    this.mouseStatus = 0;
    this.currentTool = -1;
    this.detectDiv = $('#detect-div');
    this.tools = [];
    this.buttons = [];
    this.BufDis = 50;
    this.undoList = [];
    this.layers = [];
    this.activeLayerIdx = 0;
    this.width = 800;
    this.height = 600;
  }

  Main.prototype.mouseDown = function() {
    return this.mouseStatus = 1;
  };

  Main.prototype.mouseUp = function() {
    return this.mouseStatus = 0;
  };

  Main.prototype.init = function() {
    var toolDiv;
    this.layers = [new Layer()];
    this.layers[0].render(0, 0);
    this.layers[0].addActive();
    this.depthArr = [this.layers[0]];
    toolDiv = $('#toolbox-wrapper');
    this.tools.forEach(function(tool, idx) {
      return tool.render(toolDiv, idx);
    });
    CanvasRenderingContext2D.prototype.clearAll = function() {
      return this.clearRect(0, 0, this.width, this.height);
    };
    CanvasRenderingContext2D.prototype.circle = function(x, y, r) {
      return this.arc(x, y, r, 0, 2.0 * Math.PI);
    };
    CanvasRenderingContext2D.prototype.drawMountCircle = function(x, y) {
      this.beginPath();
      this.strokeStyle = '#00FFFF';
      this.lineWidth = 4;
      this.arc(x, y, 4, 0, 2.0 * Math.PI);
      return this.stroke();
    };
    CanvasRenderingContext2D.prototype.setPixel = function(x, y, color) {
      var idt;
      idt = this.createImageData(1, 1);
      if (color instanceof String) {
        idt.data[0] = color[0];
        idt.data[1] = color[1];
        idt.data[2] = color[2];
        idt.data[3] = color[3];
      } else {
        idt.data[0] = color.r;
        idt.data[1] = color.g;
        idt.data[2] = color.b;
        idt.data[3] = color.a * 255;
      }
      this.putImageData(idt, x, y);
    };
    this.detectDiv.mousedown(this.onMouseDown);
    this.detectDiv.mousemove(this.onMouseMove);
    this.detectDiv.mouseup(this.onMouseUp);
    $('#layer-add-icon').click(this.addLayer);
    $('#layer-remove-icon').click(this.removeLayer);
    $('#layer-up-icon').click(this.upLayer);
    return $('#layer-down-icon').click(this.downLayer);
  };

  Main.prototype.changeCurrentTool = function(idx) {
    var toolDiv, topDiv;
    this.endCurrentTool();
    if (idx === this.currentTool) {
      return;
    }
    this.curLayer().ctx.restore();
    this.curLayer().bctx.restore();
    this.curLayer().ctx.save();
    this.curLayer().bctx.save();
    toolDiv = $('#toolbox-wrapper');
    toolDiv.children().removeClass('active');
    toolDiv.children().eq(idx).addClass('active');
    topDiv = $('#top-wrapper');
    topDiv.empty();
    this.tools[idx].controlVals.forEach(function(ctr) {
      return ctr.render(topDiv);
    });
    this.currentTool = idx;
    if (this.tools[idx].onLoad != null) {
      return this.tools[idx].onLoad();
    }
  };

  Main.prototype.changeCurrentLayer = function(idx) {
    if (idx === this.activeLayerIdx) {
      return;
    }
    this.endCurrentTool();
    this.curLayer().removeActive();
    this.layers[idx].addActive();
    return this.activeLayerIdx = idx;
  };

  Main.prototype.endCurrentTool = function() {
    if (this.currentTool >= 0 && (this.tools[this.currentTool].onEnd != null)) {
      return this.tools[this.currentTool].onEnd(this.curLayer());
    }
  };

  Main.prototype.addLayer = function() {
    var idx, nl, z;
    z = this.layers.length;
    idx = this.layers.length;
    nl = new Layer();
    this.layers.push(nl);
    this.depthArr.push(nl);
    return nl.render(idx, z);
  };

  Main.prototype.removeLayer = function() {
    var cid, i, _i, _ref;
    if (this.depthArr.length <= 1) {
      return;
    }
    cid = this.curLayerZ();
    this.depthArr[cid].destruct();
    for (i = _i = cid, _ref = this.depthArr.length - 1; cid <= _ref ? _i <= _ref : _i >= _ref; i = cid <= _ref ? ++_i : --_i) {
      this.depthArr[i] = this.depthArr[i + 1];
      this.depthArr[i].setZ(i);
    }
    return this.depthArr.pop();
  };

  Main.prototype.downLayer = function() {
    var cid, _ref;
    cid = this.curLayerZ();
    if (cid <= 0) {
      return;
    }
    Layer.swap(this.depthArr[cid - 1], this.depthArr[cid]);
    return _ref = [this.depthArr[cid], this.depthArr[cid - 1]], this.depthArr[cid - 1] = _ref[0], this.depthArr[cid] = _ref[1], _ref;
  };

  Main.prototype.upLayer = function() {
    var cid, _ref;
    cid = this.curLayerZ();
    if (cid >= this.depthArr.length - 1) {
      return;
    }
    Layer.swap(this.depthArr[cid], this.depthArr[cid + 1]);
    return _ref = [this.depthArr[cid + 1], this.depthArr[cid]], this.depthArr[cid] = _ref[0], this.depthArr[cid + 1] = _ref[1], _ref;
  };

  Main.prototype.wholeCanvas = function() {
    var can, i, _i, _ref;
    can = document.createElement('canvas');
    can.width = this.width;
    can.height = this.height;
    for (i = _i = 0, _ref = this.depthArr.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      can.getContext('2d').drawImage(this.depthArr[i].canvas, 0, 0);
    }
    return can;
  };

  Main.prototype.onMouseDown = function(e) {
    var x, y;
    x = e.offsetX - this.BufDis;
    y = e.offsetY - this.BufDis;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.mouseDown();
    if (this.currentTool !== -1) {
      this.tools[this.currentTool].onMouseDown(x, y, this.layers[this.activeLayerIdx]);
    }
  };

  Main.prototype.onMouseUp = function(e) {
    this.mouseUp();
    if (this.currentTool !== -1) {
      this.tools[this.currentTool].onMouseUp(e.offsetX - this.BufDis, e.offsetY - this.BufDis, this.layers[this.activeLayerIdx]);
    }
  };

  Main.prototype.onMouseMove = function(e) {
    var x, y, _ref;
    _ref = [e.offsetX - this.BufDis, e.offsetY - this.BufDis], x = _ref[0], y = _ref[1];
    if (this.currentTool !== -1) {
      this.tools[this.currentTool].onMouseMove(x, y, this.layers[this.activeLayerIdx], this.mouseStatus);
    }
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      this.mouseUp();
    }
  };

  Main.prototype.curLayer = function() {
    return this.layers[this.activeLayerIdx];
  };

  Main.prototype.curLayerZ = function() {
    return this.curLayer().z;
  };

  Main.prototype.undo = function() {
    var un;
    if (this.currentTool !== -1 && (this.tools[this.currentTool].onEnd != null)) {
      this.tools[this.currentTool].onEnd(this.curLayer());
    }
    if (this.undoList.length <= 0) {
      return;
    }
    un = this.undoList.pop();
    return un.undo();
  };

  Main.prototype.save = function(l, img) {
    this.undoList.push(new UndoOp({
      layer: l,
      img: img
    }));
    if (this.undoList.length > 20) {
      return this.undoList.shift();
    }
  };

  return Main;

})();

Layer = (function() {
  Layer.count = 0;

  Layer.swap = function(l1, l2) {
    var l1z, l2z, _ref;
    _ref = [l1.z, l2.z], l1z = _ref[0], l2z = _ref[1];
    if (l1z > l2z) {
      return this.swap(l2, l1);
    }
    l1.setZ(l2z);
    l2.setZ(l1z);
    l2.layDiv.detach();
    l1.layDiv.after(l2.layDiv);
    l2.canDiv.detach();
    return l1.canDiv.after(l2.canDiv);
  };

  function Layer() {
    this.id = Layer.count;
    Layer.count += 1;
    this.name = 'Layer ' + this.id;
    return;
  }

  Layer.prototype.render = function(idx, z) {
    this.renderCanvas();
    this.renderPannel(idx);
    return this.setZ(z);
  };

  Layer.prototype.setZ = function(z) {
    this.z = z;
    return this.canDiv.css('zIndex', z);
  };

  Layer.prototype.renderCanvas = function() {
    var dv, layerDiv;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.className = 'main-canvas';
    this.bcanvas = document.createElement('canvas');
    this.bcanvas.width = 800;
    this.bcanvas.height = 600;
    this.bcanvas.className = 'buffer-canvas';
    layerDiv = document.createElement('div');
    layerDiv.className = 'layer-div';
    layerDiv.appendChild(this.canvas);
    layerDiv.appendChild(this.bcanvas);
    dv = document.getElementById('canvas-wrapper');
    dv.insertBefore(layerDiv, dv.firstChild);
    this.canDiv = $(layerDiv);
    this.ctx = this.canvas.getContext('2d');
    this.bctx = this.bcanvas.getContext('2d');
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.width = this.bctx.width = 800;
    return this.ctx.height = this.bctx.height = 600;
  };

  Layer.prototype.destruct = function() {
    this.canDiv.detach();
    return this.layDiv.detach();
  };

  Layer.prototype.renderPannel = function(idx) {
    var idiv, imgDiv, textDiv, textP, wraDiv, wrapper;
    wrapper = $('#layer-main');
    imgDiv = $('<canvas>').addClass('layer-img');
    wraDiv = $('<div>').addClass('layer-img-wrapper').append(imgDiv);
    textP = $('<p>').text(this.name);
    textDiv = $('<div>').addClass('layer-text').append(textP);
    idiv = $('<div>').addClass('layer-item').append(wraDiv, textDiv);
    wrapper.prepend(idiv);
    this.layDiv = idiv;
    this.prevCan = this.layDiv.find('canvas');
    this.prevCtx = this.prevCan[0].getContext('2d');
    this.prevCtx.width = this.prevCan[0].width = this.prevCan.width();
    this.prevCtx.height = this.prevCan[0].height = this.prevCan.height();
    return this.layDiv.click(function() {
      return main.changeCurrentLayer(idx);
    });
  };

  Layer.prototype.addActive = function() {
    return this.layDiv.addClass('active');
  };

  Layer.prototype.removeActive = function() {
    return this.layDiv.removeClass('active');
  };

  Layer.prototype.makePrev = function() {
    this.prevCtx.clearAll();
    return this.prevCtx.drawImage(this.canvas, 0, 0, this.prevCan.width(), this.prevCan.height());
  };

  return Layer;

})();

MountPoint = (function() {
  function MountPoint(o) {
    _.extend(this, o);
  }

  MountPoint.prototype.dis = function(x, y) {
    return Math.euclidDistance(x, y, this.x, this.y);
  };

  MountPoint.prototype.setxy = function(x, y, ctx) {
    this.x = x;
    this.y = y;
    if (ctx != null) {
      this.draw(ctx);
    }
  };

  MountPoint.prototype.draw = function(ctx) {
    return ctx.drawMountCircle(this.x, this.y);
  };

  MountPoint.prototype.getxy = function() {
    return [this.x, this.y];
  };

  return MountPoint;

})();

Tools = (function() {
  function Tools(o) {
    _.extend(this, o);
    this.mountPoints = [];
    return;
  }

  Tools.prototype.getVal = function(i) {
    return this.controlVals[i].val();
  };

  Tools.prototype.getMount = function(i) {
    return this.mountPoints[i];
  };

  Tools.prototype.mount = function(i) {
    return this.mountPoints[i];
  };

  Tools.prototype.getPos = function() {
    var rt;
    rt = [];
    this.mountPoints.forEach(function(m) {
      return rt.push({
        x: m.x,
        y: m.y
      });
    });
    return rt;
  };

  Tools.prototype.pos = function(i) {
    return {
      x: mountPoints[i].x,
      y: mountPoints[i].y
    };
  };

  Tools.prototype.getClosetMount = function(x, y) {
    var bdis, cm, d, m, _i, _len, _ref;
    bdis = 10;
    _ref = this.mountPoints;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      d = m.dis(x, y);
      if (d < bdis) {
        bdis = d;
        cm = m;
      }
    }
    return cm;
  };

  Tools.prototype.drawMounts = function(ctx) {
    return this.mountPoints.forEach(function(m) {
      return m.draw(ctx);
    });
  };

  Tools.prototype.render = function(con, idx) {
    var img, wrapDiv;
    img = $('<img>').attr('src', 'img/' + this.iconImg).addClass('tool-img');
    wrapDiv = $('<div>').addClass('tool-icon').append(img).click(function() {
      return main.changeCurrentTool(idx);
    });
    return con.append(wrapDiv);
  };

  Tools.prototype.save = function(l) {
    var imgData;
    imgData = l.ctx.getImageData(0, 0, l.ctx.width, l.ctx.height);
    return main.save(l, imgData);
  };

  Tools.prototype.onEnd = function(l) {
    console.log(this);
    return l.makePrev();
  };

  return Tools;

})();

ShapeTools = (function(_super) {
  __extends(ShapeTools, _super);

  function ShapeTools() {
    return ShapeTools.__super__.constructor.apply(this, arguments);
  }

  ShapeTools.prototype.onLoad = function() {
    this.hasShape = false;
    return this.mountPoints = [new MountPoint(), new MountPoint()];
  };

  ShapeTools.prototype.onMouseDown = function(x, y, l) {
    var m;
    if (!this.hasShape) {
      this.mount(0).setxy(x, y);
      return this.mount(1).setxy(x, y);
    } else {
      m = this.getClosetMount(x, y);
      if (m != null) {
        return this.dragMount = m;
      } else {
        this.onEnd(l);
        return this.onMouseDown(x, y, l);
      }
    }
  };

  ShapeTools.prototype.onMouseMove = function(x, y, l, st) {
    if (st === 0) {
      return;
    }
    if (!this.hasShape) {
      this.mount(1).setxy(x, y);
    } else if (this.dragMount != null) {
      this.dragMount.setxy(x, y);
    }
    l.bctx.clearAll();
    return this.draw(l.bctx);
  };

  ShapeTools.prototype.onMouseUp = function(x, y, l) {
    if (!this.hasShape) {
      this.mount(1).setxy(x, y, l.bctx);
      this.hasShape = true;
    }
    l.bctx.clearAll();
    this.draw(l.bctx);
    return this.drawMounts(l.bctx);
  };

  ShapeTools.prototype.onDrawEnd = function(l) {
    l.bctx.clearAll();
    this.save(l);
    this.draw(l.ctx);
    return this.hasShape = false;
  };

  ShapeTools.prototype.onEnd = function(l) {
    console.log(l);
    if (!this.hasShape) {
      return;
    }
    this.hasShape = false;
    this.onDrawEnd(l);
    return ShapeTools.__super__.onEnd.call(this, l);
  };

  return ShapeTools;

})(Tools);

UndoOp = (function() {
  function UndoOp(o) {
    _.extend(this, o);
  }

  UndoOp.prototype.undo = function() {
    return this.layer.ctx.putImageData(this.img, 0, 0);
  };

  return UndoOp;

})();

ColorInput = (function() {
  function ColorInput(o) {
    this.defaultColor = '#000000';
    _.extend(this, o);
    return;
  }

  ColorInput.prototype.render = function(par) {
    var colorInput, textSpan, wrapDiv;
    textSpan = $('<span> ' + this.text + ' </span>').addClass('option-text-span');
    colorInput = $('<input type="text" id="color1"/>');
    wrapDiv = $('<div>').addClass('option-wrapper');
    wrapDiv.append(textSpan).append(colorInput);
    par.append(wrapDiv);
    colorInput.spectrum({
      clickoutFiresChange: true,
      showPalette: true,
      palette: [["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"], ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"], ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"], ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"], ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"], ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"], ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"], ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"], ["#00000000"]],
      showAlpha: true,
      color: this.defaultColor
    });
    this.spec = colorInput;
  };

  ColorInput.prototype.val = function() {
    return this.spec.spectrum('get');
  };

  return ColorInput;

})();

RangeInput = (function() {
  function RangeInput(o) {
    _.extend(this, o);
    return;
  }

  RangeInput.prototype.render = function(par) {
    var my, numInput, rangeInput, textSpan, wrapDiv;
    textSpan = $('<span> ' + this.text + ' </span>').addClass('option-text-span');
    rangeInput = $('<input type="range" id="range2" min="0" max="100" value="3"/>');
    numInput = $('<input type="number" min="0" max="100" value="3"/>');
    wrapDiv = $('<div>').addClass('option-wrapper');
    wrapDiv.append(textSpan).append(rangeInput).append(numInput);
    par.append(wrapDiv);
    this.inp = rangeInput;
    this.value = 3;
    my = this;
    rangeInput.on('input', function() {
      my.value = parseInt(rangeInput.val());
      return numInput.val(my.value);
    });
    numInput.on('input', function() {
      my.value = parseInt(numInput.val());
      return rangeInput.val(my.value);
    });
  };

  RangeInput.prototype.val = function() {
    return this.value;
  };

  return RangeInput;

})();

PencilTool = (function(_super) {
  __extends(PencilTool, _super);

  function PencilTool() {
    return PencilTool.__super__.constructor.apply(this, arguments);
  }

  PencilTool.prototype.controlVals = [
    new ColorInput({
      text: 'Draw color:'
    }), new RangeInput({
      text: 'Draw width:'
    })
  ];

  PencilTool.prototype.onLoad = function() {
    return this.path = [];
  };

  PencilTool.prototype.draw = function(ctx) {
    var p, _i, _len, _ref;
    ctx.beginPath();
    ctx.moveTo(this.path[0][0], this.path[0][1]);
    _ref = this.path;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      ctx.lineTo(p[0], p[1]);
    }
    return ctx.stroke();
  };

  PencilTool.prototype.onMouseDown = function(x, y, l) {
    var color;
    this.save(l);
    color = this.controlVals[0].val();
    l.ctx.beginPath();
    l.ctx.strokeStyle = color.toRgbString();
    l.ctx.lineJoin = l.ctx.lineCap = 'round';
    l.ctx.lineWidth = this.controlVals[1].val();
    l.bctx.clearAll();
    l.bctx.beginPath();
    l.bctx.strokeStyle = color.toRgbString();
    l.bctx.lineJoin = l.bctx.lineCap = 'round';
    l.bctx.lineWidth = this.controlVals[1].val();
    return this.path.push([x, y]);
  };

  PencilTool.prototype.onMouseMove = function(x, y, l, status) {
    l.bctx.clearAll();
    l.bctx.beginPath();
    l.bctx.lineWidth = 1;
    l.bctx.arc(x, y, this.getVal(1) / 2.0, 0, 2.0 * Math.PI);
    l.bctx.stroke();
    if (status === 0) {
      return;
    }
    l.bctx.lineWidth = this.controlVals[1].val();
    this.path.push([x, y]);
    return this.draw(l.bctx);
  };

  PencilTool.prototype.onMouseUp = function(x, y, l, status) {
    this.onEnd(l);
  };

  PencilTool.prototype.onEnd = function(l) {
    l.bctx.clearAll();
    l.ctx.beginPath();
    if (this.path.length) {
      this.draw(l.ctx);
    }
    this.path.length = 0;
    return PencilTool.__super__.onEnd.call(this, l);
  };

  PencilTool.prototype.iconImg = 'pencil-icon.svg';

  return PencilTool;

})(Tools);

paintTool = new Tools({
  controlVals: [
    new ColorInput({
      text: 'Fill color:'
    })
  ],
  onMouseDown: function(x, y, l) {
    var color, colorVec, cur, dx, dy, getData, height, i, inRange, isEqual4, nx, ny, o, putData, qe, qs, quex, quey, qx, qy, rawData, width, _i, _ref;
    this.save(l);
    color = this.controlVals[0].val().toRgb();
    colorVec = [color.r, color.g, color.b, color.a * 255];
    width = l.ctx.width;
    height = l.ctx.height;
    rawData = l.ctx.getImageData(0, 0, width, height);
    getData = function(x, y) {
      var o;
      o = (y * width + x) * 4;
      return [rawData.data[o], rawData.data[o + 1], rawData.data[o + 2], rawData.data[o + 3]];
    };
    putData = function(x, y) {
      var o;
      o = (y * width + x) * 4;
      rawData.data[o] = color.r;
      rawData.data[o + 1] = color.g;
      rawData.data[o + 2] = color.b;
      return rawData.data[o + 3] = color.a * 255;
    };
    isEqual4 = function(l1, l2) {
      return (l1[0] === l2[0]) && (l1[1] === l2[1]) && (l1[2] === l2[2]) && (l1[3] === l2[3]);
    };
    if (isEqual4(colorVec, getData(x, y))) {
      return;
    }
    inRange = function(_x, _y) {
      return _x >= 0 && _x < width && _y >= 0 && _y < height;
    };
    cur = getData(x, y);
    quex = [x];
    quey = [y];
    _ref = [0, 1], qs = _ref[0], qe = _ref[1];
    dx = [1, 0, -1, 0];
    dy = [0, 1, 0, -1];
    putData(x, y);
    while (qs !== qe) {
      nx = quex[qs];
      ny = quey[qs];
      ++qs;
      for (i = _i = 0; _i <= 3; i = ++_i) {
        qx = nx + dx[i];
        qy = ny + dy[i];
        if (qx < 0 || qx >= width || qy < 0 || qy >= height) {
          continue;
        }
        o = (qy * width + qx) * 4;
        if (rawData.data[o] === cur[0] && rawData.data[o + 1] === cur[1] && rawData.data[o + 2] === cur[2] && rawData.data[o + 3] === cur[3]) {
          rawData.data[o] = colorVec[0];
          rawData.data[o + 1] = colorVec[1];
          rawData.data[o + 2] = colorVec[2];
          rawData.data[o + 3] = colorVec[3];
          quex.push(qx);
          quey.push(qy);
          ++qe;
        }
      }
    }
    l.ctx.putImageData(rawData, 0, 0);
    return this.onEnd(l);
  },
  onMouseMove: function(x, y, l, status) {},
  onMouseUp: function(x, y, l) {},
  iconImg: 'paint-icon.png'
});

rectTool = new ShapeTools({
  controlVals: [
    new ColorInput({
      text: 'Border color:'
    }), new ColorInput({
      text: 'Fill color:',
      defaultColor: '#00000000'
    }), new RangeInput({
      text: 'Border width:'
    })
  ],
  draw: function(ctx) {
    var ex, ey, sx, sy, _ref;
    ctx.beginPath();
    ctx.strokeStyle = this.getVal(0).toRgbString();
    ctx.fillStyle = this.getVal(1).toRgbString();
    ctx.lineWidth = this.getVal(2);
    _ref = [this.mount(0).x, this.mount(0).y, this.mount(1).x, this.mount(1).y], sx = _ref[0], sy = _ref[1], ex = _ref[2], ey = _ref[3];
    ctx.rect(sx, sy, ex - sx, ey - sy);
    ctx.fill();
    return ctx.stroke();
  },
  iconImg: 'rect-icon.png'
});

circleTool = new ShapeTools({
  controlVals: [
    new ColorInput({
      text: 'Border color:'
    }), new ColorInput({
      text: 'Fill color:',
      defaultColor: '#00000000'
    }), new RangeInput({
      text: 'Border width:'
    })
  ],
  drawEllipse: function(x1, y1, x2, y2, ctx) {
    var centx, centy, lenx, leny, _ref, _ref1;
    if (x1 > x2) {
      _ref = [x2, x1], x1 = _ref[0], x2 = _ref[1];
    }
    if (y1 > y2) {
      _ref1 = [y2, y1], y1 = _ref1[0], y2 = _ref1[1];
    }
    centx = (x1 + x2) / 2;
    centy = (y1 + y2) / 2;
    lenx = (x2 - x1) / 2;
    leny = (y2 - y1) / 2;
    return [centx, centy, lenx, leny];
  },
  draw: function(ctx) {
    var ex, ey, res, sx, sy, _ref;
    ctx.beginPath();
    ctx.strokeStyle = this.controlVals[0].val().toRgbString();
    ctx.fillStyle = this.getVal(1).toRgbString();
    ctx.lineWidth = parseInt(this.getVal(2));
    _ref = this.mount(0).getxy().concat(this.mount(1).getxy()), sx = _ref[0], sy = _ref[1], ex = _ref[2], ey = _ref[3];
    res = this.drawEllipse(sx, sy, ex, ey, ctx);
    ctx.ellipse(res[0], res[1], res[2], res[3], 0, 0, 2 * Math.PI);
    ctx.fill();
    return ctx.stroke();
  },
  iconImg: 'circle-icon.png'
});

lineTool = new ShapeTools({
  controlVals: [
    new ColorInput({
      text: 'Border color:'
    }), new RangeInput({
      text: 'Border width:'
    })
  ],
  draw: function(ctx) {
    var pos;
    ctx.beginPath();
    ctx.strokeStyle = this.getVal(0).toRgbString();
    ctx.lineWidth = parseInt(this.getVal(1));
    pos = this.getPos();
    ctx.moveTo(pos[0].x, pos[0].y);
    ctx.lineTo(pos[1].x, pos[1].y);
    return ctx.stroke();
  },
  iconImg: 'line-icon.png'
});

RectSelectTool = (function(_super) {
  __extends(RectSelectTool, _super);

  function RectSelectTool() {
    return RectSelectTool.__super__.constructor.apply(this, arguments);
  }

  RectSelectTool.prototype.controlVals = [];

  RectSelectTool.prototype.onLoad = function() {
    this.selected = false;
    return this.drag = false;
  };

  RectSelectTool.prototype.onMouseDown = function(x, y, l) {
    if (!this.selected) {
      this.startSelectx = x;
      return this.startSelecty = y;
    } else {
      this.offx = x - this.curx;
      this.offy = y - this.cury;
      if (this.offx >= 0 && this.offy >= 0 && this.offx < this.selectWidth && this.offy < this.selectHeight) {
        return this.drag = true;
      } else {
        return this.onEnd(l);
      }
    }
  };

  RectSelectTool.prototype.setCtx = function(ctx) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.setLineDash([5]);
    return ctx.lineDashOffset = 0;
  };

  RectSelectTool.prototype.setCtx2 = function(ctx) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.setLineDash([5]);
    return ctx.lineDashOffset = 5;
  };

  RectSelectTool.prototype.onMouseMove = function(x, y, l, st) {
    var realx, realy, _ref, _ref1;
    if (st === 0) {
      return;
    }
    if (!this.selected) {
      this.endx = x;
      this.endy = y;
      l.bctx.clearAll();
      l.bctx.beginPath();
      this.setCtx(l.bctx);
      l.bctx.rect(this.startSelectx, this.startSelecty, x - this.startSelectx, y - this.startSelecty);
      l.bctx.stroke();
      this.setCtx2(l.bctx);
      l.bctx.rect(this.startSelectx, this.startSelecty, x - this.startSelectx, y - this.startSelecty);
      return l.bctx.stroke();
    } else if (this.drag) {
      l.bctx.clearAll();
      _ref = [x - this.offx, y - this.offy], realx = _ref[0], realy = _ref[1];
      l.bctx.putImageData(this.tempImg, realx, realy);
      l.bctx.beginPath();
      l.bctx.rect(realx, realy, this.selectWidth, this.selectHeight);
      l.bctx.stroke();
      return _ref1 = [realx, realy], this.curx = _ref1[0], this.cury = _ref1[1], _ref1;
    }
  };

  RectSelectTool.prototype.onMouseUp = function(x, y, l) {
    var _ref;
    if (!this.selected) {
      this.endSelectx = x;
      this.endSelecty = y;
      this.selectWidth = x - this.startSelectx;
      this.selectHeight = y - this.startSelecty;
      this.tempImg = l.ctx.getImageData(this.startSelectx, this.startSelecty, this.selectWidth, this.selectHeight);
      this.save(l);
      l.ctx.clearRect(this.startSelectx, this.startSelecty, this.selectWidth, this.selectHeight);
      l.bctx.putImageData(this.tempImg, this.startSelectx, this.startSelecty);
      this.selected = true;
      return _ref = [this.startSelectx, this.startSelecty], this.curx = _ref[0], this.cury = _ref[1], _ref;
    } else if (this.drag) {
      return this.drag = false;
    }
  };

  RectSelectTool.prototype.onEnd = function(l) {
    var tmp, tmpctx;
    tmp = document.createElement('canvas');
    tmp.width = this.selectWidth;
    tmp.height = this.selectHeight;
    tmpctx = tmp.getContext('2d');
    tmpctx.putImageData(this.tempImg, 0, 0);
    l.bctx.clearAll();
    l.ctx.drawImage(tmp, this.curx, this.cury);
    this.selected = false;
    return RectSelectTool.__super__.onEnd.call(this, l);
  };

  RectSelectTool.prototype.iconImg = 'rect-select-icon.svg';

  return RectSelectTool;

})(Tools);

sprayTool = new Tools({
  controlVals: [
    new ColorInput({
      text: "Spray Color: "
    }), new RangeInput({
      text: "Range: "
    })
  ],
  onMouseDown: function(x, y, l) {
    var color, my;
    this.save(l);
    color = this.controlVals[0].val();
    this.curx = x;
    this.cury = y;
    this.r = parseInt(this.getVal(1));
    my = this;
    return this.timerId = setInterval(function() {
      var arr, dx, dy, i, _i, _ref;
      for (i = _i = 0, _ref = my.r + 5; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        arr = Math.random2DNormal(my.r / 2.5);
        dx = Math.round(arr[0]);
        dy = Math.round(arr[1]);
        l.ctx.setPixel(my.curx + dx, my.cury + dy, color.toRgb());
      }
    }, 100);
  },
  onMouseMove: function(x, y, l, status) {
    this.r = parseInt(this.getVal(1));
    l.bctx.clearAll();
    l.bctx.beginPath();
    l.bctx.arc(x, y, this.r, 0, 2 * Math.PI, false);
    l.bctx.stroke();
    if (status === 1) {
      this.curx = x;
      return this.cury = y;
    }
  },
  onMouseUp: function(x, y, l, status) {
    clearInterval(this.timerId);
    this.onEnd(l);
  },
  iconImg: 'spray-icon.png'
});

undoTool = new Tools({
  controlVals: [],
  run: function() {
    return main.undo();
  },
  iconImg: 'undo-icon.png',
  render: function(con, idx) {
    var img, my, wrapDiv;
    img = $('<img>').attr('src', 'img/' + this.iconImg).addClass('tool-img');
    my = this;
    wrapDiv = $('<div>').addClass('tool-icon').append(img).click(function() {
      return my.run();
    });
    return con.append(wrapDiv);
  }
});

downloadTool = new Tools({
  render: function(con, idx) {
    var img, my, wrapA, wrapDiv;
    img = $('<img>').attr('src', 'img/' + this.iconImg).addClass('tool-img');
    my = this;
    wrapDiv = $('<div>').addClass('tool-icon').append(img);
    wrapA = $('<a>').append(wrapDiv).click(function() {
      return my.run(this);
    });
    return con.append(wrapA);
  },
  run: function(link) {
    link.href = main.wholeCanvas().toDataURL();
    return link.download = 'myPaint.png';
  },
  iconImg: "download-icon.svg"
});

main = new Main();

main.tools = [new PencilTool, paintTool, rectTool, circleTool, lineTool, new RectSelectTool(), sprayTool, undoTool, downloadTool];

main.init();
