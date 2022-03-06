import * as THREE from "../libraries/three.module.js";
import * as CANNON from "../libraries/cannon-es.js";

import Box from "./Box.js";
import Torus from "./Torus.js";

export default class Level {
  constructor(settings) {
    this.numberOfColumns = settings.numberOfColumns;
    this.numberOfTorusesOnColumn = settings.numberOfTorusesOnColumn;
    this.time = settings.time;
    this.calculationPrecision = settings.calculationPrecision;

    this.columns = [];
    this.toruses = [];

    this.positions = [];
  }
  initLevel() {
    const radius = 5; //Радиус тора
    const step = 4 * radius;
    const coorY = 7;
    const places = [
      [
        {
          x: -step,
          y: coorY,
          z: step,
          busy: false,
          id: 1,
        },
        {
          x: 0,
          y: coorY,
          z: step,
          busy: false,
          id: 2,
        },
        {
          x: step,
          y: coorY,
          z: step,
          busy: false,
          id: 3,
        },
      ],
      [
        {
          x: -step,
          y: coorY,
          z: 0,
          busy: false,
          id: 4,
        },
        {
          x: 0,
          y: coorY,
          z: 0,
          busy: false,
          id: 5,
        },
        {
          x: step,
          y: coorY,
          z: 0,
          busy: false,
          id: 6,
        },
      ],
      [
        {
          x: -step,
          y: coorY,
          z: -step,
          busy: false,
          id: 7,
        },
        {
          x: 0,
          y: coorY,
          z: -step,
          busy: false,
          id: 8,
        },
        {
          x: step,
          y: coorY,
          z: -step,
          busy: false,
          id: 9,
        },
      ],
    ];

    // let positions = this.positions;

    const columns = this.columns;
    const toruses = this.toruses;

    const numberOfColumns = this.numberOfColumns;
    const numberOfTorusesOnColumn = this.numberOfTorusesOnColumn;

    const positions = distributePositions(numberOfColumns, columns);
    this.positions = positions;

    createColumns(numberOfColumns, columns, positions);
    createToruses(toruses, columns, numberOfTorusesOnColumn, positions);

    distributeColumns(positions, columns);
    distributeToruses(toruses);

    function distributePositions(numberOfColumns) {
      let positions = [];

      for (let i = 0; i < numberOfColumns; i++) {
        let tmpPosition = places[getRandomIntInclusive(0, 2)][getRandomIntInclusive(0, 2)];

        while (tmpPosition.busy != false) {
          tmpPosition = places[getRandomIntInclusive(0, 2)][getRandomIntInclusive(0, 2)];
        }
        tmpPosition.busy = true;
        positions.push(tmpPosition);
      }
      return positions;
    }
    function createColumns(numberOfColumns, columns, positions) {
      for (let i = 0; i < numberOfColumns; i++) {
        columns.push(
          new Box({
            width: 2,
            height: 10,
            depth: 2,
            color: new THREE.Color(`rgb(${getRandomIntInclusive(0, 100)}%,${getRandomIntInclusive(0, 100)}%,${getRandomIntInclusive(0, 100)}%)`),
            mass: 10,
            columnID: `${positions[i].id}`,
          })
        );

        //Оставь. Иначе потом не изменить массу столбов
        columns[i].getBody.mass = 0;
        columns[i].getBody.updateMassProperties();
      }
    }
    function distributeColumns(positions, columns) {
      for (let i = 0; i < positions.length; i++) {
        let currentPos = positions[i];
        columns[i].setPosition(currentPos.x, currentPos.y, currentPos.z);
      }
    }

    function createToruses(toruses, columns, numberOfTorusesOnColumn, positions) {
      for (let i = 0; i < columns.length; i++) {
        let torusColor = new THREE.Color(columns[i].mesh.material.color);
        for (let j = 0; j < numberOfTorusesOnColumn; j++) {
          toruses.push(
            new Torus({
              radius: j + 3,
              tube: 1 + j * 0.2,
              radialSegments: 16,
              tubularSegments: 100,
              color: torusColor,
              mass: 10 ** j,
              torusID: `${positions[i].id}.${j}`,
            })
          );
        }
      }
    }
    function distributeToruses(toruses) {
      for (let i = 0; i < toruses.length; i++) {
        toruses[i].setPosition(getRandomIntInclusive(-25, 25), getRandomIntInclusive(10, 27), getRandomIntInclusive(-25, 25));
        // toruses[i].setPosition(getRandomIntInclusive(-20, 20), getRandomIntInclusive(10, 27), getRandomIntInclusive(-20, 20));
        toruses[i].physicsBody.quaternion.setFromAxisAngle(
          new CANNON.Vec3(1, 0, 0),
          ((-1) ** getRandomIntInclusive(1, 2) * Math.PI) / getRandomIntInclusive(2, 4)
        );
      }
    }
  }
  giveObjects() {
    return [this.columns, this.toruses];
  }
  giveSettings() {
    return {
      numberOfColumns: this.numberOfColumns,
      numberOfTorusesOnColumn: this.numberOfTorusesOnColumn,
      positions: this.positions,
      calculationPrecision: this.calculationPrecision,
    };
  }
  givePositions() {
    return this.positions;
  }
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
