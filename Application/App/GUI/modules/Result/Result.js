import GUIElement from "../GUIElement/GUIElement.js";

export default class Result extends GUIElement {
  constructor() {
    super();
    this.node = document.createElement("div");
    this.node.classList.add("wrapper", "close");

    const resultNode = document.createElement("div");
    resultNode.classList.add("result");

    resultNode.innerHTML = `
          
            <div class="result__output">
              <div class="result__field field">
                <div class="field__name">Имя:</div>
                <div class="field__value">${localStorage.getItem("GamePlayerName")}</div>
              </div>
              <div class="result__field field">
                <div class="field__name">Очки:</div>
                <div class="field__value">${localStorage.getItem("GamePlayerScore")}</div>
              </div>
            </div>
        
          `;

    const mainMenuButtton = document.createElement("button");
    mainMenuButtton.classList.add("result__menuButton");
    mainMenuButtton.id = "menuButton";
    mainMenuButtton.innerText = "Главное меню";

    resultNode.appendChild(mainMenuButtton);

    this.result = false;
    this.buttonClick = (event) => {
      this.result = true;
    };

    mainMenuButtton.addEventListener("click", this.buttonClick);

    this.node.appendChild(resultNode);
  }
  async buttonCheck() {
    const timeout = async (ms) => new Promise((res) => setTimeout(res, ms));

    while (this.result === false) await timeout(50);
    this.result = false;
  }
  kill() {
    if (!this.isClosed) return;
    document.getElementById("menuButton").removeEventListener("click", this.buttonClick);
    this.node.parentNode.removeChild(this.node);
  }
}
