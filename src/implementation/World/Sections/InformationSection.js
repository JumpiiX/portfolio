import * as THREE from 'three'

export default class InformationSection
{
    constructor(_options)
    {

        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false



        this.setLinks()
        this.setEducation()
        this.setWorkExperience()
        this.setTiles()
        this.setStatic()
    }

    setLinks()
    {

        this.links = {}
        this.links.x = 1.95
        this.links.y = - 1.5
        this.links.halfExtents = {}
        this.links.halfExtents.x = 1
        this.links.halfExtents.y = 1
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = - 1.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        this.links.options = [
            {
                href: 'https://twitter.com/jumpiix24/',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture
            },
            {
                href: 'https://github.com/jumpiix/',
                labelTexture: this.resources.items.informationContactGithubLabelTexture
            },
            {
                href: 'https://www.linkedin.com/in/unterguggenberger/',
                labelTexture: this.resources.items.informationContactLinkedinLabelTexture
            },
            {
                href: 'mailto:david@unterguggenberger.ch',
                labelTexture: this.resources.items.informationContactMailLabelTexture
            }
        ]

        let i = 0
        for(const _option of this.links.options)
        {

            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.href = _option.href

            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () =>
            {
                window.open(_option.href, '_blank')
            })

            item.texture = _option.labelTexture
            item.texture.magFilter = THREE.NearestFilter
            item.texture.minFilter = THREE.LinearFilter

            item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
            item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
            item.labelMesh.position.y = item.y + this.links.labelOffset
            item.labelMesh.matrixAutoUpdate = false
            item.labelMesh.updateMatrix()
            this.links.container.add(item.labelMesh)

            this.links.items.push(item)

            i++
        }
    }
    setStatic()
    {
        this.objects.add({
            base: this.resources.items.informationStaticBase.scene,
            collision: this.resources.items.informationStaticCollision.scene,
            floorShadowTexture: this.resources.items.informationStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setEducation()
    {

        this.education = {}
        this.education.x = this.x - 5
        this.education.y = this.y - 10
        this.education.multiplier = 7

        this.education.geometry = new THREE.PlaneGeometry(2 * this.education.multiplier, 1 * this.education.multiplier, 1, 1)

        this.education.texture = this.resources.items.informationEducationTexture
        this.education.texture.magFilter = THREE.NearestFilter
        this.education.texture.minFilter = THREE.LinearFilter

        this.education.material = new THREE.MeshBasicMaterial({ wireframe: false, map: this.education.texture, alphaMap: this.education.texture, transparent: true })

        this.education.mesh = new THREE.Mesh(this.education.geometry, this.education.material)
        this.education.mesh.position.x = this.education.x
        this.education.mesh.position.y = this.education.y
        this.education.mesh.matrixAutoUpdate = false
        this.education.mesh.updateMatrix()
        this.container.add(this.education.mesh)
    }

    setWorkExperience()
    {

        this.workExperience = {}
        this.workExperience.x = this.x + 5
        this.workExperience.y = this.y - 10
        this.workExperience.multiplier = 7

        this.workExperience.geometry = new THREE.PlaneGeometry(2 * this.workExperience.multiplier, 1 * this.workExperience.multiplier, 1, 1)

        this.workExperience.texture = this.resources.items.informationWorkExperienceTexture
        this.workExperience.texture.magFilter = THREE.NearestFilter
        this.workExperience.texture.minFilter = THREE.LinearFilter

        this.workExperience.material = new THREE.MeshBasicMaterial({ wireframe: false,  map: this.workExperience.texture, alphaMap: this.workExperience.texture, transparent: true })

        this.workExperience.mesh = new THREE.Mesh(this.workExperience.geometry, this.workExperience.material)
        this.workExperience.mesh.position.x = this.workExperience.x
        this.workExperience.mesh.position.y = this.workExperience.y
        this.workExperience.mesh.matrixAutoUpdate = false
        this.workExperience.mesh.updateMatrix()
        this.container.add(this.workExperience.mesh)
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(this.x - 1.2, this.y + 13),
            delta: new THREE.Vector2(0, - 20)
        })
    }
}
