import { Scene, MeshBuilder, SceneLoader } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
        // let envUrl = new URL("http://localhost:8080/models/envSetting.glb");
        
    }

    public async load() {
        // MeshBuilder.CreateGround(
        //     "ground",
        //     { width:30, height:30 }, 
        //     this._scene
        // );
        const assets = await this._loadAsset();
        // Loop through all environment meshes that were imported
        assets.allMeshes.forEach(m => {
            m.receiveShadows = true;
            m.checkCollisions = true;
        })
    }
    
    // Load all necessary meshes for the environment
    public async _loadAsset() {
        // console.log(process.cwd())
        console.log(__dirname)
        const result = await SceneLoader.ImportMeshAsync(
            null,
            "https://babylonjs.github.io/SummerFestival/models/",
            // "./models/",
            "envSetting.glb",
            this._scene
        );
        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();

        return {
            env: env, // reference to our entire imported glb (meshes and transform node)
            allMeshes: allMeshes // all of the meshes that are in the environment
        }
    }
}