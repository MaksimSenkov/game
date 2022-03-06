import * as THREE from "../Core/libraries/three.module.js";

import * as Engine from "../Core/Core.js";
import * as GraphicalUserInterface from "../GUI/GUI.js";

import Log from "./Log.js";
import Timer from "./Timer.js";

export default class Application {
  constructor(root, levels, settings) {
    this.root = root;

    this.Game = new Engine.Game();
    this.GUI = new GraphicalUserInterface.GUI();

    this.levels = levels;

    this.isGameStarted = true;

    this.lifes = settings.playerLifes;
    this.playerLifes = settings.playerLifes;
    this.playerName = "";
    this.playerScore = 0;

    this.timer = new Timer();
  }
  init() {
    this.Game.init();
    // this.Core.run();
  }
  start() {
    this.GUI.initMainMenu(this.root, new GraphicalUserInterface.Menu());

    this.GUI.appendToHUD(
      "lifes",
      new GraphicalUserInterface.Lifes({
        yesLifePath: "./Application/App/media/YesLife.png",
        noLifePath: "./Application/App/media/NoLife.png",
        numberOfLifes: this.lifes,
        lifesLeft: this.playerLifes,
      })
    );
    this.GUI.appendToHUD("timer", new GraphicalUserInterface.VTimer());
    this.GUI.appendToHUD("score", new GraphicalUserInterface.Score());
    this.GUI.appendToHUD("checkButton", new GraphicalUserInterface.CheckButton());
    this.GUI.appendToHUD("colorChanger", new GraphicalUserInterface.ColorChanger(this.root));

    this.root.addEventListener("colorChange", this.colorChange.bind(this));

    this.GUI.initHUD(this.root);

    // this.GUI.mainMenuOpen();

    this.Game.run();
  }
  colorChange(event) {
    for (let mesh of this.Game.giveLastMeshesGroup()) {
      mesh.material.color = new THREE.Color(`${event.detail.color}`);
    }
  }
  decrementLifes() {
    this.playerLifes--;
  }
  incrementScore(score) {
    this.playerScore += score;
  }
  async run() {
    const root = this.root;

    const Game = this.Game;
    const GUI = this.GUI;

    const totalLife = this.playerLifes;
    let lifes = this.playerLifes;
    let score = this.playerScore;

    const timer = this.timer;

    const decrementGlobalLifes = this.decrementLifes.bind(this);
    const incrementGlobalScore = this.incrementScore.bind(this);
    const setPlayerScoreToLocalStorage = this.setPlayerScoreToLocalStorage.bind(this);

    while (true) {
      // GUI.mainMenuOpen();
      setTimeout(() => {
        this.GUI.mainMenuOpen();
      }, 0);

      await GUI.mainMenu.buttonCheck();

      this.playerName = GUI.mainMenu.givePlayerName;
      this.setPlayerNameToLocalStorage();
      this.setPlayerScoreToLocalStorage();

      await Game.moveCameraFromTo(Game.camera.position, { x: 100, y: 100, z: 0 });

      setTimeout(() => {
        this.GUI.mainMenuClose();
      }, 0);

      Log.startLogging();

      let attempts = 0;
      for (let i = 0; i < this.levels.length; ) {
        if (this.playerLifes === 0) break;

        attempts++;
        if (attempts === 1) Log.createLogEntry(i + 1);

        const result = await running(this.levels[i], i);

        if (result.result) {
          Log.updateLogEntry(i + 1, {
            attempts: attempts,
            time: result.stopTime,
            score: this.levels[i].score,
          });
          attempts = 0;
          i++;
        }
      }

      await Game.moveCameraFromTo(Game.camera.position, { x: 0, y: 20, z: 0 });
      Log.getDataFromLocalStorage();
      Log.addLog();
      this.GUI.initResultMenu(this.root, new GraphicalUserInterface.Result());

      setTimeout(() => {
        this.GUI.resultMenuOpen();
      }, 0);

      await this.GUI.resultMenu.buttonCheck();

      setTimeout(() => {
        this.GUI.resultMenuClose();
        this.GUI.resultMenuKill();
      }, 0);

      this.playerLifes = totalLife;
      lifes = this.playerLifes;
      this.playerScore = 0;
      score = this.playerScore;
    }

    async function running(levelSettings, levelNumber) {
      let levelResult = undefined;

      GUI.HUD["lifes"].update(lifes);
      GUI.HUD["timer"].update("**:**");
      GUI.HUD["score"].update(score);

      const level = new Engine.Level(levelSettings);

      Game.startLevel(level);

      GUI.initModal(root, new GraphicalUserInterface.Modal({ message: `Уровень ${levelNumber + 1}` }));
      GUI.modal.addButton("Начать");

      setTimeout(() => {
        GUI.modalOpen();
      }, 0);

      GUI.showHUD();

      await GUI.modal.buttonCheck();

      GUI.modalClose();

      setTimeout(() => {
        GUI.modalKill();
      }, 2000);

      let GUItimer = updateTimer(levelSettings.time);

      await Promise.race([GUI.HUD["checkButton"].buttonCheck(), timer.set(levelEnd, levelSettings.time + 1)]);

      const result = Game.check();

      stopTimer(GUItimer);
      timer.kill();

      if (result) {
        levelResult = {
          result: true,
          stopTime: GUI.HUD["timer"].getTime(),
        };

        incrementGlobalScore(levelSettings.score);
        incrementScore(levelSettings.score);
        setPlayerScoreToLocalStorage();

        GUI.initModal(root, new GraphicalUserInterface.Modal({ message: `Уровень пройден!` }));
        GUI.modal.addButton("Дальше");
      } else {
        levelResult = {
          result: false,
          stopTime: GUI.HUD["timer"].getTime(),
        };

        decrementGlobalLifes();
        decrementLifes();

        GUI.initModal(root, new GraphicalUserInterface.Modal({ message: `Уровень не пройден!` }));
        GUI.modal.addButton(lifes == 0 ? "Закончить игру" : "Пройти заново");
      }

      setTimeout(() => {
        GUI.modalOpen();
      }, 0);
      await GUI.modal.buttonCheck();

      GUI.modalClose();
      setTimeout(() => {
        GUI.modalKill();
      }, 2000);

      GUI.closeHUD();

      await new Promise((resolve, reject) => {
        Game.endLevel();
        setTimeout(() => {
          resolve();
        }, 12000);
      });

      return levelResult;
    }
    function levelEnd() {
      GUI.closeHUD();
      stopTimer();
    }
    function decrementLifes() {
      lifes--;
    }
    function incrementScore(points) {
      score += points;
    }
    function updateTimer(startTime) {
      let time = startTime;
      let result;
      const timer = setInterval(() => {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        seconds = seconds < 10 ? "0" + seconds : seconds;
        result = `${minutes}:${seconds}`;

        GUI.HUD["timer"].update(result);

        time--;
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
      }, 1000 + startTime * 1000);

      return timer;
    }
    function stopTimer(timer) {
      clearInterval(timer);
    }
  }
  setPlayerNameToLocalStorage() {
    localStorage.setItem("GamePlayerName", `${this.playerName}`);
  }
  setPlayerScoreToLocalStorage() {
    localStorage.setItem("GamePlayerScore", `${this.playerScore}`);
  }
}
