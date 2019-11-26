// You can use NPM to import files into scripts. As shown here you can load multiple things from one file.
// import { ship, largeAsteroid, bullet, mediumAsteroid, smallAsteroid, noises } from '../assets/loader';

// Again using NPM to import the Bullet class from the './bullet.ts' file.
// import { Bullet } from './bullet';

// These are the main libraries you will use. PIXI manages the rendering where Matter manages the physics.
// You can add more libraries just like this. Just make sure to use NPM to install them before trying to
// import them. `npm install <package_name>[@<version>]`
import * as PIXI from "pixi.js";
import * as Box2D from "./Box2D/Box2D";
import { Rat, Box as BoxSprite } from "../assets/loader";
import { Box } from "../assets/classes/Box";
import { b2Vec2, b2BodyDef } from "./Box2D/Box2D";
//import * as Box from "../assets/classes/Box";

// Saving a reference to the PIXI asset loader for ease of use.
const loader = PIXI.Loader.shared;

// Prepare frames
export class GameApp {
  private app: PIXI.Application;
  private frameCount: number = 0;
  private timePassed: number = 0;
  private timeInterval = 0;
  private boxes = [];
  private gravity = new Box2D.b2Vec2(0, -100);
  private worldB2: Box2D.b2World;
  private ground: Box2D.b2Body;
  private fps = [];
  private boxCount = [];

  constructor(parent: HTMLElement, width: number, height: number) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x000000
    });

    this.worldB2 = new Box2D.b2World(
      this.gravity,
      1,
      new PIXI.Point(width, height)
    );

    this.worldB2.SetContinuousPhysics(true);
    this.worldB2.SetWarmStarting(true);
    const bd = new Box2D.b2BodyDef();
    this.ground = this.worldB2.CreateBody(bd);
    let groundPosition = this.worldB2.PixelToWorldVector(
      new PIXI.Point(width / 2, 50)
    );

    const groundShape = new Box2D.b2EdgeShape();
    const leftWallShape = new Box2D.b2EdgeShape();
    const rightWallShape = new Box2D.b2EdgeShape();
    groundShape.Set(
      new Box2D.b2Vec2(-width / 2, 0),
      new Box2D.b2Vec2(width / 2, 0)
    );

    leftWallShape.Set(
      new Box2D.b2Vec2(-width / 2, height),
      new Box2D.b2Vec2(-width / 2, 0)
    );

    rightWallShape.Set(
      new Box2D.b2Vec2(width / 2, height),
      new Box2D.b2Vec2(width / 2, 0)
    );
    this.ground.CreateFixture(groundShape, 0.0);
    this.ground.CreateFixture(leftWallShape, 0.0);
    this.ground.CreateFixture(rightWallShape, 0.0);

    this.ground.SetPosition(groundPosition);

    console.log(groundShape);

    console.log(this.ground.GetPosition().x, this.ground.GetPosition().y);

    // Binding the PIXI renderer to the wep page.
    parent.replaceChild(this.app.view, parent.lastElementChild);

    // init Pixi loader
    loader
      .add("Box", BoxSprite) // .add(name, path)
      .on("progress", this.progress) // Executes the given function on the given event. In this case whenever progress is made.
      .load(this.onAssetsLoaded.bind(this)); // Executes the given function when the loader has finished loading.

    this.app.ticker.add(this.update.bind(this));
  }

  private onAssetsLoaded() {
    //this.generateJSON();
    console.log(`Assets loaded succesfully.`);
    let position: PIXI.IPoint = new PIXI.Point(
      window.innerWidth / 2,
      window.innerHeight / 2
    );

    this.createBox(position);
    document.getElementById("loadJson").onclick = () => this.generateJSON();
  }

  private createBox(position: PIXI.IPoint) {
    let size: number = 25;

    let texture = PIXI.Texture.from("Box");
    let bodyType = Box2D.b2BodyType.b2_dynamicBody;

    for (let index = 0; index < 1; index++) {
      if (position.x > window.innerWidth) {
        position.x = size / 2;
        position.y += size * 1.5;
      }

      let box = new Box(this.worldB2, texture, bodyType, position, size);
      this.app.stage.addChild(box.sprite);
      this.boxes.push(box);
    }

    for (let index = 0; index < this.boxes.length; index++) {
      const element: Box = this.boxes[index];
      element.onUpdate();
    }
  }

  private progress(loader, resources) {
    console.log(`loading: ${resources.name}`);
    console.log(`progress ${loader.progress}%`);
  }

  private generateJSON = () => {
    var newObject = {
      fps: this.fps,
      boxes: this.boxCount
    };

    let jsonse = JSON.stringify(newObject);

    var blob = new Blob([jsonse], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = "fps.json";
    a.textContent = "Download fps.json";

    document.getElementById("button").appendChild(a);
  };

  private update(delta) {
    this.worldB2.Step(1 / 60, 8, 3);
    this.worldB2.ClearForces();

    if (this.timeInterval < 1 && this.boxes.length > 0) {
      let newPos = new PIXI.Point(
        (window.innerWidth / 2) * Math.random() + innerWidth / 4,
        window.innerHeight + 100
      );
      this.createBox(newPos);
    }

    if (this.timeInterval > 1.5) {
      this.timeInterval = 0;
    }

    for (let index = 0; index < this.boxes.length; index++) {
      const element: Box = this.boxes[index];
      element.onUpdate();
    }

    // Logs FPS.
    let fps = this.frameCount / this.timePassed;
    this.fps.push(Math.round(this.app.ticker.FPS));
    this.boxCount.push(this.boxes.length);

    //console.log(`Frames per second:`, this.fps, "V.S", this.boxes.length);
    // console.log(`Total frames:`, this.frameCount);
    // console.log(`Time passsed:`, this.timePassed);
    this.app.view.width = window.innerWidth;
    this.app.view.height = window.innerHeight;

    this.frameCount++;
    this.timePassed += delta / 60;
    this.timeInterval += delta / 60;
  }
}
