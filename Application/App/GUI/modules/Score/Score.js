import GUIElement from "../GUIElement/GUIElement.js";

export default class Score extends GUIElement {
  constructor() {
    super();
    this.node = document.createElement("div");
    this.node.classList.add("score", "close");
  }
  update(score) {
    this.node.innerText = `Счёт: ${score}`;
  }
}
