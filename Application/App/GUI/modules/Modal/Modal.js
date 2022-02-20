import GUIElement from "../GUIElement/GUIElement.js";

export default class Modal extends GUIElement {
  constructor(options) {
    super();

    this.message = options.message;

    this.node = document.createElement("div");
    this.node.classList.add("modalWrapper", "close");

    this.modalNode = document.createElement("div");
    this.modalNode.classList.add("modal");
    this.node.appendChild(this.modalNode);

    this.modalMessage = document.createElement("div");
    this.modalMessage.classList.add("modal__message");
    this.modalMessage.innerText = this.message;
    this.modalNode.appendChild(this.modalMessage);

    this.listener = undefined;

    this.result = false;
  }

  addButton(message) {
    const button = document.createElement("button");
    button.id = "modalButton";
    button.classList.add("modal__button", "button");

    this.listener = (event) => {
      this.close();
      this.result = true;
    };

    button.addEventListener("click", this.listener);
    button.innerText = message;
    this.modalNode.appendChild(button);
  }
  async buttonCheck() {
    const timeout = async (ms) => new Promise((res) => setTimeout(res, ms));

    while (this.result === false) await timeout(50);
    this.result = false;
  }
  kill() {
    if (!this.isClosed) return;
    document.getElementById("modalButton").removeEventListener("click", this.listener);
    this.node.parentNode.removeChild(this.node);
  }
}
