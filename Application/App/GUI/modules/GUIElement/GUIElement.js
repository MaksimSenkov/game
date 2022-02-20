export default class GUIElement {
  constructor() {
    this.isClosed = true;

    this.node;
  }
  isElementClosed() {
    return this.isClosed;
  }
  open() {
    const element = this.node;
    element.classList.remove("close");
    element.classList.add("open");
    this.isClosed = false;
  }
  close() {
    const element = this.node;
    element.classList.add("hide");
    setTimeout(() => {
      element.classList.remove("open");
      element.classList.remove("hide");

      element.classList.add("close");
    }, 2000);
    this.isClosed = true;
  }
  kill() {
    if (!this.isClosed) return;
    this.node.parentNode.removeChild(this.node);
  }
  get giveNode() {
    return this.node;
  }
}
