import { Scene, MeshBuilder } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        MeshBuilder.CreateGround(
            "ground",
            { width:30, height:30 }, 
            this._scene
        );
    }
}