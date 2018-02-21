"use strict";

window.glutil = Object.create(null);
glutil.buffer = null;
glutil.program = null;
glutil.canvas = document.getElementById("canvas");
glutil.fragmentSource = document.getElementById("fragmentSource");
glutil.vertexSource = document.getElementById("vertexSource");
glutil.vertexSource.innerHTML = `#version 100
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
attribute vec2 aPos;

void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

glutil.compileShader = function (gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "*** Error compiling shader: " + gl.getShaderInfoLog(shader);
  }
  return shader;
}

glutil.cleanup = function (gl) {
  gl.useProgram(null);
  if (this.buffer)
    gl.deleteBuffer(this.buffer);
  if (this.program)
    gl.deleteProgram(this.program);
}

glutil.createProgram = function (gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    this.cleanup(gl);
    throw ("*** Error linking program: " + gl.getProgramInfoLog(program));
  }
  return program;
}

glutil.createProgramFromScript = function (gl, script_el, opt_type) {
  if (!opt_type) {
    if (script_el.type == "x-shader/x-vertex") {
      opt_type = gl.VERTEX_SHADER;
    } else if (script_el.type == "x-shader/x-fragment") {
      opt_type = gl.FRAGMENT_SHADER;
    } else {
      throw ("*** Error: unknown shader type \"" + script_el.type + "\"");
    }
  }
  return this.compileShader(gl, script_el.text, opt_type);
}

glutil.createProgramFromScripts = function (gl, v_el, f_el) {
  var v = this.createProgramFromScript(gl, v_el, gl.VERTEX_SHADER);
  var f = this.createProgramFromScript(gl, f_el, gl.FRAGMENT_SHADER);
  return this.createProgram(gl, v, f);
}

glutil.getAndResetContext = function () {
  this.canvas.width = this.canvas.clientWidth;
  this.canvas.height = this.canvas.clientHeight;
  var gl = this.canvas.getContext("webgl");
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return gl;
}

glutil.make = function (gl) {
  return this.createProgramFromScripts(gl, this.vertexSource, this.fragmentSource);
}

glutil.init = function (gl) {
  var pos;
  var res;

  res = gl.getUniformLocation(this.program, "uResolution");
  gl.uniform2f(res, gl.drawingBufferWidth, gl.drawingBufferHeight);

  this.time = gl.getUniformLocation(this.program, "uTime");
  gl.uniform1f(this.time, 0.0);

  pos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]), gl.STATIC_DRAW);
  gl.getAttribLocation(this.program, "aPos");
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

glutil.run = function () {
  var self = this;
  var gl = this.getAndResetContext();
  this.program = this.make(gl);
  gl.useProgram(this.program);
  this.init(gl);
  (function redraw() {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.uniform1f(self.time, requestAnimationFrame(redraw)*0.001);
  })();
}