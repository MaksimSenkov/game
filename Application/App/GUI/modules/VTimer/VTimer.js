import GUIElement from "../GUIElement/GUIElement.js";

export default class VisualTimer extends GUIElement {
  constructor() {
    super();
    this.node = document.createElement("div");
    this.node.classList.add("timer", "close");
  }
  update(time) {
    this.node.innerText = time;
  }
}
