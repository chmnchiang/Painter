// Generated by CoffeeScript 1.9.0
var ColorInput, Main, RangeInput, Tools, circleTool, main, paintTool, pencilTool, rectTool,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Main = (function() {
  function Main() {
    this.onMouseMove = __bind(this.onMouseMove, this);
    this.onMouseUp = __bind(this.onMouseUp, this);
    this.onMouseDown = __bind(this.onMouseDown, this);
    this.mouseStatus = 0;
    this.currentTool = -1;
    this.canvas = $('#main-canvas');
    this.ctx = this.canvas[0].getContext('2d');
    this.tools = [];
  }

  Main.prototype.mouseDown = function() {
    return this.mouseStatus = 1;
  };

  Main.prototype.mouseUp = function() {
    return this.mouseStatus = 0;
  };

  Main.prototype.init = function() {
    var can, toolDiv;
    can = this.canvas[0];
    can.width = this.ctx.width = this.canvas.width();
    can.height = this.ctx.height = this.canvas.height();
    can.onselectstart = function() {
      return false;
    };
    toolDiv = $('#toolbox-wrapper');
    this.tools.forEach(function(tool, idx) {
      var img, wrapDiv;
      img = $('<img>').attr('src', 'img/' + tool.iconImg).addClass('tool-img');
      wrapDiv = $('<div>').addClass('tool-icon').append(img).click(function() {
        return main.changeCurrentTool(idx);
      });
      return toolDiv.append(wrapDiv);
    });
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height());
    this.canvas.mousedown(this.onMouseDown);
    this.canvas.mousemove(this.onMouseMove);
    return this.canvas.mouseup(this.onMouseUp);
  };

  Main.prototype.changeCurrentTool = function(idx) {
    var toolDiv, topDiv;
    if (idx === this.currentTool) {
      return;
    }
    toolDiv = $('#toolbox-wrapper');
    toolDiv.children().removeClass('active');
    toolDiv.children().eq(idx).addClass('active');
    topDiv = $('#top-wrapper');
    topDiv.empty();
    this.tools[idx].controlVals.forEach(function(ctr) {
      return ctr.render(topDiv);
    });
    return this.currentTool = idx;
  };

  Main.prototype.onMouseDown = function(e) {
    this.mouseDown();
    console.log(this.currentTool);
    if (this.currentTool !== -1) {
      this.tools[this.currentTool].onMouseDown(e.offsetX, e.offsetY, this.ctx);
    }
  };

  Main.prototype.onMouseUp = function(e) {
    this.mouseUp();
    if (this.currentTool !== -1) {
      this.tools[this.currentTool].onMouseUp(e.offsetX, e.offsetY, this.ctx);
    }
  };

  Main.prototype.onMouseMove = function(e) {
    if (this.currentTool !== -1) {
      this.tools[this.currentTool].onMouseMove(e.offsetX, e.offsetY, this.ctx, this.mouseStatus);
    }
  };

  return Main;

})();

Tools = (function() {
  function Tools(o) {
    _.extend(this, o);
    return;
  }

  Tools.prototype.getVal = function(i) {
    return this.controlVals[i].val();
  };

  return Tools;

})();

ColorInput = (function() {
  function ColorInput(o) {
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
      palette: [["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"], ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"], ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"], ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"], ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"], ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"], ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"], ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]],
      showAlpha: true
    });
    this.spec = colorInput;
  };

  ColorInput.prototype.val = function() {
    console.log(this.spec.spectrum('get').toRgbString());
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
    var rangeInput, textSpan, wrapDiv;
    textSpan = $('<span> ' + this.text + ' </span>').addClass('option-text-span');
    rangeInput = $('<input type="range" id="range2" min="0" max="100" value="3"/>');
    wrapDiv = $('<div>').addClass('option-wrapper');
    wrapDiv.append(textSpan).append(rangeInput);
    par.append(wrapDiv);
    this.inp = rangeInput;
  };

  RangeInput.prototype.val = function() {
    return this.inp.val();
  };

  return RangeInput;

})();

pencilTool = new Tools({
  controlVals: [
    new ColorInput({
      text: 'Draw color:'
    }), new RangeInput({
      text: 'Draw width:'
    })
  ],
  onMouseDown: function(x, y, ctx) {
    var color;
    color = this.controlVals[0].val();
    ctx.beginPath();
    ctx.strokeStyle = color.toRgbString();
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.lineWidth = this.controlVals[1].val();
    return ctx.moveTo(x, y);
  },
  onMouseMove: function(x, y, ctx, status) {
    console.log(status);
    if (status === 0) {
      return;
    }
    console.log(x, y);
    ctx.lineTo(x, y);
    return ctx.stroke();
  },
  onMouseUp: function(x, y, ctx, status) {},
  iconImg: 'pencil-icon.svg'
});

