import * as THREE from 'three'

import ProjectBoardMaterial from '../../Materials/ProjectBoard.js'
import gsap from 'gsap'

export default class Project
{
    constructor(_options)
    {
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.name = _options.name
        this.geometries = _options.geometries
        this.meshes = _options.meshes
        this.debug = _options.debug
        this.name = _options.name
        this.x = _options.x
        this.y = _options.y
        this.imageSources = _options.imageSources
        this.floorTexture = _options.floorTexture
        this.link = _options.link
        this.distinctions = _options.distinctions

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setBoards()
        this.setFloor()
    }

    setBoards()
    {
        this.boards = {}
        this.boards.items = []
        this.boards.xStart = - 5
        this.boards.xInter = 5
        this.boards.y = 5
        this.boards.color = '#000000'
        this.boards.threeColor = new THREE.Color(this.boards.color)

        if(this.debug)
        {
            this.debug.addColor(this.boards, 'color').name('boardColor').onChange(() =>
            {
                this.boards.threeColor.set(this.boards.color)
            })
        }

        let i = 0

        for(const _imageSource of this.imageSources)
        {
            const board = {}
            board.x = this.x + this.boards.xStart + i * this.boards.xInter
            board.y = this.y + this.boards.y

            this.objects.add({
                base: this.resources.items.projectsBoardStructure.scene,
                collision: this.resources.items.projectsBoardCollision.scene,
                floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture,
                offset: new THREE.Vector3(board.x, board.y, 0),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                mass: 0
            })

            const image = new Image()
            image.addEventListener('load', () =>
            {
                board.texture = new THREE.Texture(image)
                board.texture.anisotropy = 4
                board.texture.needsUpdate = true

                board.planeMesh.material.uniforms.uTexture.value = board.texture

                gsap.to(board.planeMesh.material.uniforms.uTextureAlpha, { value: 1, duration: 1, ease: 'power4.inOut' })
            })

            image.src = _imageSource

            board.planeMesh = this.meshes.boardPlane.clone()
            board.planeMesh.position.x = board.x
            board.planeMesh.position.y = board.y
            board.planeMesh.matrixAutoUpdate = false
            board.planeMesh.updateMatrix()
            board.planeMesh.material = new ProjectBoardMaterial()
            board.planeMesh.material.uniforms.uColor.value = this.boards.threeColor
            board.planeMesh.material.uniforms.uTextureAlpha.value = 0
            this.container.add(board.planeMesh)

            this.boards.items.push(board)

            i++
        }
    }

    setFloor()
    {
        this.floor = {}

        this.floor.x = 0
        this.floor.y = - 2

        this.floor.container = new THREE.Object3D()
        this.floor.container.position.x = this.x + this.floor.x
        this.floor.container.position.y = this.y + this.floor.y
        this.floor.container.matrixAutoUpdate = false
        this.floor.container.updateMatrix()
        this.container.add(this.floor.container)

        this.floor.texture = this.floorTexture
        this.floor.texture.magFilter = THREE.NearestFilter
        this.floor.texture.minFilter = THREE.LinearFilter

        this.floor.geometry = this.geometries.floor

        this.floor.material =  new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, alphaMap: this.floor.texture })

        this.floor.mesh = new THREE.Mesh(this.floor.geometry, this.floor.material)
        this.floor.mesh.matrixAutoUpdate = false
        this.floor.container.add(this.floor.mesh)
    }
}
