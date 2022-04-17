// * Base
import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

// * Shader
import fireFrag from './shaders/fragment.frag'
import fire2Frag from './shaders/fragment2.frag'
import fireVert from './shaders/vertex.vert'

//** POST PROCESSING */
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export default class Experience 
{
    constructor(canvas)
    {
        // canvas
        this.canvas = canvas

        // experience
        window.experience = this

        // loading manager
        this.manager()

        // sizes
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // scene
        this.scene = new THREE.Scene()
    
        // times
        this.clock = new THREE.Clock()

        // run this
        this.init()

        this.scene.background = this.backgroundTex
    }

    init()
    {
        this.initDebug()
        this.loader()
        this.viewportSizes()
        this.model()
        this.cameraAndControls()
        this.renderer()
        this.postProcessing()
        this.update()
        this.debuggin()
    }

    manager()
    {
        this.manager = new THREE.LoadingManager(
            //Loaded
            ()=>
            {
                // hide counter
                document.querySelector(`.counter`).classList.add(`hide`)
                
                setTimeout(()=>
                {
                    // show button
                    document.querySelector(`.content`).classList.add(`show`)
                }, 2000)
            },
        
            //Progress
            (_, itemsLoaded, itemsTotal)=>
            {
                const progress = (itemsLoaded / itemsTotal) * 100;
                document.querySelector(`.counter`).textContent = `${Math.round(progress)}%`
            }
        )
    }

    initDebug()
    {
        // Debug
        this.gui = new GUI()
        this.debugObject = {}

        this.gui.hide()

        // debug gui
        this.active = window.location.hash === `#debug` 

        if(this.active)
        {
            this.gui.show()
        }
    }

    loader()
    {
        // gltf loader
        this.gltfLoader = new GLTFLoader(this.manager)

        // texture loader
        this.textureLoader = new THREE.TextureLoader(this.manager)

        // audio loader
        this.audioLoader = new THREE.AudioLoader(this.manager)

        // audio loader
        this.audioLoader = new THREE.AudioLoader(this.manager)
    }

    audio()
    {
        this.audioListener = new THREE.AudioListener()
        this.globalSound = new THREE.Audio(this.audioListener)

        this.audioLoader.load(
            `songs/bgsong.mp3`,
            (buffer) => 
            {
                this.globalSound.setBuffer(buffer)
                this.globalSound.setLoop(true)
                this.globalSound.setVolume(1)
                this.globalSound.play()
            }
        )
    }

    viewportSizes()
    {
        window.addEventListener('resize', () =>
        {
            // Update sizes
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight

            // Update camera
            this.camera.aspect = this.sizes.width / this.sizes.height
            this.camera.updateProjectionMatrix()

            // Update renderer
            this.renderer.setSize(this.sizes.width, this.sizes.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    }

    cameraAndControls()
    {
        // Base camera
        this.camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 2000)
        // this.camera.position.set(0, 1.2, 2)
        this.camera.position.set(0, 0.9, 0.75)
        this.camera.lookAt(0,0,0)
        this.scene.add(this.camera)

        // Controls
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true
        this.controls.target.set(0,0,0)
        this.controls.enableZoom = false
        this.controls.enablePan = false
        this.controls.enabled = false
    }

    enableControls()
    {
        this.controls.enableZoom = true
        // this.controls.enablePan = true
        this.controls.enabled = true
    }

    renderer()
    {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    texture()
    {
        // color palette
        this.colorPaletteTex = this.textureLoader.load(`textures/palette1.jpg`)
        this.colorPaletteTex.flipY = false

        // candle
        this.candleTex = this.textureLoader.load(`textures/candle.jpg`)
        this.candleTex.flipY = false
        this.candleTex.encoding = THREE.sRGBEncoding

        // gold 
        this.goldTex = this.textureLoader.load(`textures/matcap-gold-3.png`)
        this.goldTex.flipY = false
    
        // nameplate
        this.nameplateTex = this.textureLoader.load(`textures/nameplate.jpg`)
        this.nameplateTex.flipY = false
        this.nameplateTex.encoding = THREE.sRGBEncoding

        // red cherry
        this.redCherryTex = this.textureLoader.load(`textures/RedCherry.jpg`)
        this.redCherryTex.flipY = false

        // bg
        this.backgroundTex = this.textureLoader.load(`textures/bgRenderer.jpg`)
        this.backgroundTex.encoding = THREE.sRGBEncoding
        // this.backgroundTex.flipY = false

        // fire candle
        this.fireCandleOpacity = this.textureLoader.load(`textures/candleFireAlpha.jpg`)
        this.fireCandleOpacity.encoding = THREE.sRGBEncoding
        this.fireCandleOpacity.flipY = false

        // fire color
        this.fireEmissiveColor = this.textureLoader.load(`textures/candleFire.jpg`)
        this.fireEmissiveColor.encoding = THREE.sRGBEncoding
        this.fireEmissiveColor.flipY = false

        // fire color
        this.sakura = this.textureLoader.load(`textures/LeafParticle.png`)
        // this.sakura.encoding = THREE.sRGBEncoding
        this.sakura.flipY = false
    }

    shaders()
    {
        // config parameter for shader
        this.uniforms = {
            uTime: { value: 0 },
            animationMltiplier: {value: 0.5},
            animationMltiplier2: {value: 0.8},

            opacityMultiplier: {value: 1.0},
            opacityMap: {value: this.fireCandleOpacity},
            
            emissiveMultiplier: {value: 0.6},
            emissiveMap: {value: this.fireEmissiveColor},

            uFrequency: {value: new THREE.Vector2(0.12, 0.12)}
        }

        this.fireShader = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: fireFrag,
            vertexShader: fireVert,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        })

        this.fireShader2 = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: fire2Frag,
            vertexShader: fireVert,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
        })
    }

    material()
    {
        this.texture()

        // color palette materal
        this.colorPalMat = new THREE.MeshBasicMaterial({
            map: this.colorPaletteTex
        })

        // candle material
        this.candleMat = new THREE.MeshBasicMaterial({
            map: this.candleTex
        })

        // gold matcap material
        this.goldMatCap = new THREE.MeshMatcapMaterial({
            matcap: this.goldTex
        })

        // nameplate material 
        this.nameplateMat = new THREE.MeshBasicMaterial({
            map: this.nameplateTex
        })

        // red cherry material
        this.redCherryMat = new THREE.MeshBasicMaterial({
            map: this.redCherryTex
        })

        // sakura material
        this.sakuraMat = new THREE.MeshBasicMaterial({
            map: this.sakura,
            transparent: true,
            side: THREE.DoubleSide
        })

        this.shaders()
    }

    model()
    {
        this.material()

        this.cakeGltf()
        this.particleGltf()
    }

    cakeGltf()
    {
        // cake model
        this.gltfLoader.load(
            `models/birthday.glb`,
            (file)=>
            {
                this.cakeModel = file

                // ground
                this.ground = this.cakeModel.scene.children.find(child => child.name === `Alas1`)
                this.ground.material = this.goldMatCap

                // cake
                this.cake = this.cakeModel.scene.children.find(child => child.name === `BaseCake1`)
                this.cake.material = this.colorPalMat

                // decor below
                this.decorBelow = this.cakeModel.scene.children.find(child => child.name === `Decor1`)
                this.decorBelow.material = this.colorPalMat

                // nameplate
                this.namePlate = this.cakeModel.scene.children.find(child => child.name === `NamePlate1`)
                this.namePlate.material = this.nameplateMat

                // candle
                this.candle = this.cakeModel.scene.children.find(child => child.name === `Candle1`)
                this.candle.material = this.candleMat

                // extra
                this.extra = this.cakeModel.scene.children.find(child => child.name === `Extra`)
                this.extra.material = this.candleMat

                // Red Cherry
                this.redCherry = this.cakeModel.scene.children.find(child => child.name === `RedCherry`)
                this.redCherry.material = this.redCherryMat

                // fires
                this.fire1 = this.cakeModel.scene.children.find(child => child.name === `Fire1`)
                this.fire2 = this.cakeModel.scene.children.find(child => child.name === `Fire2`)
                this.fire3 = this.cakeModel.scene.children.find(child => child.name === `Fire3`)
                this.fire4 = this.cakeModel.scene.children.find(child => child.name === `Fire4`)
                this.fire5 = this.cakeModel.scene.children.find(child => child.name === `Fire5`)
                
                this.fire1.material = this.fireShader
                this.fire2.material = this.fireShader2
                this.fire3.material = this.fireShader
                this.fire4.material = this.fireShader2
                this.fire5.material = this.fireShader

                // adding scene
                this.cakeModel.scene.position.set(0,-0.25,0)
                this.scene.add(this.cakeModel.scene)

            }
        )
    }

    particleGltf()
    {
        // particle model
        this.gltfLoader.load(
            `particle/particle.glb`,
            (file)=>
            {
                this.particle = file

                this.mixer = new THREE.AnimationMixer(this.particle.scene)
                this.clips = this.particle.animations || []

                for (let i = 0; i < 6; i++)
                {
                    const delay = i > 1 ? 20 * i : 10
                    setTimeout(
                        () => 
                        {
                            this.mixer.clipAction(this.clips[i]).play()
                        }, delay
                    )
                }

                this.sakuraLeaf1 = this.particle.scene.children.find(child => child.name === `particle058`)
                this.sakuraLeaf1.material = this.sakuraMat

                this.sakuraLeaf2 = this.particle.scene.children.find(child => child.name === `particle065`)
                this.sakuraLeaf2.material = this.sakuraMat

                this.sakuraLeaf3 = this.particle.scene.children.find(child => child.name === `particle072`)
                this.sakuraLeaf3.material = this.sakuraMat

                this.sakuraLeaf4 = this.particle.scene.children.find(child => child.name === `particle073`)
                this.sakuraLeaf4.material = this.sakuraMat

                this.sakuraLeaf5 = this.particle.scene.children.find(child => child.name === `particle082`)
                this.sakuraLeaf5.material = this.sakuraMat

                this.sakuraLeaf6 = this.particle.scene.children.find(child => child.name === `particle086`)
                this.sakuraLeaf6.material = this.sakuraMat

                this.particle.scene.position.set(-3.5, -5, 0)
                this.particle.scene.scale.set(0.5, 0.5, 0.5)
                this.particle.scene.rotation.y = - Math.PI * 0.5
                this.scene.add(this.particle.scene)
            }
        )
    }

    postProcessing()
    {
        this.renderTarget = new THREE.WebGLRenderTarget(
            this.sizes.width,
            this.sizes.height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding,
                sample: 2
            },
        )

        // * Composer
        this.effectComposer = new EffectComposer(this.renderer, this.renderTarget);
        this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.effectComposer.setSize(this.sizes.width, this.sizes.height)

        // * Render Pass
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.effectComposer.addPass(this.renderPass)

        // * Bloom
        this.unrealBloom = new UnrealBloomPass()
        // this.unrealBloom.enabled = false
        this.unrealBloom.strength = 0.2
        this.unrealBloom.radius = 0.2
        this.unrealBloom.threshold = 0.1
        this.effectComposer.addPass(this.unrealBloom)
    }

    update()
    {
        const tick = () => 
        {

            const currentTime = Date.now()
            this.delta = currentTime - this.current
            this.current = currentTime
            this.elapsed = this.current - this.start

            // update shader time
            this.uniforms.uTime.value = this.clock.getElapsedTime()

            // Update controls
            this.controls.update()

            // Mixer Update
            this.mixer && this.mixer.update(this.delta * 0.001)

            // Render
            this.effectComposer.render()

            // Call tick again on the next frame
            requestAnimationFrame(tick)
        }
        tick()
    }

    debuggin()
    {
        // bloom
        this.bloomFolder = this.gui.addFolder(`Bloom`)

        this.bloomFolder.add(this.unrealBloom, `enabled`)
        this.bloomFolder.add(this.unrealBloom, `strength`, 0.0, 5.0, .001)
        this.bloomFolder.add(this.unrealBloom, `radius`, 0.0, 5.0, .001)
        this.bloomFolder.add(this.unrealBloom, `threshold`, 0.0, 5.0, .001)
    
        // uniform
        this.uniformFolder = this.gui.addFolder(`Uniform`)

        this.uniformFolder.add(this.uniforms.emissiveMultiplier, `value`, 0.0, 5.0, .001).name(`Emissive intensity`)
        this.uniformFolder.add(this.uniforms.opacityMultiplier, `value`, 0.0, 5.0, .001).name(`Opacity intensity`)
        this.uniformFolder.add(this.uniforms.animationMltiplier, `value`, 0.0, 20.0, .001).name(`Animation Speed Multiplier`)
        this.uniformFolder.add(this.uniforms.uFrequency.value, `x`, 0.0, 20.0, .001).name(`x Freq`)
        this.uniformFolder.add(this.uniforms.uFrequency.value, `y`, 0.0, 20.0, .001).name(`y Freq`)

        // camera
        this.cameraFolder = this.gui.addFolder(`Camera & Controls`)

        this.cameraFolder.add(this.camera.position, `x`, 0.0, 20.0, .001).name(`Camera x`).listen()
        this.cameraFolder.add(this.camera.position, `y`, 0.0, 20.0, .001).name(`Camera y`).listen()
        this.cameraFolder.add(this.camera.position, `z`, 0.0, 20.0, .001).name(`Camera z`).listen()
        this.cameraFolder.add(this.controls.target, `x`, 0.0, 20.0, .001).name(`target x`).listen()
        this.cameraFolder.add(this.controls.target, `y`, 0.0, 20.0, .001).name(`target y`).listen()
        this.cameraFolder.add(this.controls.target, `z`, 0.0, 20.0, .001).name(`target z`).listen()

    }
}