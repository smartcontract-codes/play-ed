const bel = require('bel')
const csjs = require('csjs-inject')

const solcjs = require('solc-js')
const smartcontract = require('smartcontract-app')
const codingeditor = require('coding-editor')

const twm = require('twm')
const menubar = require('menubar')
const getCompilerVersion = require('getCompilerVersion')

const defaultTheme = require('./theme.js')

// ------------------------------------------------------------------------
// blinking title notification
var x = void 0, y = void 0, title = void 0
setTimeout(() => (title = document.title), 0)
function updateTitle () {
  var bool = true
  x = setInterval(() => {
    document.title = (bool = !bool) ? '[💚] ' + title : '[💜] ' + title
  }, 100)
  y = setTimeout(() => {
    clearInterval(x)
    document.title = title
    y = x = void 0
  }, 10000)
}
function clearTitle () {
  if (x && y) {
    clearInterval(x)
    clearInterval(y)
    x = y = void 0
    document.title = title
  }
}
// document.addEventListener('visibilitychange', function () {
//   if (document.hidden)
//   document.title = document.hidden; // change tab text for demo
// })
window.addEventListener('focus', clearTitle)

// window.addEventListener('blur', function() { document.title = 'not focused' })
// ------------------------------------------------------------------------
// FRAME COMMUNICATION 1/2
var counter = 1
const editors = {}

window.addEventListener('message', event => {
  if (event.source === window.opener) {
    const [id, from, path, ref, type, body] = event.data
    console.log('[opener]', [id, from, path, ref, type, body])
    var editor = editors[path]
    if (!editor) console.error('unexpected message')
    clearTitle()
    if (document.hidden) updateTitle()

    editor.el.api.setValue(body.data)
  }
})

// ------------------------------------------------------------------------

module.exports = playeditor

function playeditor (opts = {}, theme = defaultTheme) {
  const id = `/editor/${Object.keys(editors).length}`
  const code = `
/*
You can use Play editor with any contract.
Paste it in the editor and wait for the preview to start interacting with it.

**To interact with the contract you will need a Metamask extension.
*/


pragma solidity >=0.4.0 <0.7.0;

contract SimpleStorage {

    uint8 storedData;

    function set(uint8 x) public {
        storedData = x;
    }

    function get() public view returns (uint8) {
        return storedData;
    }

}
`
  const ed = {
    name: opts.name || 'contract.sol',
    el: codingeditor({
      value: opts.value || code,
      lineNumbers: true,
    }, theme),
  }
  var select, releases, nightly, all
  update()
  async function update () {
    if (!select) {
      select = await solcjs.versions()
      releases = select.releases
      nightly = select.nightly
      all = select.all
    }
    const sourcecode = ed.el.api.getValue()
    const version = getCompilerVersion(releases, sourcecode)
    const compiler = await solcjs(version)
    var id = setTimeout(async () => {
      try {
        var result = await compiler(sourcecode)
      } catch (e) {
        var el = bel`<pre style="color: red;">${JSON.stringify(e, 0 , 2)}</pre>`
        scapp.el.innerHTML = ''
        scapp.el.appendChild(el)
        output.el.textContent = ''
        return
      }
      var el = smartcontract(result)
      scapp.el.innerHTML = ''
      scapp.el.appendChild(el)
      output.el.textContent = JSON.stringify(result)
    }, 0)
  }
  ed.el.api.on('change', debounce((api) => update()))

  // ------------------------------------------------------------------------
  // FRAME COMMUNICATION 2/2

  editors[id] = ed
  if (window.opener) window.opener.postMessage([
    counter++,       // id (= message id)
    id,              // from
    `/`,             // path
    0,               // ref (=initiate new communucation)
    'ready',         // type
    void 0           // body
  ], '*')

  // ------------------------------------------------------------------------

  const out = { el: bel`<p>OUTPUT</b>`, name: 'output.json' }
  const sc = { el: bel`<div style="height:100%;"></div>`, /*name: 'preview'*/ }
  var items = [
    // { title: 'editor',
    //     fn: e => {
    //     mosaic.api({ cmd: 'show', target: editor })
    //     mosaic.api({ cmd: 'hide', target: scapp })
    //     var height = ed.el.getBoundingClientRect().height
    //     var width = window.innerWidth
    //     ed.el.api.resize({ width, height })
    //   }
    // },
    // { active: true, title: 'both',
    //   fn: e => {
    //     mosaic.api({ cmd: 'show', target: editor })
    //     mosaic.api({ cmd: 'show', target: scapp })
    //     var height = ed.el.getBoundingClientRect().height
    //     var width = window.innerWidth / 2
    //     ed.el.api.resize({ width, height })
    //   }
    // },
    // { title: 'preview',
    //     fn: e => {
    //     mosaic.api({ cmd: 'hide', target: editor })
    //     mosaic.api({ cmd: 'show', target: scapp })
    //     var height = 0 // ed.el.getBoundingClientRect().height
    //     var width = 0 // window.innerWidth / 2
    //     ed.el.api.resize({ width, height })
    //   }
    // },
  ]
  const mb = { el: menubar({ items, theme }) }
  const mosaic = (theme !== defaultTheme ? twm(theme) : used++ ? twm : twm(theme))`
    [[${ed}]] ${out} | ${sc}
    ${mb}`
  const [,[,[,editor, output],[,scapp]],[,navbar]] = Array.from(mosaic)
  mosaic.on('resize', event => {
    console.log('dosomething! ...maybe - to fix size')
    // window.addEventListener('resize', event => {
    //   // @TODO: this task needs to be performed by the `twm` instead
    //   var height = ed.el.getBoundingClientRect().height
    //   var width = window.innerWidth
    //   ed.el.api.resize({ width: width / 2, height })
    // })
    setTimeout(() => ed.el.api.resize('auto'))
  })
  return mosaic
  // bel`<div class=${css.playeditor}>${mosaic}</div>`
}
var used = 0

const css = csjs`
  .playeditor {
    box-sizing: border-box;
    background-color: pink;
    border: 5px solid red;
    flex-grow: 1;
    height: 100%;
    width: 100%;
  }
`
/******************************************************************************
  HELPER
******************************************************************************/
function debounce (fn) {
  const wait = 100
  var timeout, context, args
  const exec = () => {
    fn.apply(context, args)
    timeout = undefined
  }
  return function () {
    context = this
    args = arguments
    if (timeout) return
    timeout = setTimeout(exec, wait)
  }
}
