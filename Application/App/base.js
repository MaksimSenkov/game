import Application from "./App/Application.js";

import { Settings } from "../Settings/Settings.js";
import { Levels } from "../Levels/Levels.js";

const root = document.getElementById("root");
const App = new Application(root, Levels, Settings);

App.init();
App.start();
App.run();
window.app = App;
