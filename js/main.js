let App = (function (g) {
    "use strict"

    let generic = {}
    //https://gist.github.com/gordonbrander/2230317
    generic.id = function() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    const DRAWING_TOOL_FREE = 'free';
    const DRAWING_TOOL_PENCIL = 'pencil';
    const DRAWING_TOOL_RECTANGLE = 'rectangle';
    const DRAWING_TOOL_CIRCLE = 'circle';
    const DRAWING_TOOL_ERASER = 'eraser';

    const ENTITY_LINE = 'line'
    const ENTITY_CIRCLE = 'circle'
    const ENTITY_TEXT = 'text'
    const ENTITY_RECT = 'rect'

    const MOVEMENT_TYPE_CONTROL_POINT = 'by-control-point'
    const MOVEMENT_TYPE_SHAPE = 'by-shape'

    const RADIUS_GLUE_EFFECT = 30;

    let App = {
        clientWidth: g.innerWidth,
        viewBoxWidth: g.innerWidth,
        clientHeight: g.innerHeight,
        viewBoxHeight: g.innerHeight,
        maxClientWidth: null,
        maxClientHeight: null,
        factorX: 0,
        factorY: 0,
        scrollFactor: 5,
        scaleFactor: 1,
        data: { //user custom data to fill
            backgroundSVG: null,
            reinit: false
        },
        paintInAction: false,
        currentColor: '#000000',
        drawingRectangle: [],
        shapesToDrag: [],
        shapes: [],
        ids: [],
        movementType: null,

        currentDrawingTool: null,
        currentlineWeight: 4,

    }
    App.get = function (key, defaultValue) {
        defaultValue = defaultValue || undefined
        if (this.data != undefined && this.data[key] != undefined) {
            return this.data[key]
        }
        if (this[key] != undefined) {
            return this[key]
        }
        return defaultValue
    }
    App.init = function (data) {
        if (data.length != 0) {
            Object.assign(this.data, data)
        }
        App.clientWidth = g.innerWidth
        App.viewBoxWidth = g.innerWidth
        App.clientHeight = g.innerHeight
        App.viewBoxHeight =  g.innerHeight
        App.maxClientWidth = this.clientWidth * 2
        App.maxClientHeight = this.clientHeight * 2
        App.scaleFactor = 1.0
        App.background()
        if(App.get('reinit') == true) {
            App.removeShapesOBJ()
            App.data.reinit = false
        }
    }
    App.removeShapesOBJ = function() {
        App.shapes = [];
    }
    App.removeShapesDOM = function() {
        let shapes = App.get('backgroundSVG').querySelector('g#shapes')
        let meta = App.get('backgroundSVG').querySelector('g#meta')
        shapes.innerHTML = ''
        meta.innerHTML = ''
    }
    App.draw = function () {
        App.removeShapesDOM()
        let shapes = App.get('shapes')
        shapes.forEach((shape) => {
            //g element
            let gEl = document.createElementNS("http://www.w3.org/2000/svg", 'g')
            gEl.classList.add('shape')
            gEl.setAttribute('id', shape.id)
            shape.nodes.forEach((item) => {
                if(item.visible == true) {
                    let domElement = document.createElementNS("http://www.w3.org/2000/svg", item.entity)
                    for(let attr in item.attrs) {
                        domElement.setAttribute(attr, item.attrs[attr])
                    }
                    let style = ''
                    for(let styleItem in item.style) {
                        style += `${styleItem}: ${item.style[styleItem]};`
                    }
                    for(let idx in item.class) {
                        domElement.classList.add(item.class[idx])
                    }
                    if(item.content != undefined) {
                        domElement.innerHTML = item.content
                    }
                    domElement.setAttribute('style', style)
                    domElement.setAttribute('data-id', shape.id)
                    gEl.insertAdjacentElement('beforeend', domElement)
                }
            })
            //to svg
            App.get('backgroundSVG').querySelector('#shapes').insertAdjacentElement('beforeend', gEl)
        })
    }
    App.background = function () {
        if(App.clientWidth > App.clientHeight) {
            App.factorX = 1
            App.factorY = App.clientHeight / App.clientWidth
        }
        else {
            App.factorX = App.clientWidth / App.clientHeight
            App.factorY = 1
        }
        App.get('backgroundSVG').setAttribute('viewBox', '0 0 ' + App.viewBoxWidth + ' ' + App.viewBoxHeight)
    }
    App.createShapeObject = function() {
        let id = null
        do {
            id = generic.id()
        }
        while (App.ids.includes(id))
        let data = {
            id: id,
            current: true,
            nodes: []
        }
        //before add new object, check if we have active element
        App.shapes.forEach((item) => {
            if(item.current == true) {
                item.current = false
                item.nodes.forEach((node) => {
                    if(node.class && node.class.includes('border-highlighted')) {
                        node.visible = false
                    }
                })
            }
        })
        App.shapes.push(data)
        return App.shapes[App.shapes.length - 1]
    }
    App.makeShapeObjectCurrent = function(shapeObject, deactivateOthers) {
        let activeShapeObjectIdx = -1
        App.shapes.forEach((item, idx) => {
            if(deactivateOthers) {
                if (item.current == true) {
                    item.current = false
                    item.nodes.forEach((node) => {
                        if (node.class && node.class.includes('border-highlighted')) {
                            node.visible = false
                        }
                    })
                }
            }
            if(item.id == shapeObject.id) {
                item.current = true
                item.nodes.forEach((node) => {
                    if(node.class && node.class.includes('border-highlighted')) {
                        node.visible = true
                    }
                })
                activeShapeObjectIdx = idx
            }
        })
        return App.shapes[activeShapeObjectIdx]
    }
    App.deactivateShapeObject = function(shapeObject) {
        App.shapes.forEach((item, idx) => {
            if (item.id == shapeObject.id && item.current == true) {
                item.current = false
                item.nodes.forEach((node) => {
                    if (node.class && node.class.includes('border-highlighted')) {
                        node.visible = false
                    }
                })
            }
        })
    }
    App.getCurrentShapeObject = function() {
        let idx = -1
        App.shapes.forEach((item, index) => {
            if(item.current == true) {
                idx = index
            }
        })
        if(idx != -1) {
            return App.shapes[idx]
        }
        return false
    }
    App.getCurrentShapeObjectByID = function(shapeid) {
        let idx = -1
        App.shapes.forEach((item, index) => {
            if(item.id == shapeid) {
                idx = index
            }
        })
        if(idx != -1) {
            return App.shapes[idx]
        }
        return false
    }
    App.removeShapeById = function(id) {
        let idx = -1
        App.shapes.forEach((item, index) => {
            if(item.id == id) {
                idx = index
            }
        })
        if(idx != -1) {
            App.shapes.splice(idx, 1)
        }
    }
    App.vectorLength = function(lineNode) {
        let x1 = parseInt(lineNode.attrs['x1'])
        let x2 = parseInt(lineNode.attrs['x2'])
        let y1 = parseInt(lineNode.attrs['y1'])
        let y2 = parseInt(lineNode.attrs['y2'])
        return parseFloat(
                Math.sqrt(
                    Math.pow(Math.abs(x2 - x1), 2) +
                    Math.pow(Math.abs(y2 - y1), 2)
                ) / 10
            ).toFixed(1)
    }
    App.vectorCenterPoint = function(lineNode) {
        let x1 = parseInt(lineNode.attrs['x1'])
        let x2 = parseInt(lineNode.attrs['x2'])
        let y1 = parseInt(lineNode.attrs['y1'])
        let y2 = parseInt(lineNode.attrs['y2'])
        let textX = x1 + (x2 - x1) / 2
        let textY = y1 + (y2 - y1) / 2 - 10
        return {x: textX, y: textY}
    }
    //line
    App.createLine = function(coords) {
        let shapeObj = App.createShapeObject()
        let lineNodeSelectedObj = {
            entity: ENTITY_LINE,
            visible: true,
            attrs: {
                x1: coords.x / App.scaleFactor,
                x2: coords.x / App.scaleFactor,
                y1: coords.y / App.scaleFactor,
                y2: coords.y / App.scaleFactor
            },
            style: {
                "stroke-width": parseInt(this.currentlineWeight) + 10,
                "stroke-linecap": 'round',
                stroke: '#225577'
            },
            class: [
                'border-highlighted'
            ]
        }

        let lineNodeObj = {
            entity: ENTITY_LINE,
            visible: true,
            attrs: {
                x1: coords.x / App.scaleFactor,
                x2: coords.x / App.scaleFactor,
                y1: coords.y / App.scaleFactor,
                y2: coords.y / App.scaleFactor
            },
            style: {
                stroke: this.currentColor,
                "stroke-width": this.currentlineWeight,
                "stroke-linecap": 'round'
            },
            class: [
                'base'
            ]
        }

        let controlPointsObj = [
            {
                entity: ENTITY_CIRCLE,
                visible: true,
                attrs: {
                    cx: coords.x / App.scaleFactor,
                    cy: coords.y / App.scaleFactor,
                    r: 5
                },
                style: {
                    stroke: '#cccccc',
                    "stroke-opacity": 0.5,
                    "stroke-width": this.currentlineWeight
                },
                class: [
                    'control-point',
                    'first'
                ]
            },
            {
                entity: ENTITY_CIRCLE,
                visible: true,
                attrs: {
                    cx: coords.x / App.scaleFactor,
                    cy: coords.y / App.scaleFactor,
                    r: 5
                },
                style: {
                    stroke: '#cccccc',
                    "stroke-opacity": 0.5,
                    "stroke-width": this.currentlineWeight
                },
                class: [
                    'control-point',
                    'last'
                ]
            }
        ]

        let textNodeObj = {
            entity: ENTITY_TEXT,
            visible: true,
            attrs: {
                x: coords.x / App.scaleFactor,
                y: coords.y / App.scaleFactor
            },
            style: {
                'font-size': '20px',
                'font-weight': 'bold',
                'text-anchor': 'middle'
            }
        }
        shapeObj.nodes.push(lineNodeSelectedObj);
        shapeObj.nodes.push(lineNodeObj);
        shapeObj.nodes = shapeObj.nodes.concat(controlPointsObj);
        shapeObj.nodes.push(textNodeObj);
    }
    App.updateLine = function(coords) {
        let shapeObj = App.getCurrentShapeObject()
        let baseLineObjIdx = -1
        let selectedLineObjIdx = -1
        let textObjIdx = -1
        let controlPointIdx = -1
        shapeObj.nodes.forEach((node, idx) => {
            if(node.entity == ENTITY_LINE && node.class.includes('base')) {
                baseLineObjIdx = idx
            }
            if(node.entity == ENTITY_LINE && node.class.includes('border-highlighted')) {
                selectedLineObjIdx = idx
            }
            if(node.entity == ENTITY_TEXT) {
                textObjIdx = idx
            }
            if(node.entity == ENTITY_CIRCLE && node.class.includes('last')) {
                controlPointIdx = idx
            }
        })

        if(baseLineObjIdx != -1 && selectedLineObjIdx != -1 && textObjIdx != -1 && controlPointIdx != -1) {
            //selected
            shapeObj.nodes[selectedLineObjIdx].attrs.x2 = coords.x / App.scaleFactor
            shapeObj.nodes[selectedLineObjIdx].attrs.y2 = coords.y / App.scaleFactor
            //base line
            shapeObj.nodes[baseLineObjIdx].attrs.x2 = coords.x / App.scaleFactor
            shapeObj.nodes[baseLineObjIdx].attrs.y2 = coords.y / App.scaleFactor
            //control-point-second
            shapeObj.nodes[controlPointIdx].attrs.cx = coords.x / App.scaleFactor
            shapeObj.nodes[controlPointIdx].attrs.cy = coords.y / App.scaleFactor
            //text
            let vectorCenter = App.vectorCenterPoint(shapeObj.nodes[baseLineObjIdx])
            shapeObj.nodes[textObjIdx].attrs.x = vectorCenter.x
            shapeObj.nodes[textObjIdx].attrs.y = vectorCenter.y
            shapeObj.nodes[textObjIdx].content = App.vectorLength(shapeObj.nodes[baseLineObjIdx])
            //last control-point
            shapeObj.nodes[controlPointIdx].attrs.x = coords.x / App.scaleFactor
            shapeObj.nodes[controlPointIdx].attrs.y = coords.y / App.scaleFactor
        }
    }
    //rect
    App.createRectangle = function(coords) {
        let shapeObj = App.createShapeObject()
        let rectNodeSelectedObj = {
            entity: ENTITY_RECT,
            visible: true,
            attrs: {
                x: coords.x / App.scaleFactor,
                width: 0,
                y: coords.y / App.scaleFactor,
                height: 0
            },
            style: {
                "stroke-width": parseInt(this.currentlineWeight) + 10,
                "stroke-linecap": 'round',
                stroke: '#225577',
                fill: 'none'
            },
            class: [
                'border-highlighted'
            ]
        }

        let rectNodeObj = {
            entity: ENTITY_RECT,
            visible: true,
            attrs: {
                x: coords.x / App.scaleFactor,
                width: 0,
                y: coords.y / App.scaleFactor,
                height: 0
            },
            style: {
                fill: 'none',
                stroke: this.currentColor,
                "stroke-width": parseInt(this.currentlineWeight),
                "stroke-linecap": 'round'
            },
            class: [
                'base'
            ]
        }

        let controlPointsObj = [
            {
                entity: ENTITY_CIRCLE,
                visible: true,
                attrs: {
                    cx: coords.x / App.scaleFactor,
                    cy: coords.y / App.scaleFactor,
                    r: 5
                },
                style: {
                    stroke: '#cccccc',
                    "stroke-opacity": 0.5,
                    "stroke-width": parseInt(this.currentlineWeight)
                },
                class: [
                    'control-point'
                ]
            }
        ]

        this.drawingRectangle = [];
        this.drawingRectangle.initialx = coords.x / App.scaleFactor
        this.drawingRectangle.initialy = coords.y / App.scaleFactor


        shapeObj.nodes.push(rectNodeSelectedObj);
        shapeObj.nodes.push(rectNodeObj);
        shapeObj.nodes = shapeObj.nodes.concat(controlPointsObj);
    }
    App.updateRectangle = function(coords) {
        let shapeObj = App.getCurrentShapeObject()

        let baseRectObjIdx = -1
        let selectedRectObjIdx = -1

        this.drawingRectangle.x =  Math.min(coords.x / App.scaleFactor, this.drawingRectangle.initialx);
        this.drawingRectangle.y =  Math.min(coords.y / App.scaleFactor, this.drawingRectangle.initialy);
        this.drawingRectangle.width = Math.abs(coords.x / App.scaleFactor - this.drawingRectangle.x);
        this.drawingRectangle.height = Math.abs(coords.y / App.scaleFactor - this.drawingRectangle.y);
        if(this.drawingRectangle.width == 0) {
            this.drawingRectangle.width = this.drawingRectangle.initialx - coords.x / App.scaleFactor
        }
        if(this.drawingRectangle.height == 0) {
            this.drawingRectangle.height = this.drawingRectangle.initialy - coords.y / App.scaleFactor
        }

        shapeObj.nodes.forEach((node, idx) => {
            if(node.entity == ENTITY_RECT && node.class.includes('base')) {
                baseRectObjIdx = idx
            }
            if(node.entity == ENTITY_RECT && node.class.includes('border-highlighted')) {
                selectedRectObjIdx = idx
            }
        })

        shapeObj.nodes[baseRectObjIdx].attrs['x'] = this.drawingRectangle.x
        shapeObj.nodes[baseRectObjIdx].attrs['y'] = this.drawingRectangle.y
        shapeObj.nodes[baseRectObjIdx].attrs['width'] = this.drawingRectangle.width
        shapeObj.nodes[baseRectObjIdx].attrs['height'] = this.drawingRectangle.height

        shapeObj.nodes[selectedRectObjIdx].attrs['x'] = this.drawingRectangle.x
        shapeObj.nodes[selectedRectObjIdx].attrs['y'] = this.drawingRectangle.y
        shapeObj.nodes[selectedRectObjIdx].attrs['width'] = this.drawingRectangle.width
        shapeObj.nodes[selectedRectObjIdx].attrs['height'] = this.drawingRectangle.height
    }
    //circle
    App.createCircle = function(coords) {
        let shapeObj = App.createShapeObject()
        let circleNodeSelectedObj = {
            entity: ENTITY_CIRCLE,
            visible: true,
            attrs: {
                cx: coords.x / App.scaleFactor,
                cy: coords.y / App.scaleFactor,
                r: 0
            },
            style: {
                stroke: '#225577',
                "stroke-width": parseInt(this.currentlineWeight) + 10,
                fill: 'none'
            },
            class: [
                'border-highlighted'
            ]
        }

        let circleNodeObj = {
            entity: ENTITY_CIRCLE,
            visible: true,
            attrs: {
                cx: coords.x / App.scaleFactor,
                cy: coords.y / App.scaleFactor,
                r: 0
            },
            style: {
                stroke: this.currentColor,
                "stroke-width": parseInt(this.currentlineWeight),
                fill: 'none'
            },
            class: [
                'base'
            ]
        }

        let controlPointsObj = [
            {
                entity: ENTITY_CIRCLE,
                visible: true,
                attrs: {
                    cx: coords.x / App.scaleFactor,
                    cy: coords.y / App.scaleFactor,
                    r: 5
                },
                style: {
                    stroke: '#cccccc',
                    "stroke-opacity": 0.5,
                    "stroke-width": parseInt(this.currentlineWeight)
                },
                class: [
                    'control-point'
                ]
            }
        ]

        this.drawingRectangle = [];
        this.drawingRectangle.initialx = coords.x / App.scaleFactor
        this.drawingRectangle.initialy = coords.y / App.scaleFactor

        shapeObj.nodes.push(circleNodeSelectedObj);
        shapeObj.nodes.push(circleNodeObj);
        shapeObj.nodes = shapeObj.nodes.concat(controlPointsObj);
    }
    App.updateCircle = function(coords) {
        let shapeObj = App.getCurrentShapeObject()

        let baseCircleObjIdx = -1
        let selectedCircleObjIdx = -1

        this.drawingRectangle.x = this.drawingRectangle.initialx + (coords.x / App.scaleFactor - this.drawingRectangle.initialx)
        this.drawingRectangle.y = this.drawingRectangle.initialy + (coords.y / App.scaleFactor - this.drawingRectangle.initialy)
        this.drawingRectangle.r = Math.max(Math.abs(coords.x / App.scaleFactor - this.drawingRectangle.initialx), Math.abs(coords.y / App.scaleFactor - this.drawingRectangle.initialy))

        shapeObj.nodes.forEach((node, idx) => {
            if(node.entity == ENTITY_CIRCLE && node.class.includes('base')) {
                baseCircleObjIdx = idx
            }
            if(node.entity == ENTITY_CIRCLE && node.class.includes('border-highlighted')) {
                selectedCircleObjIdx = idx
            }
            if(node.class.includes('control-point')) {
                node.attrs['cx'] = this.drawingRectangle.x
                node.attrs['cy'] = this.drawingRectangle.y
            }
        })

        shapeObj.nodes[baseCircleObjIdx].attrs['cx'] = this.drawingRectangle.x
        shapeObj.nodes[baseCircleObjIdx].attrs['cy'] = this.drawingRectangle.y
        shapeObj.nodes[baseCircleObjIdx].attrs['r'] = this.drawingRectangle.r

        shapeObj.nodes[selectedCircleObjIdx].attrs['cx'] = this.drawingRectangle.x
        shapeObj.nodes[selectedCircleObjIdx].attrs['cy'] = this.drawingRectangle.y
        shapeObj.nodes[selectedCircleObjIdx].attrs['r'] = this.drawingRectangle.r
    }
    App.deleteShape = function(element) {
        let dataID = element.getAttribute('data-id')
        App.removeShapeById(dataID)
    }
    App.prepareToMoveByControlPoint = function(coords) {
        let shapesObj = App.get('shapes')
        shapesObj.forEach(shape => {
            shape.nodes.forEach(node => {
                switch(node.entity) {
                    case ENTITY_LINE:
                        {
                            let needsTobeMoved = false
                            let x1 = parseFloat(node.attrs['x1']) * App.scaleFactor
                            let y1 = parseFloat(node.attrs['y1']) * App.scaleFactor
                            if (Math.sqrt((coords.x - x1) * (coords.x - x1) + (coords.y - y1) * (coords.y - y1)) < RADIUS_GLUE_EFFECT) {
                                node.beingMoved = {x1: coords.x, y1: coords.y}
                                needsTobeMoved = true
                            }
                            let x2 = parseFloat(node.attrs['x2']) * App.scaleFactor
                            let y2 = parseFloat(node.attrs['y2']) * App.scaleFactor
                            if (Math.sqrt((coords.x - x2) * (coords.x - x2) + (coords.y - y2) * (coords.y - y2)) < RADIUS_GLUE_EFFECT) {
                                node.beingMoved = {x2: coords.x, y2: coords.y}
                                needsTobeMoved = true
                            }
                            if(needsTobeMoved == true) {
                                shape.nodes.forEach((item) => {
                                    if(item.entity == ENTITY_TEXT) {
                                        item.beingMoved = {x: parseInt(item.attrs['x']), y: parseInt(item.attrs['y'])}
                                    }
                                })
                                App.makeShapeObjectCurrent(shape, true)
                            }
                        }
                        break;
                    case ENTITY_RECT:
                        {
                            let x = parseFloat(node.attrs['x']) * App.scaleFactor
                            let y = parseFloat(node.attrs['y']) * App.scaleFactor
                            if (Math.sqrt((coords.x - x) * (coords.x - x) + (coords.y - y) * (coords.y - y)) < RADIUS_GLUE_EFFECT) {
                                node.beingMoved = {x: coords.x, y: coords.y}
                                App.makeShapeObjectCurrent(shape, true)
                            }
                        }
                        break;
                    case ENTITY_CIRCLE:
                        {
                            let cx = parseFloat(node.attrs['cx']) * App.scaleFactor
                            let cy = parseFloat(node.attrs['cy']) * App.scaleFactor
                            if (Math.sqrt((coords.x - cx) * (coords.x - cx) + (coords.y - cy) * (coords.y - cy)) < RADIUS_GLUE_EFFECT) {
                                node.beingMoved = {cx: coords.x, cy: coords.y}
                                App.makeShapeObjectCurrent(shape, true)
                            }
                        }
                        break;
                    default:
                        break;
                }
            })
        })
    }
    App.moveByControlPoint = function(coords) {
        let shapesObj = App.get('shapes')
        shapesObj.forEach(shape => {
            let lineNode = null
            let textNode = null
            shape.nodes.forEach(node => {
                if (node.beingMoved != undefined) {
                    //todo
                    if (node.entity == ENTITY_LINE) {
                        lineNode = node
                    }
                    //todo
                    if (node.entity == ENTITY_TEXT) {
                        textNode = node
                    }
                    for (let attr in node.beingMoved) {
                        if (['x', 'x1', 'x2', 'cx'].includes(attr)) {
                            node.attrs[attr] = coords.x / App.scaleFactor
                        }
                        if (['y', 'y1', 'y2', 'cy'].includes(attr)) {
                            node.attrs[attr] = coords.y / App.scaleFactor
                        }
                    }
                }
            })
            if(lineNode != null && textNode != null) {
                let vectorCenterCoords = App.vectorCenterPoint(lineNode)
                textNode.attrs['x'] = vectorCenterCoords.x
                textNode.attrs['y'] = vectorCenterCoords.y
                //distance
                textNode.content = this.vectorLength(lineNode)
            }
        })
    }
    App.prepareToMove = function(element, coords) {
        if(element.classList.contains('control-point')) {
            App.movementType = MOVEMENT_TYPE_CONTROL_POINT
            App.prepareToMoveByControlPoint(coords)
        }
        else {
            App.movementType = MOVEMENT_TYPE_SHAPE
            App.prepareToMoveShape(element, coords)
        }
    }
    App.prepareToMoveShape = function(element, coords) {
        if(element && element.parentNode.tagName == 'g' && element.parentNode.classList.contains('shape')) {
            let dataID = element.getAttribute('data-id')
            let shape = App.getCurrentShapeObjectByID(dataID)
            App.makeShapeObjectCurrent(shape)
        }

        this.drawingRectangle = []
        this.drawingRectangle.initialx = coords.x
        this.drawingRectangle.initialy = coords.y

        let shapesObj = App.get('shapes')
        shapesObj.forEach(shape => {
            if (shape.current == true) {
                shape.nodes.forEach(node => {
                    for (let attr in node.attrs) {
                        if (['x', 'x1', 'x2', 'cx', 'y', 'y1', 'y2', 'cy'].includes(attr)) {
                            node.attrs[`beforemove${attr}`] = node.attrs[attr]
                        }
                    }
                })
            }
        })
    }
    App.move = function(coords) {
        if (App.movementType == MOVEMENT_TYPE_CONTROL_POINT) {
            App.moveByControlPoint(coords)
        }
        if (App.movementType == MOVEMENT_TYPE_SHAPE) {
            App.moveByShape(coords)
        }
    }
    App.moveByShape = function(coords) {
        let shapesObj = App.get('shapes')
        shapesObj.forEach(shape => {
            if(shape.current == true) {
                shape.nodes.forEach(node => {
                    for (let attr in node.attrs) {
                        if (['x', 'x1', 'x2', 'cx'].includes(attr)) {
                            let newCoordX = (coords.x - this.drawingRectangle.initialx) / App.scaleFactor
                            node.attrs[attr] = node.attrs[`beforemove${attr}`] + newCoordX
                        }
                        if (['y', 'y1', 'y2', 'cy'].includes(attr)) {
                            let newCoordY = (coords.y - this.drawingRectangle.initialy) / App.scaleFactor
                            node.attrs[attr] = node.attrs[`beforemove${attr}`] + newCoordY
                        }
                    }
                })
            }
        })
    }
    App.stopMovement = function() {
        let shapesObj = App.get('shapes')
        for(let i = 0; i < shapesObj.length; i++) {
            for(let j = 0; j < shapesObj[i].nodes.length; j++) {
                let nodeObj = shapesObj[i].nodes[j]
                if(nodeObj.beingMoved != undefined) {
                    delete nodeObj.beingMoved
                }
            }
        }
    }
    App.glueEffect = function(coords) {
        let shapesObj = App.get('shapes')
        let glueObj = null
        shapesObj.forEach(shape => {
            let selected = false
            shape.nodes.forEach(node => {
                //if element is not being moved, then compare if it needs to be sticked with element which is being moved
                if(node.beingMoved == undefined) {
                    if(node.entity == ENTITY_CIRCLE && node.class.includes('control-point')) {
                        let cx = node.attrs['cx']
                        let cy = node.attrs['cy']
                        if(Math.sqrt((coords.x-cx)*(coords.x-cx) + (coords.y-cy)*(coords.y-cy)) < RADIUS_GLUE_EFFECT) {
                            glueObj = node
                            selected = true
                        }
                    }
                }
                //element which is being moved
                else {
                    selected = true
                }
            })
            if(selected) {
                App.makeShapeObjectCurrent(shape, false)
            }
            else {
                //App.deactivateShapeObject(shape)
            }
        })
        if(glueObj != null) {
            shapesObj.forEach(shape => {
                let lineNode = null
                let textNode = null
                shape.nodes.forEach(node => {
                    //if element is not being moved, then compare if it needs to be sticked with element which is being moved
                    if(node.beingMoved != undefined) {
                        //todo
                        if(node.entity == ENTITY_LINE) {
                            lineNode = node
                        }
                        //todo
                        if(node.entity == ENTITY_TEXT) {
                            textNode = node
                        }
                        for(let attr in node.beingMoved) {
                            if(['x', 'x1', 'x2', 'cx'].includes(attr)) {
                                node.attrs[attr] = glueObj.attrs['cx']
                            }
                            if(['y', 'y1', 'y2', 'cy'].includes(attr)) {
                                node.attrs[attr] = glueObj.attrs['cy']
                            }
                        }
                    }
                })
                if(lineNode != null && textNode != null) {
                    let vectorCenterCoords = App.vectorCenterPoint(lineNode)
                    textNode.attrs['x'] = vectorCenterCoords.x
                    textNode.attrs['y'] = vectorCenterCoords.y
                    //distance
                    textNode.content = this.vectorLength(lineNode)
                }
            })
        }
    }
    App.selectall = function() {
        let shapesObj = App.get('shapes')
        shapesObj.forEach(shape => {
            App.makeShapeObjectCurrent(shape, false)
        })
    }
    App.deselectall = function() {
        let shapesObj = App.get('shapes')
        shapesObj.forEach(shape => {
            App.deactivateShapeObject(shape)
        })
    }
    App.drawText = function(textDetails) {
        let shapeObj = App.createShapeObject()
        let textNodeObj = {
            entity: ENTITY_TEXT,
            visible: true,
            attrs: {
                x: (App.viewBoxWidth / 2) / App.scaleFactor,
                y: (App.viewBoxHeight / 2) / App.scaleFactor
            },
            style: {
                'font-family': `${textDetails.family}`,
                'font-size': `${textDetails.size}px`,
                'font-weight': `${textDetails.font.weight}`,
                'font-style': `${textDetails.font.style}`,
                'fill': `#${textDetails.color}`
            },
            content: textDetails.text
        }
        shapeObj.nodes.push(textNodeObj);
        App.draw()
    }
    App.events = function () {
        //resize
        window.addEventListener('resize', (e) => {
            App.init({})
            App.get('backgroundSVG').setAttribute('viewBox', '0 0 ' + App.viewBoxWidth + ' ' + App.viewBoxHeight)
        })
        //wheel
        App.get('backgroundSVG').addEventListener('wheel', function(e) {
            let step = e.deltaY * App.scrollFactor
            let factorX = step * App.factorX
            let newViewBoxWidth = App.viewBoxWidth + factorX
            if(newViewBoxWidth >  0 && newViewBoxWidth < App.maxClientWidth) {
                App.viewBoxWidth = newViewBoxWidth
            }
            let factorY = step * App.factorY
            let newViewBoxHeight =  App.viewBoxHeight + factorY
            if(newViewBoxHeight >  0 && newViewBoxHeight < App.maxClientHeight) {
                App.viewBoxHeight = newViewBoxHeight
            }
            //scale factor based on width, is it correct?
            App.scaleFactor = App.clientWidth / App.viewBoxWidth
            App.get('backgroundSVG').setAttribute('viewBox', '0 0 ' + App.viewBoxWidth + ' ' + App.viewBoxHeight)
        })
        //document.click
        App.get('backgroundSVG').addEventListener('click', (e) => {
            let currentCoords = {x: e.clientX, y:e.clientY}
            if(this.currentDrawingTool != null) {
                switch (this.currentDrawingTool) {
                    case DRAWING_TOOL_FREE:
                        e.preventDefault() //should it be here?
                        this.paintInAction = !this.paintInAction
                        if(this.paintInAction) {
                            let target = e.target
                            App.prepareToMove(target, currentCoords)
                        }
                        else {
                            App.stopMovement()
                        }
                        break;
                    case DRAWING_TOOL_PENCIL:
                        //start drawing
                        if(this.paintInAction == false) {
                            e.preventDefault() //should it be here?
                            this.paintInAction = true
                            App.createLine(currentCoords)
                        }
                        //stop drawing
                        else {
                            e.preventDefault() //should it be here?
                            this.paintInAction = false
                        }
                        break;
                    case DRAWING_TOOL_RECTANGLE:
                        //start drawing
                        if(this.paintInAction == false) {
                            e.preventDefault() //should it be here?
                            this.paintInAction = true
                            App.createRectangle(currentCoords)
                        }
                        //stop drawing
                        else {
                            e.preventDefault() //should it be here?
                            this.paintInAction = false
                        }
                        break;
                    case DRAWING_TOOL_CIRCLE:
                        //start drawing
                        if(this.paintInAction == false) {
                            e.preventDefault() //should it be here?
                            this.paintInAction = true
                            App.createCircle(currentCoords)
                        }
                        //stop drawing
                        else {
                            e.preventDefault() //should it be here?
                            this.paintInAction = false
                        }
                        break;
                    case DRAWING_TOOL_ERASER:
                        e.preventDefault() //should it be here?
                        App.deleteShape(e.target)
                        break;
                    default:
                        break;
                }
            }
            App.draw()
        })
        App.get('backgroundSVG').addEventListener('mousemove', (e) => {
            let currentCoords = {x: e.clientX, y:e.clientY}
            if(this.currentDrawingTool != null) {
                switch (this.currentDrawingTool) {
                    case DRAWING_TOOL_FREE:
                        if(this.paintInAction) {
                            e.preventDefault()
                            App.move(currentCoords)
                            App.glueEffect(currentCoords)
                        }
                        break;
                    case DRAWING_TOOL_PENCIL:
                        if(this.paintInAction) {
                            e.preventDefault()
                            App.updateLine(currentCoords)
                        }
                        break;
                    case DRAWING_TOOL_RECTANGLE:
                        if(this.paintInAction) {
                            e.preventDefault()
                            App.updateRectangle(currentCoords)
                        }
                        break;
                    case DRAWING_TOOL_CIRCLE:
                        if(this.paintInAction) {
                            e.preventDefault()
                            App.updateCircle(currentCoords)
                        }
                        break;
                    default:
                        break;
                }
            }
            App.draw()
        })

        //custom events from controls
        App.get('backgroundSVG').addEventListener('controls.new', (e) => {
            if(confirm('Вы действительно хотите начать заново?')) {
                App.init({reinit: true})
            }
        })
        //free tool
        App.get('backgroundSVG').addEventListener('controls.free-selected', (e) => {
            App.get('backgroundSVG').setAttribute('style', 'cursor: pointer')
            if(this.paintInAction) {
                App.get('backgroundSVG').dispatchEvent('click')
            }
            this.currentDrawingTool = DRAWING_TOOL_FREE
            this.paintInAction = false
        })
        //pencil tool
        App.get('backgroundSVG').addEventListener('controls.pencil-selected', (e) => {
            App.get('backgroundSVG').setAttribute('style', 'cursor: crosshair')
            if(this.paintInAction) {
                App.get('backgroundSVG').dispatchEvent(new MouseEvent('click', {
                    clientX: e.detail.coords.x,
                    clientY: e.detail.coords.y,
                }))
            }
            this.currentDrawingTool = DRAWING_TOOL_PENCIL
            this.paintInAction = false
        })
        //text tool
        App.get('backgroundSVG').addEventListener('controls.text-filled', (e) => {
            App.drawText(e.detail)
            this.currentDrawingTool = null
            this.paintInAction = false
        })
        //rectangle tool
        App.get('backgroundSVG').addEventListener('controls.rectangle-selected', (e) => {
            if(this.paintInAction) {
                App.get('backgroundSVG').dispatchEvent(new MouseEvent('click', {
                    clientX: e.detail.coords.x,
                    clientY: e.detail.coords.y,
                }))
            }
            this.currentDrawingTool = DRAWING_TOOL_RECTANGLE
            this.paintInAction = false
        })
        //circle tool
        App.get('backgroundSVG').addEventListener('controls.circle-selected', (e) => {
            if(this.paintInAction) {
                App.get('backgroundSVG').dispatchEvent(new MouseEvent('click'))
            }
            this.currentDrawingTool = DRAWING_TOOL_CIRCLE
            this.paintInAction = false
        })
        //eraser
        App.get('backgroundSVG').addEventListener('controls.eraser-selected', (e) => {
            if(this.paintInAction) {
                App.get('backgroundSVG').dispatchEvent(new MouseEvent('click'))
            }
            this.currentDrawingTool = DRAWING_TOOL_ERASER
            this.paintInAction = false
        })
        App.get('backgroundSVG').addEventListener('controls.printer', (e) => {
            this.currentDrawingTool = 'printer'
            //create tmp canvas
            var win = window.open('', 'screenshot', `left=0,top=0,width=${App.get('clientWidth')},height=${App.get('clientHeight')}",toolbar=0,resizable=0`);
            win.document.write(``);
            win.print()
            setTimeout(function() {
                win.close()
            }, 100)
            this.paintInAction = false
        })
        //color picker
        App.get('backgroundSVG').addEventListener('controls.color-picker-color-selected', (e) => {
            this.currentColor = e.detail
        })
        //line-weight
        App.get('backgroundSVG').addEventListener('controls.thickness-has-changed', (e) => {
            this.currentlineWeight = e.detail
        })
        //selectall
        App.get('backgroundSVG').addEventListener('controls.selectall-selected', (e) => {
            App.selectall()
            App.draw()
        })
        //deselectall
        App.get('backgroundSVG').addEventListener('controls.selectall-deselected', (e) => {
            App.deselectall()
            App.draw()
        })
        /*
        this.drawingCanvas.addEventListener('contextmenu', (e) => {
            e.preventDefault()
        })

        */
    }

    return function(params) {
        Object.assign(App.data, params);

        App.init({initial: true});
        App.events();
        let available = {
            get: (key, defaultValue) => {
                return App.get(key, defaultValue)
            },
            selector: () => {
                return App.get('backgroundSVG')
            }
        }
        console.log('%c%s', 'color:green; font-weight: bold', "Have any question? https://github.com/kvelaro")
        return available
    }

})(this);
