export default class GUI {
  constructor() {
    // this.mainMenu = new Menu();
    // this.result = new Result();

    this.mainMenu;
    this.resultMenu;

    this.modal;

    this.HUD = {};
  }
  static isHUDClosed = true;

  appendToHUD(nameOfElement, element) {
    this.HUD[`${nameOfElement}`] = element;
  }
  initHUD(root) {
    for (let element in this.HUD) {
      root.appendChild(this.HUD[element].giveNode);
    }
  }
  showHUD() {
    this.isHUDClosed = false;

    for (let element in this.HUD) {
      this.HUD[`${element}`].open();
    }
  }
  closeHUD() {
    this.isHUDClosed = true;

    for (let element in this.HUD) {
      this.HUD[`${element}`].close();
    }
  }
  killHUD() {
    if (!this.isHUDClosed) return;

    for (let element in this.HUD) {
      let tmp = this.HUD[`${element}`];
      tmp.kill();
    }
    this.HUD = {};
  }

  appendToRoot(root, element) {
    root.appendChild(element);
  }

  initMainMenu(root, menu) {
    this.mainMenu = menu;
    root.appendChild(this.mainMenu.giveNode);
  }
  mainMenuOpen() {
    this.mainMenu.open();
  }
  mainMenuClose() {
    this.mainMenu.close();
  }
  mainMenuKill() {
    this.mainMenu.kill();
  }

  initResultMenu(root, resultMenu) {
    this.resultMenu = resultMenu;
    root.appendChild(this.resultMenu.giveNode);
  }
  resultMenuOpen() {
    this.resultMenu.open();
  }
  resultMenuClose() {
    this.resultMenu.close();
  }
  resultMenuKill() {
    this.resultMenu.kill();
  }

  initModal(root, modal) {
    this.modal = modal;
    root.appendChild(this.modal.giveNode);
  }
  modalOpen() {
    this.modal.open();
  }
  modalClose() {
    this.modal.close();
  }
  modalKill() {
    this.modal.kill();
  }
}
