import * as THREE from 'three'
import Zone from './Zone.js'

export default class Zones
{
    constructor(_options)
    {

        this.time = _options.time
        this.sizes = _options.sizes
        this.physics = _options.physics
        this.debug = _options.debug

        this.container = new THREE.Object3D()
        this.container.visible = false
        this.container.matrixAutoUpdate = false

        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('zones')
            this.debugFolder.open()

            this.debugFolder.add(this.container, 'visible').name('visible')
        }

        this.setTester()
        this.setItems()
    }

    setTester()
    {
        this.tester = {}
        this.tester.x = 0
        this.tester.y = 0
        this.time.on('tick', () =>
        {
            this.tester.x = this.physics.car.chassis.body.position.x
            this.tester.y = this.physics.car.chassis.body.position.y
        })
    }

    setItems()
    {
        this.items = []

        this.time.on('tick', () =>
        {
            for(const _zone of this.items)
            {
                const isIn = this.tester.x < _zone.position.x + _zone.halfExtents.x && this.tester.x > _zone.position.x - _zone.halfExtents.x && this.tester.y < _zone.position.y + _zone.halfExtents.y && this.tester.y > _zone.position.y - _zone.halfExtents.y

                if(isIn && !_zone.isIn)
                {
                    _zone.trigger('in', [_zone.data])
                }
                else if(!isIn && _zone.isIn)
                {
                    _zone.trigger('out', [_zone.data])
                }

                _zone.isIn = isIn
            }
        })
    }

    add(_settings)
    {

        const zone = new Zone(_settings)
        this.container.add(zone.mesh)

        this.items.push(zone)

        return zone
    }
}
