import GUIElement from "../GUIElement/GUIElement.js";

export default class Result extends GUIElement {
  constructor() {
    super();
    this.node = document.createElement("div");
    this.node.classList.add("wrapper", "close");

    const resultNode = document.createElement("div");
    resultNode.classList.add("result");

    resultNode.innerHTML = `
          
            <div class="result__output open">
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

    resultNode.prepend(create());
    function create() {
      const node = document.createElement("div");
      node.classList.add("result__all");

      const resultList = document.createElement("ul");
      resultList.classList.add("result__list");
      node.appendChild(resultList);

      function resultClick() {
        const target = event.target;

        if (target.classList.contains("player__name")) {
          target.nextElementSibling.classList.toggle("open");
        }
        if (target.classList.contains("game__date")) {
          target.nextElementSibling.classList.toggle("open");
        }
      }
      resultList.addEventListener("click", resultClick);

      let data = JSON.parse(localStorage.getItem("gameData"));

      for (let player in data) {
        const nodePlayerListItem = document.createElement("li");
        nodePlayerListItem.classList.add("result__item", "player");

        const nodePlayerName = document.createElement("div");
        nodePlayerName.classList.add("player__name");
        nodePlayerName.innerText = `${player}`;
        nodePlayerListItem.appendChild(nodePlayerName);

        const nodePlayerGamesList = document.createElement("ul");
        nodePlayerGamesList.classList.add("player__games", "games");
        resultList.appendChild(nodePlayerListItem);
        nodePlayerListItem.appendChild(nodePlayerGamesList);

        for (let game of data[player]) {
          const nodeGame = document.createElement("li");
          nodeGame.classList.add("games__game", "game");

          const nodeGameDate = document.createElement("div");
          nodeGameDate.classList.add("game__date");
          nodeGameDate.innerText = Object.keys(game)[0];
          nodeGame.appendChild(nodeGameDate);

          const nodeGameList = document.createElement("ul");
          nodeGameList.classList.add("game__list");
          nodeGame.appendChild(nodeGameList);

          nodePlayerGamesList.appendChild(nodeGame);

          let gameLevels = game[Object.keys(game)[0]];
          for (let levelData in gameLevels) {
            const tmp = gameLevels[levelData];
            const level = document.createElement("li");
            level.classList.add("game__level", "level");
            level.innerHTML = `
                <div class="level__number">Уровень ${levelData}:</div>
                <div class="level__attempts">попыток: ${tmp.attempts},</div>
                <div class="level__time">время: ${tmp.time},</div>
                <div class="level__score">очков: ${tmp.score}</div>
          `;
            nodeGameList.appendChild(level);
          }
        }
      }
      return node;
    }

    const resultMenuButtton = document.createElement("button");
    resultMenuButtton.id = "resultButton";
    resultMenuButtton.classList.add("result__menuButton");
    resultMenuButtton.innerText = "Результаты";

    resultNode.appendChild(resultMenuButtton);

    this.resultButtonClick = () => {
      document.querySelector(".result__output").classList.toggle("open");
      document.querySelector(".result__all").classList.toggle("open");
    };
    resultMenuButtton.addEventListener("click", this.resultButtonClick);

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
    document.getElementById("resultButton").removeEventListener("click", this.resultButtonClick);
    document.getElementById("menuButton").removeEventListener("click", this.buttonClick);
    this.node.parentNode.removeChild(this.node);
  }
}
