"use strict";

function elt(name, attributes, ...children) {
  var node = document.createElement(name);
  if (attributes) {
    for (let attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (let child of children) {
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}
