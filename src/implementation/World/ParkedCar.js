import * as THREE from 'three'
import CANNON from 'cannon'

export default class ParkedCar
{
    constructor(_options)
    {
        this.resources = _options.resources
        this.objects = _options.objects
        this.physics = _options.physics
        this.shadows = _options.shadows

        this.position = _options.position || new THREE.Vector3(0, 0, 0)
        this.rotation = typeof _options.rotation === 'number' ? _options.rotation : 0

        this.carOptions = this.physics.car.options
        this.chassisOffsetZ = this.carOptions.chassisOffset.z - 0.28

        this.container = new THREE.Object3D()

        this.setChassis()
        this.setAntena()
        this.setBackLights()
        this.setWheels()
        this.setCollision()
    }

    setChassis()
    {
        const model = this.resources.items.carCyberTruckChassis
        this.chassis = this.objects.getConvertedMesh(model.scene.children, { duplicated: true })
        this.chassis.position.set(this.position.x, this.position.y, this.position.z + this.chassisOffsetZ)
        this.chassis.rotation.z = this.rotation
        this.chassis.updateMatrix()
        this.container.add(this.chassis)

        this.shadows.add(this.chassis, { sizeX: 3, sizeY: 2, offsetZ: 0.2, alpha: 0.5 })
    }

    setAntena()
    {
        const model = this.resources.items.carCyberTruckAntena
        const antena = this.objects.getConvertedMesh(model.scene.children, { duplicated: true })
        this.chassis.add(antena)
    }

    setBackLights()
    {
        const brakeModel = this.resources.items.carCyberTruckBackLightsBrake
        const brake = this.objects.getConvertedMesh(brakeModel.scene.children, { duplicated: true })
        this.chassis.add(brake)

        const reverseModel = this.resources.items.carCyberTruckBackLightsReverse
        const reverse = this.objects.getConvertedMesh(reverseModel.scene.children, { duplicated: true })
        this.chassis.add(reverse)
    }

    setWheels()
    {
        const model = this.resources.items.carCyberTruckWheel
        const wheelBase = this.objects.getConvertedMesh(model.scene.children, { duplicated: true })

        const wheelZ = - this.chassisOffsetZ + this.carOptions.wheelRadius
        const positions = [
            new THREE.Vector3(this.carOptions.wheelFrontOffsetDepth,   this.carOptions.wheelOffsetWidth, wheelZ),
            new THREE.Vector3(this.carOptions.wheelFrontOffsetDepth, - this.carOptions.wheelOffsetWidth, wheelZ),
            new THREE.Vector3(this.carOptions.wheelBackOffsetDepth,    this.carOptions.wheelOffsetWidth, wheelZ),
            new THREE.Vector3(this.carOptions.wheelBackOffsetDepth,  - this.carOptions.wheelOffsetWidth, wheelZ)
        ]

        this.wheels = []
        for(let i = 0; i < 4; i++)
        {
            const wheel = wheelBase.clone()
            wheel.position.copy(positions[i])
            if(i === 1 || i === 3)
            {
                wheel.rotation.z = Math.PI
            }
            this.chassis.add(wheel)
            this.wheels.push(wheel)
        }
    }

    setCollision()
    {
        const halfExtents = new CANNON.Vec3(
            this.carOptions.chassisDepth * 0.5,
            this.carOptions.chassisWidth * 0.5,
            this.carOptions.chassisHeight * 0.5
        )
        const shape = new CANNON.Box(halfExtents)

        this.body = new CANNON.Body({
            mass: 0,
            material: this.physics.materials.items.dummy
        })
        this.body.position.set(
            this.position.x,
            this.position.y,
            this.position.z + this.carOptions.chassisOffset.z
        )
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), this.rotation)
        this.body.addShape(shape)

        this.physics.world.addBody(this.body)
    }
}
