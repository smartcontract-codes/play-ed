const bel = require('bel')
const csjs = require('csjs-inject')

const solcjs = require('solc-js')
const smartcontract = require('smartcontract-app')
const codingeditor = require('coding-editor')

const twm = require('twm')
const menubar = require('menubar')
const getCompilerVersion = require('getCompilerVersion')

const solcversion = require('solc-version/src/processList')

const defaultTheme = require('./theme.js')

// ------------------------------------------------------------------------
// fetch known compiler versions
var list, requestID
;(async () => {
  list = localStorage['list']
  if (!list) {
    list = await fetch('https://solc-bin.ethereum.org/bin/list.json').then(x => x.text())
    localStorage['list'] = list
  }
})()

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
    if (requestID) clearInterval(requestID)
    if (list) {
      _update()
    } else {
      requestID = setInterval(_update, 100)
    }
    function _update () {
      if (list) {
        var source = body.source
        var arr = source.split('\n')
        if (arr[1].startsWith(' *Submitted for verification at Etherscan.io on')) {
          source = arr.slice(4).join('\n')
        }
        editor.el.api.compiler = body.metadata.compilerVersion
        editor.el.api.setValue(source)
        clearInterval(requestID)
        requestID = null
      }
    }
  }
})

// ------------------------------------------------------------------------

module.exports = playeditor

function playeditor (opts = {}, theme = defaultTheme) {
  const id = `/editor/${Object.keys(editors).length}`
  const code = localStorage['source'] || `
/*
You can use Play editor with any contract.
Paste it in the editor and wait for the preview to start interacting with it.

**To interact with the contract you will need a Metamask extension.
*/


pragma solidity 0.5.12;

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
  ed.el.api.compiler = localStorage['compiler']
  var select, releases, nightly, all
  update()
  // window.addEventListener('keydown', (e) => {
  //   if (e.ctrlKey === true && e.key === 's') {
  //     e.preventDefault()
  //     //update()
  //   }
  // })
  async function update (version) {
    ed.el.api.compiler = void 0
    const sourcecode = ed.el.api.getValue()

    if (!version) {
      if (!select) {
        select = await solcjs.versions()
        releases = select.releases
        nightly = select.nightly
        all = select.all
      }
      version = getCompilerVersion(releases, sourcecode) || releases[0]
    } else {
      const _list = solcversion(list)
      version = Object.entries(_list.all).filter(x => x[1] === `soljson-${version}.js`)[0][0]
    }
    localStorage['source'] = sourcecode
    localStorage['compiler'] = version

    var id = setTimeout(async () => {
      scapp.el.innerHTML = ''
      try {
        const compiler = await solcjs(version)
        var result = await compiler(sourcecode)
      } catch (e) {
        const stack = e.stack
        var el
        if (stack) {
          //const errormsg = JSON.stringify(stack.split('\n'), 0, 2)
          const errormsg = `Error: Contract could not be compiled. Try another
          pragma solidity version.`
          el = bel`<pre class=${css.errormsg}>${errormsg}</pre>`
          // @todo: pretest stuff
        } else {
          const errormsg = JSON.stringify(e, 0, 2)
          el = bel`<pre class=${css.errormsg}">${errormsg}</pre>`
        }
        scapp.el.innerHTML = ''
        scapp.el.appendChild(el)
        output.el.textContent = ''
        return
      }
      var el = smartcontract(result)
      scapp.el.innerHTML = ''
      scapp.el.appendChild(el)
      output.el.textContent = JSON.stringify(result, 0, 2)
    }, 0)
  }
  ed.el.api.on('change', debounce((api) => update(api.compiler)))

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

  const out = { el: bel`<pre>{}</pre>`, name: 'output.json' }
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
  .errormsg {
    color: #eaecee;
    padding: 2rem 0 0 2rem;
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
