import GUIElement from "../GUIElement/GUIElement.js";

export default class Lifes extends GUIElement {
  constructor(options) {
    super();
    this.path = {
      yesLife: options.yesLifePath,
      noLife: options.noLifePath,
    };
    this.node = document.createElement("div");
    this.node.classList.add("lifes", "close");

    this.numberOfLifes = options.numberOfLifes;
    this.lifesLeft = options.numberOfLifes;
    // this.fillMarkers(this.node, options.numberOfLifes, options.lifesLeft);
  }
  update(lifesLeft) {
    this.lifesLeft = lifesLeft;

    while (this.node.firstChild) {
      this.node.firstChild.remove();
    }
    this.fillMarkers(this.node, this.numberOfLifes, this.lifesLeft);
  }
  fillMarkers(parentNode, numberOfLifes, lifesLeft) {
    createMarker(numberOfLifes - lifesLeft, this.path.noLife);
    createMarker(lifesLeft, this.path.yesLife);

    function createMarker(numberOfMarkers, pathToMarker) {
      for (let i = 0; i < numberOfMarkers; i++) {
        let life = document.createElement("img");
        life.classList.add("lifes__picture");
        life.setAttribute("src", `${pathToMarker}`);
        parentNode.appendChild(life);
      }
    }
  }
}
