import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


export default class Objects
{
    constructor(_options)
    {

        this.time = _options.time
        this.resources = _options.resources
        this.materials = _options.materials
        this.physics = _options.physics
        this.shadows = _options.shadows
        this.sounds = _options.sounds
        this.debug = _options.debug

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.items = []
        this.floorShadows = []

        this.setParsers()
        this.setMerge()
    }

    setParsers()
    {
        this.parsers = {}

        this.parsers.items = [

            {
                regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,
                apply: (_mesh, _options) =>
                {

                    const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = `${match[1].substring(0, 1).toLowerCase()}${match[1].substring(1)}` // PastalCase to camelCase
                    let material = this.materials.shades.items[materialName]

                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()
                    }

                    const mesh = _options.duplicated ? _mesh.clone() : _mesh
                    mesh.material = material

                    if(mesh.children.length)
                    {
                        for(const _child of mesh.children)
                        {
                            if(_child instanceof THREE.Mesh)
                            {
                                _child.material = material
                            }
                        }
                    }

                    return mesh
                }
            },

            {
                regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,
                apply: (_mesh, _options) =>
                {

                    const match = _mesh.name.match(/^pure([a-z]+)_?[0-9]{0,3}?/i)
                    const materialName = match[1].toLowerCase()
                    let material = this.materials.pures.items[materialName]

                    if(typeof material === 'undefined')
                    {
                        material = new THREE.MeshNormalMaterial()
                    }

                    const mesh = _options.duplicated ? _mesh.clone() : _mesh
                    mesh.material = material

                    return mesh
                }
            },

            {
                regex: /^floor_?[0-9]{0,3}?/i,
                apply: (_mesh, _options) =>
                {

                    const geometry = new THREE.PlaneGeometry(_mesh.scale.x, _mesh.scale.y, 10, 10)
                    const material = this.materials.items.floorShadow.clone()

                    material.uniforms.tShadow.value = _options.floorShadowTexture
                    material.uniforms.uShadowColor.value = new THREE.Color(this.materials.items.floorShadow.shadowColor)
                    material.uniforms.uAlpha.value = 0

                    const mesh = new THREE.Mesh(geometry, material)
                    mesh.matrixAutoUpdate = false
                    mesh.updateMatrix()

                    this.floorShadows.push(mesh)

                    return mesh
                }
            }
        ]

        this.parsers.default = {}
        this.parsers.default.apply = (_mesh) =>
        {

            const mesh = _mesh.clone()
            mesh.material = this.materials.shades.items.white

            return mesh
        }
    }

    setMerge()
    {
        this.merge = {}
        this.merge.items = {}

        this.merge.container = new THREE.Object3D()
        this.merge.container.matrixAutoUpdate = false
        this.container.add(this.merge.container)

        this.merge.add = (_name, _mesh) =>
        {
            let mergeItem = this.merge.items[_name]

            if(!mergeItem)
            {
                mergeItem = {}

                mergeItem.geometry = new THREE.BufferGeometry()
                mergeItem.geometriesToMerge = []

                mergeItem.material = _mesh.material
                mergeItem.material.side = THREE.DoubleSide

                mergeItem.mesh = new THREE.Mesh(mergeItem.geometry, mergeItem.material)
                this.merge.container.add(mergeItem.mesh)

                this.merge.items[_name] = mergeItem
            }

            const geometry = _mesh.geometry
            _mesh.updateMatrixWorld() // Maybe not
            geometry.applyMatrix(_mesh.matrixWorld)

            mergeItem.geometriesToMerge.push(geometry)
        }

        this.merge.applyMerge = () =>
        {
            for(const _mergeItemName in this.merge.items)
            {
                const mergeItem = this.merge.items[_mergeItemName]

                mergeItem.geometry = BufferGeometryUtils.mergeGeometries(mergeItem.geometriesToMerge) // Should add original geometry
                mergeItem.mesh.geometry = mergeItem.geometry
            }
        }

        this.merge.update = () =>
        {
            for(const _object of this.items)
            {
                if(_object.shouldMerge)
                {
                    const children = [..._object.container.children]
                    for(const _child of children)
                    {
                        const materialName = _child.material.name
                        if(materialName !== '')
                        {
                            this.merge.add(materialName, _child)

                            _object.container.remove(_child)
                        }
                    }


                    _object.shouldMerge = false
                }
            }

            this.merge.applyMerge()
        }
    }

    getConvertedMesh(_children, _options = {})
    {
        const container = new THREE.Object3D()
        const center = new THREE.Vector3()

        const baseChildren = [..._children]

        for(const _child of baseChildren)
        {

            if(_child.name.match(/^center_?[0-9]{0,3}?/i))
            {
                center.set(_child.position.x, _child.position.y, _child.position.z)
            }

            if(_child instanceof THREE.Mesh)
            {

                let parser = this.parsers.items.find((_item) => _child.name.match(_item.regex))
                if(typeof parser === 'undefined')
                {
                    parser = this.parsers.default
                }

                const mesh = parser.apply(_child, _options)

                container.add(mesh)
            }
        }

        if(center.length() > 0)
        {
            for(const _child of container.children)
            {
                _child.position.sub(center)
            }

            container.position.add(center)
        }

        if(_options.mass && _options.mass === 0)
        {
            container.matrixAutoUpdate = false
            container.updateMatrix()
        }

        return container
    }

    add(_options)
    {
        const object = {}

        object.merged = false
        object.shouldMerge = _options.mass === 0

        const offset = new THREE.Vector3()
        if(_options.offset)
        {
            offset.copy(_options.offset)
        }

        const rotation = new THREE.Euler()
        if(_options.rotation)
        {
            rotation.copy(_options.rotation)
        }

        const sleep = typeof _options.sleep === 'undefined' ? true : _options.sleep

        object.container = this.getConvertedMesh(_options.base.children, _options)
        object.container.position.copy(offset)
        object.container.rotation.copy(rotation)
        this.container.add(object.container)

        if(_options.mass === 0)
        {
            object.container.matrixAutoUpdate = false
            object.container.updateMatrix()

            for(const _child of object.container.children)
            {
                _child.matrixAutoUpdate = false
                _child.updateMatrix()
            }
        }

        object.collision = this.physics.addObjectFromThree({
            meshes: [..._options.collision.children],
            offset,
            rotation,
            mass: _options.mass,
            sleep
        })

        for(const _child of object.container.children)
        {
            _child.position.sub(object.collision.center)
        }

        if(_options.soundName)
        {
            object.collision.body.addEventListener('collide', (_event) =>
            {
                const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                this.sounds.play(_options.soundName, relativeVelocity)
            })
        }


        if(_options.shadow)
        {
            this.shadows.add(object.container, _options.shadow)
        }

        if(_options.mass > 0)
        {
            this.time.on('tick', () =>
            {
                object.container.position.copy(object.collision.body.position)
                object.container.quaternion.copy(object.collision.body.quaternion)
            })
        }

        this.items.push(object)

        return object
    }
}
