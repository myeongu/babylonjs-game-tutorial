import { Mesh, Scene, MeshBuilder, SceneLoader, ActionManager, PBRMetallicRoughnessMaterial, Texture, Color3, TransformNode, ExecuteCodeAction } from "@babylonjs/core";
import { Player } from "./characterController";
import { Lantern } from "./lantern";

export class Environment {
    private _scene: Scene;

    // Meshes
    private _lanternObjs: Array<Lantern>; // array of lanterns of that need to be lit
    private _lightmtl: PBRMetallicRoughnessMaterial; // emissive texture for when lanterns are lit

    constructor(scene: Scene) {
        this._scene = scene;
        
        this._lanternObjs = [];
        // create emissive material for when lantern is lit
        const lightmtl = new PBRMetallicRoughnessMaterial("lantern mesh light", this._scene);
        lightmtl.emissiveTexture = new Texture("/textures/litLantern.png", this._scene, true, false);
        lightmtl.emissiveColor = new Color3(0.8784313725490196, 0.7568627450980392, 0.6235294117647059);
        this._lightmtl = lightmtl;
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

        // --LANTERNS--
        assets.lantern.isVisible = false; // original mesh is not visible
        // transform node to hold all lanterns
        const lanternHolder = new TransformNode("lanternHolder", this._scene);
        for (let i=0; i < 22; i++) {
            // mesh cloning
            let lanternInstance = assets.lantern.clone("lantern" + i); // bring in imported lantern mesh & make clones
            lanternInstance.isVisible = true;
            lanternInstance.setParent(lanternHolder);
            
            // create the new lantern object
            let newLantern = new Lantern(this._lightmtl, lanternInstance, this._scene, assets.env.getChildTransformNodes(false).find(m => m.name === "lantern" + i + "lights")!.getAbsolutePosition());
            this._lanternObjs.push(newLantern);
        }
        // dispose of original mesh and animation group that were cloned
        assets.lantern.dispose();
    }
    
    // Load all necessary meshes for the environment
    public async _loadAsset() {
        const result = await SceneLoader.ImportMeshAsync(
            null,
            "https://babylonjs.github.io/SummerFestival/models/",
            // "./models/",
            "envSetting.glb",
            this._scene
        );
        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();

        // loads lantern mesh
        // const res = await SceneLoader.ImportMeshAsync("", "./models", "lantern.glb", this._scene);
        const res = await SceneLoader.ImportMeshAsync(
            "", 
            "https://babylonjs.github.io/SummerFestival/models/",
            "lantern.glb", 
            this._scene
        );
        
        // extract the actual lantern mesh from the root of the mesh that's imported, dispose of the root
        let lantern = res.meshes[0].getChildren()[0];
        lantern.parent = null;
        res.meshes[0].dispose();

        return {
            env: env, // reference to our entire imported glb (meshes and transform node)
            allMeshes: allMeshes, // all of the meshes that are in the environment
            lantern: lantern as Mesh
        }
    }

    public checkLanterns (player: Player) {
        if (!this._lanternObjs[0].isLit) {
            this._lanternObjs[0].setEmissiveTexture();
        }

        this._lanternObjs.forEach(lantern => {
            player.mesh.actionManager!.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnIntersectionEnterTrigger,
                        parameter: lantern.mesh
                    },
                    () => {
                        // if the lantern is not lig, lgiht it up & reset sparkler timer
                        if (!lantern.isLit && player.sparkLit) {
                            player.lanternsLit += 1; // increment the lantern count
                            lantern.setEmissiveTexture(); // "light up" the lantern
                            // reset the sparkler
                            player.sparkReset = true;
                            player.sparkLit = true;
                        }
                        // if the lantern is lit already, reset the sparkler
                        else if (lantern.isLit) {
                            player.sparkReset = true;
                            player.sparkLit = true;
                        }
                    }
                )
            )
        })
    }
}