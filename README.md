# editor-solidity
embeddable solidity editor

# usage (module) - `this module is work in progress`
`npm install editor-solidity`
```js
const solidityeditor = require('editor-solidity')

// for now, see `demo.js`
```

# usage (iframe) - `this module is work in progress`
```html
<!doctype html>
<html>
  <head><meta charset="utf-8"></head>
  <body>
    <iframe src="https://ethereum-play.github.io/play-editor"></iframe>
    <script>
      var solidityeditor = document.querySelector('iframe')

      // @TODO: not yet fully implemented

      // @NOTE: it is possible to .postMessage file content to the iframe editor
      //        which will be opened

    </script>
  </body>
</html>
```
