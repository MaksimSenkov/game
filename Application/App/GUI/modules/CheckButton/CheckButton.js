import GUIElement from "../GUIElement/GUIElement.js";

export default class CheckButton extends GUIElement {
  constructor() {
    super();
    this.node = document.createElement("button");
    this.node.id = "checkButton";
    this.node.classList.add("checkButton", "close");
    this.node.innerText = "Проверить";

    this.listener = undefined;

    this.result = false;

    this.listener = (event) => {
      // this.close();
      this.result = true;
    };
    this.node.addEventListener("click", this.listener);
  }
  kill() {
    if (!this.isClosed) return;
    document.getElementById("checkButton").removeEventListener("click", this.listener);
    this.node.parentNode.removeChild(this.node);
  }
  async buttonCheck() {
    const timeout = async (ms) => new Promise((res) => setTimeout(res, ms));

    while (this.result === false) await timeout(100);
    this.result = false;
  }
}
