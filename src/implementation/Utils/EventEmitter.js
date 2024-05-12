export default class
{
    /**
     * Constructor
     */
    constructor()
    {
        this.callbacks = {}
        this.callbacks.base = {}
    }

    /**
     * On
     */
    on(_names, callback)
    {
        const that = this

        if(typeof _names === 'undefined' || _names === '')
        {
            console.warn('wrong names')
            return false
        }

        if(typeof callback === 'undefined')
        {
            console.warn('wrong callback')
            return false
        }

        const names = this.resolveNames(_names)

        names.forEach(function(_name)
        {

            const name = that.resolveName(_name)

            if(!(that.callbacks[ name.namespace ] instanceof Object))
                that.callbacks[ name.namespace ] = {}

            if(!(that.callbacks[ name.namespace ][ name.value ] instanceof Array))
                that.callbacks[ name.namespace ][ name.value ] = []

            that.callbacks[ name.namespace ][ name.value ].push(callback)
        })

        return this
    }

    /**
     * Off
     */
    off(_names)
    {
        const that = this

        if(typeof _names === 'undefined' || _names === '')
        {
            console.warn('wrong name')
            return false
        }

        const names = this.resolveNames(_names)

        names.forEach(function(_name)
        {

            const name = that.resolveName(_name)

            if(name.namespace !== 'base' && name.value === '')
            {
                delete that.callbacks[ name.namespace ]
            }

            else
            {

                if(name.namespace === 'base')
                {

                    for(const namespace in that.callbacks)
                    {
                        if(that.callbacks[ namespace ] instanceof Object && that.callbacks[ namespace ][ name.value ] instanceof Array)
                        {
                            delete that.callbacks[ namespace ][ name.value ]

                            if(Object.keys(that.callbacks[ namespace ]).length === 0)
                                delete that.callbacks[ namespace ]
                        }
                    }
                }

                else if(that.callbacks[ name.namespace ] instanceof Object && that.callbacks[ name.namespace ][ name.value ] instanceof Array)
                {
                    delete that.callbacks[ name.namespace ][ name.value ]

                    if(Object.keys(that.callbacks[ name.namespace ]).length === 0)
                        delete that.callbacks[ name.namespace ]
                }
            }
        })

        return this
    }

    /**
     * Trigger
     */
    trigger(_name, _args)
    {

        if(typeof _name === 'undefined' || _name === '')
        {
            console.warn('wrong name')
            return false
        }

        const that = this
        let finalResult = null
        let result = null

        const args = !(_args instanceof Array) ? [] : _args

        let name = this.resolveNames(_name)

        name = this.resolveName(name[ 0 ])

        if(name.namespace === 'base')
        {

            for(const namespace in that.callbacks)
            {
                if(that.callbacks[ namespace ] instanceof Object && that.callbacks[ namespace ][ name.value ] instanceof Array)
                {
                    that.callbacks[ namespace ][ name.value ].forEach(function(callback)
                    {
                        result = callback.apply(that, args)

                        if(typeof finalResult === 'undefined')
                        {
                            finalResult = result
                        }
                    })
                }
            }
        }

        else if(this.callbacks[ name.namespace ] instanceof Object)
        {
            if(name.value === '')
            {
                console.warn('wrong name')
                return this
            }

            that.callbacks[ name.namespace ][ name.value ].forEach(function(callback)
            {
                result = callback.apply(that, args)

                if(typeof finalResult === 'undefined')
                    finalResult = result
            })
        }

        return finalResult
    }

    /**
     * Resolve names
     */
    resolveNames(_names)
    {
        let names = _names
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '')
        names = names.replace(/[,/]+/g, ' ')
        names = names.split(' ')

        return names
    }

    /**
     * Resolve name
     */
    resolveName(name)
    {
        const newName = {}
        const parts = name.split('.')

        newName.original  = name
        newName.value     = parts[ 0 ]
        newName.namespace = 'base' // Base namespace

        if(parts.length > 1 && parts[ 1 ] !== '')
        {
            newName.namespace = parts[ 1 ]
        }

        return newName
    }
}
