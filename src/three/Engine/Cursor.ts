import { Events } from "./utils/Events";

export type CursorEventArgs = {
  x: number;
  y: number;
  event: MouseEvent;
};

export class Cursor {
  public x = Infinity;
  public y = Infinity;
  public readonly events = new Events<
    | { trigger: "move"; args: CursorEventArgs }
    | { trigger: "down"; args: CursorEventArgs }
    | { trigger: "up"; args: CursorEventArgs }
    | { trigger: "click"; args: CursorEventArgs }
  >();

  private sizes = {
    width: 0,
    height: 0,
  };

  constructor(domElement: HTMLElement, width: number, height: number) {
    this.sizes.width = width;
    this.sizes.height = height;

    domElement.addEventListener("mousemove", this.onPointerMove.bind(this));
    domElement.addEventListener("mousedown", this.onPointerDown.bind(this));
    domElement.addEventListener("mouseup", this.onPointerUp.bind(this));
    domElement.addEventListener("click", this.onClick.bind(this));
  }

  public resize(width: number, height: number) {
    this.sizes.width = width;
    this.sizes.height = height;
  }

  private onPointerMove(event: MouseEvent) {
    this.x = event.clientX / this.sizes.width - 0.5;
    this.y = -(event.clientY / this.sizes.height - 0.5);
    this.events.trigger("move", { x: this.x, y: this.y, event });
  }

  private onPointerDown(event: MouseEvent) {
    this.events.trigger("down", { x: this.x, y: this.y, event });
  }

  private onPointerUp(event: MouseEvent) {
    this.events.trigger("up", { x: this.x, y: this.y, event });
  }

  private onClick(event: MouseEvent) {
    this.events.trigger("click", { x: this.x, y: this.y, event });
  }
}
