```
<script>
    document.addEventListener('DOMContentLoaded', function() {
        let svgEl = document.querySelector('div.main svg')
        let mainApp = App({backgroundSVG: svgEl})
        //todo
        window.mainApp = mainApp
        controls({
            controlButtons: ['color', 'thickness', 'selectall'],
            toolButtons: ['new', 'free', 'pencil', 'text', 'rectangle', 'circle', 'eraser', 'printer'],
            whereToDispathEvents: mainApp.selector()
        })
    })
</script>
<script src='js/jscolor.js'></script>
```
