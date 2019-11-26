import * as PIXI from "pixi.js";
import * as BOX2D from "../../app/Box2D/Box2D";
import {
  b2BodyDef,
  b2Body,
  b2World,
  b2FixtureDef,
  b2BodyType,
  b2ContactEdge,
  b2Vec2
} from "../../app/Box2D/Box2D";

export class Box {
  private bodyDef: BOX2D.b2BodyDef;
  public sprite: PIXI.Sprite;
  public body: BOX2D.b2Body;
  private world: b2World;
  private angle: number;

  constructor(
    world: BOX2D.b2World,
    texture: PIXI.Texture,
    bodyType: b2BodyType,
    position: PIXI.IPoint,
    size: number
  ) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.width = size;
    this.sprite.height = size;
    this.sprite.position = position;
    this.bodyDef = new b2BodyDef();
    this.bodyDef.type = bodyType;

    let newPos = world.PixelToWorldVector(position);

    this.bodyDef.position.Set(newPos.x, newPos.y);
    this.world = world;
    this.body = world.CreateBody(this.bodyDef);
    let poligonShape = new BOX2D.b2PolygonShape();
    let shapeScaleInPixels = new PIXI.Point(
      this.sprite.width / 2,
      this.sprite.height / 2
    );

    let shapeScale = world.PixelToWorldVector(shapeScaleInPixels);
    poligonShape.SetAsBox(size / 2, size / 2);

    let fixtureDef = new b2FixtureDef();
    fixtureDef.shape = poligonShape;
    fixtureDef.density = 1;
    fixtureDef.friction = 1;
    fixtureDef.restitution = 0;
    this.body.CreateFixture(fixtureDef);

    this.sprite.anchor = new PIXI.Point(0.5, 0.5);
    this.body.SetAngularVelocity(5000);
    //this.body.SetFixedRotation(true);
  }

  public SetPosition(): void {}

  public onUpdate = () => {
    // console.log(this.body.GetPosition().x, this.body.GetPosition().y);
    // console.log(this.sprite.position.x, this.sprite.position.y);
    this.sprite.position = this.world.WorldToPixelVector(
      this.body.GetPosition()
    );
  };

  public rotateObject(
    body: b2Body,
    x1: number,
    y1: number,
    width1: number,
    height1: number,
    rotation: number,
    PPM: number
  ) {
    let DEGTORAD = 0.0174532925199432957;
    // Top left corner of object
    let pos = new b2Vec2(x1 / PPM, (y1 + height1) / PPM);
    // angle of rotation in radians
    let angle = DEGTORAD * rotation;
    // half of diagonal for rectangular object
    let radius = Math.sqrt(width1 * width1 + height1 * height1) / 2 / PPM;
    // Angle at diagonal of rectangular object
    let theta = Math.tanh(height1 / width1) * DEGTORAD;

    // Finding new position if rotation was with respect to top-left corner of object.
    // X=x+ radius*cos(theta-angle)+(h/2)cos(90+angle)
    // Y= y+radius*sin(theta-angle)-(h/2)sin(90+angle)
    pos = pos
      .SelfAdd(
        new b2Vec2(
          radius * Math.cos(-angle + theta),
          radius * Math.sin(-angle + theta)
        )
      )
      .SelfAdd(
        new b2Vec2(
          (height1 / PPM / 2) * Math.cos(90 * DEGTORAD + angle),
          -(height1 / PPM / 2) * Math.sin(90 * DEGTORAD + angle)
        )
      );
    // transform the body
    //this.body.setTransform(pos, -angle);
  }
}
