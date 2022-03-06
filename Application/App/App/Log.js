export default class Log {
  // static #data = JSON.parse(localStorage.getItem("gameData") || JSON.stringify({}));
  static #data = undefined;

  static #playerName = undefined;
  static #date = undefined;
  static #currentLog = undefined;

  static getDataFromLocalStorage() {
    this.#data = JSON.parse(localStorage.getItem("gameData") || JSON.stringify({}));
  }
  static startLogging() {
    this.#playerName = localStorage.getItem("GamePlayerName");
    this.#date = new Date();
    this.#currentLog = {};
  }

  static createLogEntry(levelNumber) {
    this.#currentLog[levelNumber] = {
      attempts: "0",
      time: "00:00",
      score: "0",
    };
  }

  static updateLogEntry(levelNumber, gameData) {
    this.#currentLog[levelNumber] = {
      attempts: gameData.attempts,
      time: gameData.time,
      score: gameData.score,
    };
  }

  static addLog() {
    const date = this.#date;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (!(this.#playerName in this.#data)) {
      let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      this.#data[this.#playerName] = [{ [`${months[date.getMonth()]} ${date.getDate()}, ${date.getHours()}:${minutes}`]: this.#currentLog }];
    } else {
      const player = this.#data[this.#playerName];

      if (player.length >= 3) {
        player.pop();
      }

      let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

      player.unshift({ [`${months[date.getMonth()]} ${date.getDate()}, ${date.getHours()}:${minutes}`]: this.#currentLog });
    }

    console.log(this.#data);
    localStorage.setItem("gameData", JSON.stringify(this.#data));
  }
}
