let controls = (function (g) {
    "use strict"

    let generic = {}
    //https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    generic.componentToHex = function (c) {
        var hex = parseInt(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    generic.rgbToHex = function (r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    let Controls = {
        color: '#000',
        lineWeight: 1
    }
    Controls.createButton = (buttonName, parentElement, entity) => {
        if(Controls[buttonName] != undefined) {
            Controls[buttonName](parentElement, entity)
        }
    }
    Controls.removeButtonActiveState = () => {
        App.buttons.forEach((element) => {
            element.classList.remove('active')
        })
    }
    Controls.removeActiveStates = function(childNodes) {
        childNodes.forEach((node) => {
            node.classList.remove('active')
        })
    }
    Controls.new = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-new"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.new', {
                detail: {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            }))
        })
    }
    Controls.free = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-free"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            Controls.removeButtonActiveState()
            buttonElement.classList.add('active')
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.free-selected', {
                detail: {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            }))
        })
    }
    Controls.pencil = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-pencil"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            Controls.removeButtonActiveState()
            buttonElement.classList.add('active')
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.pencil-selected', {
                detail: {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            }))
        })
    }
    Controls.text = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-text"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)

        let formDiv = document.createElement('form')

        let txtLabel = document.createElement('label')
        txtLabel.setAttribute('for', 'txt')
        txtLabel.innerText = 'Текст'

        let txtTextarea = document.createElement('textarea')
        txtTextarea.setAttribute('name', 'txt')
        txtTextarea.setAttribute('id', 'txt')
        txtTextarea.setAttribute('placeholder', 'Текст..')

        let txtSizeLabel = document.createElement('label')
        txtSizeLabel.setAttribute('for', 'txtSize')
        txtSizeLabel.innerText = 'Размер текста'

        let txtSizeInput = document.createElement('input')
        txtSizeInput.setAttribute('type', 'range')
        txtSizeInput.setAttribute('id', 'txtSize')
        txtSizeInput.setAttribute('min', '10')
        txtSizeInput.setAttribute('max', '50')
        txtSizeInput.setAttribute('step', '2')
        txtSizeInput.setAttribute('value', '12')

        let fntLabel = document.createElement('label')
        fntLabel.setAttribute('for', 'fnt')
        fntLabel.innerText = 'Шрифт'

        let fntSelect = document.createElement('select')
        fntSelect.setAttribute('name', 'fnt')
        fntSelect.setAttribute('id', 'fnt')

        let fntList = [
            {name: 'Lato'},
            {name: 'Lemonada'},
            {name: 'Roboto'},
            {name: 'Sriracha'}
        ];
        for(let item in fntList) {
            let fntOption = document.createElement('option')
            fntOption.setAttribute('value', fntList[item].name)
            fntOption.innerText = fntList[item].name
            fntSelect.insertAdjacentElement('beforeend', fntOption)
        }

        let fntWeightLabel = document.createElement('label')
        fntWeightLabel.setAttribute('for', 'fntweight')
        fntWeightLabel.innerText = 'Толщина шрифта'

        let fntWeightSelect = document.createElement('select')
        fntWeightSelect.setAttribute('name', 'fntweight')
        fntWeightSelect.setAttribute('id', 'fntweight')

        let fntWeightList = [
            {name: 'Normal'},
            {name: 'Bold'},
            {name: 'Bolder'},
            {name: 'Lighter'}
        ];
        for(let item in fntWeightList) {
            let fntOption = document.createElement('option')
            fntOption.setAttribute('value', fntWeightList[item].name)
            fntOption.innerText = fntWeightList[item].name
            fntWeightSelect.insertAdjacentElement('beforeend', fntOption)
        }

        let fntStyleLabel = document.createElement('label')
        fntStyleLabel.setAttribute('for', 'fntstyle')
        fntStyleLabel.innerText = 'Стиль шрифта'

        let fntStyleSelect = document.createElement('select')
        fntStyleSelect.setAttribute('name', 'fntstyle')
        fntStyleSelect.setAttribute('id', 'fntstyle')

        let fntStyleList = [
            {name: 'Normal'},
            {name: 'Italic'}
        ];
        for(let item in fntStyleList) {
            let fntOption = document.createElement('option')
            fntOption.setAttribute('value', fntStyleList[item].name)
            fntOption.innerText =  fntStyleList[item].name
            fntStyleSelect.insertAdjacentElement('beforeend', fntOption)
        }

        let fntColorLabel = document.createElement('label')
        fntColorLabel.setAttribute('for', 'fntcolor')
        fntColorLabel.innerText = 'Цвет шрифта'

        let fntColorInput = document.createElement('input')
        fntColorInput.setAttribute('type', 'text')
        fntColorInput.setAttribute('id', 'fntcolor')
        fntColorInput.setAttribute('name', 'fntcolor')
        fntColorInput.setAttribute('value', 'ab2567')
        fntColorInput.classList.add('jscolor')


        let fntShadowXLabel = document.createElement('label')
        fntShadowXLabel.setAttribute('for', 'shadowx')
        fntShadowXLabel.innerText = 'ShadowX'

        let fntShadowXInput = document.createElement('input')
        fntShadowXInput.setAttribute('type', 'range')
        fntShadowXInput.setAttribute('id', 'shadowx')
        fntShadowXInput.setAttribute('min', '0')
        fntShadowXInput.setAttribute('max', '5')
        fntShadowXInput.setAttribute('step', '1')
        fntShadowXInput.setAttribute('value', '0')

        let fntShadowYLabel = document.createElement('label')
        fntShadowYLabel.setAttribute('for', 'shadowy')
        fntShadowYLabel.innerText = 'ShadowY'

        let fntShadowYInput = document.createElement('input')
        fntShadowYInput.setAttribute('type', 'range')
        fntShadowYInput.setAttribute('id', 'shadowy')
        fntShadowYInput.setAttribute('min', '0')
        fntShadowYInput.setAttribute('max', '5')
        fntShadowYInput.setAttribute('step', '1')
        fntShadowYInput.setAttribute('value', '0')

        let fntShadowBlurLabel = document.createElement('label')
        fntShadowBlurLabel.setAttribute('for', 'shadowblur')
        fntShadowBlurLabel.innerText = 'ShadowBlur'

        let fntShadowBlurInput = document.createElement('input')
        fntShadowBlurInput.setAttribute('type', 'range')
        fntShadowBlurInput.setAttribute('id', 'blur')
        fntShadowBlurInput.setAttribute('min', '0')
        fntShadowBlurInput.setAttribute('max', '5')
        fntShadowBlurInput.setAttribute('step', '1')
        fntShadowBlurInput.setAttribute('value', '0')



        let submitZone = document.createElement('div')
        submitZone.classList.add('font-controls')

        let submitBtn = document.createElement('input')
        submitBtn.setAttribute('type', 'button')
        submitBtn.setAttribute('value', 'Добавить')
        submitBtn.classList.add('success')
        submitZone.insertAdjacentElement('beforeend', submitBtn)

        let cancelZone = document.createElement('div')
        cancelZone.classList.add('font-controls')

        let cancelBtn = document.createElement('input')
        cancelBtn.setAttribute('type', 'button')
        cancelBtn.setAttribute('value', 'Отменить')
        cancelBtn.classList.add('warning')
        cancelZone.insertAdjacentElement('beforeend', cancelBtn)

        formDiv.insertAdjacentElement('beforeend', txtLabel)
        formDiv.insertAdjacentElement('beforeend', txtTextarea)

        formDiv.insertAdjacentElement('beforeend', txtSizeLabel)
        formDiv.insertAdjacentElement('beforeend', txtSizeInput)

        formDiv.insertAdjacentElement('beforeend', fntLabel)
        formDiv.insertAdjacentElement('beforeend', fntSelect)

        formDiv.insertAdjacentElement('beforeend', fntWeightLabel)
        formDiv.insertAdjacentElement('beforeend', fntWeightSelect)

        formDiv.insertAdjacentElement('beforeend', fntStyleLabel)
        formDiv.insertAdjacentElement('beforeend', fntStyleSelect)

        formDiv.insertAdjacentElement('beforeend', fntColorLabel)
        formDiv.insertAdjacentElement('beforeend', fntColorInput)

        formDiv.insertAdjacentElement('beforeend', fntShadowXLabel)
        formDiv.insertAdjacentElement('beforeend', fntShadowXInput)

        formDiv.insertAdjacentElement('beforeend', fntShadowYLabel)
        formDiv.insertAdjacentElement('beforeend', fntShadowYInput)

        formDiv.insertAdjacentElement('beforeend', fntShadowBlurLabel)
        formDiv.insertAdjacentElement('beforeend', fntShadowBlurInput)

        formDiv.insertAdjacentElement('beforeend', submitZone)
        formDiv.insertAdjacentElement('beforeend', cancelZone)


        let fntControls = document.createElement('div')
        fntControls.classList.add('font-controls')
        fntControls.insertAdjacentElement('beforeend', formDiv)

        let fntText = document.createElement('div')
        fntText.classList.add('font-text')

        let fntTextInner = document.createElement('div')
        fntTextInner.classList.add('preview-text')

        fntText.insertAdjacentElement('beforeend', fntTextInner)

        let modalContent = document.createElement('div')
        modalContent.classList.add('modal-content')
        modalContent.insertAdjacentElement('beforeend', fntControls)
        modalContent.insertAdjacentElement('beforeend', fntText)

        let modalTextDiv = document.createElement('div')
        modalTextDiv.classList.add('text-modal')
        modalTextDiv.classList.add('modal')
        modalTextDiv.insertAdjacentElement('beforeend', modalContent)

        let modalDiv = document.querySelector('#modals')
        modalDiv.insertAdjacentElement('beforeend', modalTextDiv)

        //events
        buttonElement.addEventListener('click', (e) => {
            Controls.removeButtonActiveState()
            buttonElement.classList.add('active')
            modalTextDiv.setAttribute('style', 'display: block !important')
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.text-selected'))
        })

        txtTextarea.addEventListener('input', (e) => {
            fntTextInner.innerHTML = e.target.value
        })
        txtSizeInput.addEventListener('change', (e) => {
            fntTextInner.style.fontSize = e.target.value + 'px'
        })
        fntSelect.addEventListener('change', (e) => {
            fntTextInner.style.fontFamily = fntList[fntSelect.selectedIndex].name
        })
        fntWeightSelect.addEventListener('change', (e) => {
            fntTextInner.style.fontWeight = fntWeightList[fntWeightSelect.selectedIndex].name
        })
        fntStyleSelect.addEventListener('change', (e) => {
            fntTextInner.style.fontStyle = fntStyleList[fntStyleSelect.selectedIndex].name
        })
        fntShadowXInput.addEventListener('change', (e) => {
            fntTextInner.style.textShadow = `${e.target.value}px ${fntShadowYInput.value}px ${fntShadowBlurInput.value}px #000`
        })
        fntShadowYInput.addEventListener('change', (e) => {
            fntTextInner.style.textShadow = `${fntShadowXInput.value}px ${e.target.value}px ${fntShadowBlurInput.value}px #000`
        })
        fntShadowBlurInput.addEventListener('change', (e) => {
            fntTextInner.style.textShadow = `${fntShadowXInput.value}px ${fntShadowYInput.value}px ${e.target.value}px #000`
        })
        submitBtn.addEventListener('click', (e) => {
            let textDetails = {
                text: txtTextarea.value,
                size: txtSizeInput.value * 3,
                font: {
                    family: fntList[fntSelect.selectedIndex].name,
                    weight: fntWeightList[fntWeightSelect.selectedIndex].name,
                    style: fntStyleList[fntStyleSelect.selectedIndex].name
                },
                color: fntColorInput.value,
                shadowX: fntShadowXInput.value,
                shadowY: fntShadowYInput.value,
                shadowBlur: fntShadowBlurInput.value
            };
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.text-filled', {detail: textDetails}))
            modalTextDiv.setAttribute('style', 'display: none !important')
        })
        cancelBtn.addEventListener('click', (e) => {
            modalTextDiv.setAttribute('style', 'display: none !important')
        })
    }
    Controls.rectangle = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-rectangle"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            Controls.removeButtonActiveState()
            buttonElement.classList.add('active')
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.rectangle-selected', {
                detail: {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            }))
        })
    }
    Controls.circle = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-circle"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            Controls.removeButtonActiveState()
            buttonElement.classList.add('active')
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.circle-selected', {
                detail: {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            }))
        })
    }
    Controls.eraser = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-eraser"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            Controls.removeButtonActiveState()
            buttonElement.classList.add('active')
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.eraser-selected', {
                detail: {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            }))
        })
    }
    Controls.printer = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-printer"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            Controls.removeButtonActiveState()
            buttonElement.classList.add('active')
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.printer', {
                detail: {
                    coords: {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            }))
        })
    }
    Controls.color = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-color"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        let modals = document.querySelector('#modals')
        //context menu
        let contextMenu = document.createElement('div')
        contextMenu.classList.add('context-menu')
        contextMenu.classList.add('hidden')
        //color picker modal
        let colorPicker = document.createElement('div')
        colorPicker.classList.add('color-picker')
        let i, j, k, r, g, b, rgb;
        for (i = 0; i <= 255; i += 50) {
            for (j = 0; j <= 255; j += 50) {
                for (k = 0; k <= 255; k += 50) {
                    r = i.toString(16).padStart(2, '0')
                    g = j.toString(16).padStart(2, '0')
                    b = k.toString(16).padStart(2, '0')
                    rgb = '#' + r + g + b
                    let coloredDiv = document.createElement('div')
                    coloredDiv.classList.add('color-picker-item')
                    coloredDiv.style.cssText = `background-color: ${rgb}`
                    colorPicker.insertAdjacentElement('beforeend', coloredDiv)
                }
            }
        }
        contextMenu.insertAdjacentElement('beforeend', colorPicker)
        modals.insertAdjacentElement('beforeend', contextMenu)
        let onColorPalette = false
        //on hover color palette should be visible
        buttonElement.addEventListener('mouseenter', (e) => {
            contextMenu.setAttribute('style', `left: ${e.clientX}px; top: ${e.clientY}px;`)
            contextMenu.classList.remove('hidden')
            onColorPalette = true
        })
        buttonElement.addEventListener('mouseleave', (e) => {
            if(!onColorPalette) {
                contextMenu.classList.add('hidden')
            }
        })
        //when mouse leaves specified zone
        contextMenu.addEventListener('mouseleave', (e) => {
            contextMenu.classList.add('hidden')
            onColorPalette = false
        })
        //when user selects one of colors
        contextMenu.addEventListener('click', (e) => {
            let element = e.target
            let regex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/
            let color = element.style['background-color']
            var match = regex.exec(color);
            if (match && App.data.whereToDispathEvents != null) {
                Controls.color = generic.rgbToHex(match[1], match[2], match[3]);
                buttonElement.setAttribute('style', `background-color: ${Controls.color}`)
                App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.color-picker-color-selected', {detail: Controls.color}))
            }
            contextMenu.classList.add('hidden')
        })
    }
    Controls.thickness = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-thickness"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        let modals = document.querySelector('#modals')
        //context menu
        let contextMenu = document.createElement('div')
        contextMenu.classList.add('context-menu')
        contextMenu.classList.add('hidden')
        //thickness modal
        let thicknessElement = document.createElement('div')
        thicknessElement.classList.add('thickness')
        let html = `
            <div class="" data-id="2"><hr style="border: 2px solid #555"/></div>
            <div class="" data-id="4"><hr style="border: 4px solid #555"/></div>
            <div class="" data-id="6"><hr style="border: 6px solid #555"/></div>
            <div class="" data-id="8"><hr style="border: 8px solid #555"/></div>
            <div class="" data-id="10"><hr style="border: 10px solid #555"/></div>
            <div class="" data-id="12"><hr style="border: 12px solid #555"/></div>
            <div class="" data-id="14"><hr style="border: 14px solid #555"/></div>
            <div class="" data-id="16"><hr style="border: 16px solid #555"/></div>
            <div class="" data-id="18"><hr style="border: 18px solid #555"/></div>
            <div class="" data-id="20"><hr style="border: 20px solid #555"/></div>`
        thicknessElement.insertAdjacentHTML('beforeend', html)
        contextMenu.insertAdjacentElement('beforeend', thicknessElement)
        modals.insertAdjacentElement('beforeend', contextMenu)

        contextMenu.addEventListener('click', (e) => {
            let thickOptions = thicknessElement.querySelectorAll('.btn')
            Controls.removeActiveStates(thickOptions)
            let element = e.target
            let temp = element
            if(element.tagName.toLowerCase() == 'hr') {
                temp = element.parentElement
            }
            Controls.lineWeight = temp.getAttribute('data-id') || 1;
            App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.thickness-has-changed', {detail: Controls.lineWeight}))
            contextMenu.classList.add('hidden')
        })
        contextMenu.addEventListener('mouseleave', (e) => {
            contextMenu.classList.add('hidden')
        })
        //when user selects one of line weights
        buttonElement.addEventListener('click', (e) => {
            contextMenu.setAttribute('style', `left: ${e.clientX}px; top: ${e.clientY}px;`)
            contextMenu.classList.remove('hidden')
        })
    }
    Controls.selectall = (parentElement, entity) => {
        let buttonOuter = 'div';
        let buttonElement = document.createElement(buttonOuter)
        buttonElement.classList.add('btn')
        buttonElement.insertAdjacentHTML('beforeend', '<i class="btn-selectall"></i>')
        parentElement.insertAdjacentElement('beforeend', buttonElement)
        App[entity].push(buttonElement)
        buttonElement.addEventListener('click', (e) => {
            if(buttonElement.classList.contains('active')) {
                buttonElement.classList.remove('active')
                App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.selectall-deselected'))
            }
            else {
                buttonElement.classList.add('active')
                App.data.whereToDispathEvents.dispatchEvent(new CustomEvent('controls.selectall-selected'))

            }
        })
    }

    let App = {
        buttons: [],
        tools: [],
        data: {
            controlButtons: [],
            toolButtons: [],
            whereToDispathEvents: null
        }
    }
    App.init = function () {
        //general tools
        let toolButtons = document.querySelector('#tools')
        this.data.toolButtons.forEach((button) => {
            Controls.createButton(button, toolButtons, 'buttons')
        })
        //additional panels
        let controlButtons = document.querySelector('#controls')
        this.data.controlButtons.forEach((button) => {
            Controls.createButton(button, controlButtons, 'tools')
        })
    }

    App.events = function () {

    }

    return (params) => {
        Object.assign(App.data, params)
        App.init();
        App.events();
    }
})(this);