paintTool = new Tools({
  controlVals: [
    new ColorInput({
      text: 'Fill color:'
    })
  ],
  onMouseDown: function(x, y, ctx) {
    var color, cur, d, dir, getData, height, inRange, isEqual3, nex, np, nx, ny, putData, queue, qx, qy, rawData, visited, width, _i, _len, _ref, _ref1;
    color = this.controlVals[0].val().toRgb();
    rawData = ctx.getImageData(0, 0, ctx.width, ctx.height);
    width = ctx.width;
    height = ctx.height;
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
    isEqual3 = function(l1, l2) {
      return (l1[0] === l2[0]) && (l1[1] === l2[1]) && (l1[2] === l2[2]);
    };
    inRange = function(_x, _y) {
      return _x >= 0 && _x < width && _y >= 0 && _y < height;
    };
    cur = getData(x, y);
    queue = [[x, y]];
    dir = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    visited = {};
    visited[y * width + x] = true;
    while (queue.length > 0) {
      np = queue.pop();
      _ref = [np[0], np[1]], nx = _ref[0], ny = _ref[1];
      putData(nx, ny);
      for (_i = 0, _len = dir.length; _i < _len; _i++) {
        d = dir[_i];
        _ref1 = [nx + d[0], ny + d[1]], qx = _ref1[0], qy = _ref1[1];
        if (!inRange(qx, qy)) {
          continue;
        }
        if (visited[qy * width + qx]) {
          continue;
        }
        visited[qy * width + qx] = true;
        nex = getData(qx, qy);
        if (isEqual3(nex, cur)) {
          queue.unshift([qx, qy]);
        }
      }
    }
    return ctx.putImageData(rawData, 0, 0);
  },
  onMouseMove: function(x, y, ctx, status) {},
  onMouseUp: function(x, y, ctx) {},
  iconImg: 'paint-icon.png'
});

rectTool = new Tools({
  controlVals: [
    new ColorInput({
      text: 'Border color:'
    }), new ColorInput({
      text: 'Fill color:'
    }), new RangeInput({
      text: 'Border width:'
    })
  ],
  onMouseDown: function(x, y, ctx) {
    this.startx = x;
    return this.starty = y;
  },
  onMouseMove: function(x, y, ctx) {
    this.endx = x;
    return this.endy = y;
  },
  onMouseUp: function(x, y, ctx) {
    ctx.beginPath();
    ctx.strokeStyle = this.controlVals[0].val().toRgbString();
    ctx.fillStyle = this.getVal(1).toRgbString();
    ctx.lineWidth = this.getVal(2);
    ctx.rect(this.startx, this.starty, this.endx - this.startx, this.endy - this.starty);
    ctx.stroke();
    return ctx.fill();
  },
  iconImg: 'rect-icon.png'
});

circleTool = new Tools({
  controlVals: [
    new ColorInput({
      text: 'Border color:'
    }), new ColorInput({
      text: 'Fill color:'
    }), new RangeInput({
      text: 'Border width:'
    })
  ],
  onMouseDown: function(x, y, ctx) {
    this.startx = x;
    return this.starty = y;
  },
  onMouseMove: function(x, y, ctx) {
    this.endx = x;
    return this.endy = y;
  },
  onMouseUp: function(x, y, ctx) {
    var centx, centy, lenx, leny, _ref, _ref1;
    ctx.beginPath();
    ctx.strokeStyle = this.controlVals[0].val().toRgbString();
    ctx.fillStyle = this.getVal(1);
    ctx.lineWidth = this.getVal(2);
    if (this.startx > this.endx) {
      _ref = [this.endx, this.startx], this.startx = _ref[0], this.endx = _ref[1];
    }
    if (this.starty > this.endy) {
      _ref1 = [this.endy, this.starty], this.starty = _ref1[0], this.endy = _ref1[1];
    }
    centx = (this.startx + this.endx) / 2;
    centy = (this.starty + this.endy) / 2;
    lenx = (this.endx - this.startx) / 2;
    leny = (this.endy - this.starty) / 2;
    ctx.ellipse(centx, centy, lenx, leny, 0, 0, 2 * Math.PI);
    ctx.stroke();
    return ctx.fill();
  },
  iconImg: 'circle-icon.png'
});

main = new Main();

main.tools = [pencilTool, paintTool, rectTool, circleTool];

main.init();
