/* main */
"use strict";
;(function() {
  var fsrc = document.getElementById("fragmentEditor");
  window.addEventListener('keydown', function(ev) {
    if (ev.keyCode == 112 /* F1 */) {
      ev.preventDefault();
      glutil.fragmentSource.innerHTML = fsrc.value;
      glutil.run();
    }
  });
  fsrc.value = 
`#version 100
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    gl_FragColor = vec4(sin(10.0*uTime+uv.x), 0.0, 0.0, 1.0);
}`;
})();
