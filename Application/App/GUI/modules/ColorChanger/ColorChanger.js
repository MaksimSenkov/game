import GUIElement from "../GUIElement/GUIElement.js";

export default class ColorChanger extends GUIElement {
  constructor(root) {
    super();

    this.node = document.createElement("input");
    this.node.id = "colorChanger";
    this.node.classList.add("colorChanger", "close");

    this.node.setAttribute("type", "color");

    this.node.value = "#00aaff";
    this.listener = undefined;

    this.listener = () => {
      const event = new CustomEvent("colorChange", {
        detail: {
          color: this.node.value,
          log: "hi",
        },
      });
      console.log(this.node.value);
      root.dispatchEvent(event);
    };
    this.node.addEventListener("change", this.listener);
  }
  kill() {
    if (!this.isClosed) return;
    document.getElementById("colorChanger").removeEventListener("change", this.listener);
    this.node.parentNode.removeChild(this.node);
  }
}
