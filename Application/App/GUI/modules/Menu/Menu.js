import GUIElement from "../GUIElement/GUIElement.js";

export default class Menu extends GUIElement {
  constructor() {
    super();

    this.result = false;

    this.playerName = undefined;

    this.node = document.createElement("div");
    this.node.classList.add("wrapper", "close");

    this.elementMenu = document.createElement("div");
    this.elementMenu.classList.add("menu");
    this.elementMenu.innerHTML = `
              <input id="nameInput" class="menu__input" type="text" placeholder="Игрок" />
          `;

    const startButton = document.createElement("button");
    startButton.id = "startButton";
    startButton.classList.add("menu__button", "button");

    startButton.innerText = "Начать игру";
    this.elementMenu.appendChild(startButton);

    this.buttonClick = (event) => {
      let playerName = document.getElementById("nameInput").value;
      playerName === "" ? (playerName = "Игрок") : playerName;
      this.playerName = playerName;
      console.log(this.playerName);
      // localStorage.setItem("GamePlayerName", playerName);
      this.result = true;
      this.close();
    };
    startButton.addEventListener("click", this.buttonClick);

    this.node.appendChild(this.elementMenu);
  }

  addToMenu(tag, content, attributes) {
    let element = document.createElement(tag);
    element.textContent = content;

    if (attributes) {
      for (let attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
      }
    }

    this.elementMenu.appendChild(element);
  }
  async buttonCheck() {
    const timeout = async (ms) => new Promise((res) => setTimeout(res, ms));

    while (this.result === false) await timeout(100);
    this.result = false;
  }
  kill() {
    if (!this.isClosed) return;
    document.getElementById("startButton").removeEventListener("click", this.buttonClick);
    this.node.parentNode.removeChild(this.node);
  }
  get givePlayerName() {
    return this.playerName;
  }
}
