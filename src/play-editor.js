const bel = require('bel')
const csjs = require('csjs-inject')

const solcjs = require('solc-js')
const smartcontract = require('smartcontract-app')
const codingeditor = require('coding-editor')

const twm = require('twm')
const menubar = require('menubar')

const defaultTheme = require('./theme.js')

module.exports = playeditor

function playeditor (opts = {}, theme = defaultTheme) {
  const ed = {
    name: opts.name || 'contract.sol',
    el: codingeditor({
      value: opts.value || `
      pragma solidity ^0.4.17;
contract Mortal {
    /* Define variable owner of the type address */
    address owner;

    /* This function is executed at initialization and sets the owner of the contract */
    function Mortal() { owner = msg.sender; }

    /* Function to recover the funds on the contract */
    function kill() { if (msg.sender == owner) selfdestruct(owner); }
}

contract Greeter is Mortal {
    /* Define variable greeting of the type string */
    string greeting;

    /* This runs when the contract is executed */
    function Greeter(string _greeting) public {
        greeting = _greeting;
    }

    /* Main function */
    function greet() constant returns (string) {
        return greeting;
    }
}
      `,
      lineNumbers: true,
    }, theme),
  }
  var compiler
  solcjs.version2url((err, select) => {
    var latest = select.releases[0]
    select(latest, (err, url) => {
      solcjs(url, (err, solc) => {
        compiler = solc
        update()
      })
    })
  })
  function update () {
    if (compiler) {
      var sourcecode = ed.el.api.getValue()
      var id = setTimeout(async () => {
        var result = await compiler(sourcecode)
        var opts = {
          metadata: {
            compiler: { version: result[0].compiler.version },
            language: result[0].compiler.language,
            output: {
              abi: JSON.parse(result[0].abi),
              devdoc: result[0].metadata.devdoc,
              userdoc: result[0].metadata.userdoc
            },
            settings: {
              compilationTarget: { '': result[0].sources.compilationTarget },
              evmVersion: result[0].compiler.evmVersion,
              libraries: result[0].sources.libraries,
              optimizer: { enabled: result[0].compiler.optimizer, runs: result[0].compiler.runs },
              remapings: result[0].sources.remappings
            },
            sources: { '': result[0].sources.sourcecode }
          }
        }
        var el = smartcontract(opts)
        scapp.el.innerHTML = ''
        scapp.el.appendChild(el)
        output.el.textContent = JSON.stringify(opts)
        console.log('dosomething! ...maybe')
        setTimeout(() => ed.el.api.resize('auto'))
        window.EDITOR = ed.el.api
      }, 0)
    }
  }
  ed.el.api.on('change', debounce((api) => update()))
  const out = { el: bel`<p>OUTPUT</b>`, name: 'output.json' }
  const sc = { el: bel`<div style="height:100%;"></div>`, /*name: 'preview'*/ }
  var items = [
    { title: 'editor',
        fn: e => {
        mosaic.api({ cmd: 'show', target: editor })
        mosaic.api({ cmd: 'hide', target: scapp })
        var height = ed.el.getBoundingClientRect().height
        var width = window.innerWidth
        ed.el.api.resize({ width, height })
      }
    },
    { active: true, title: 'both',
      fn: e => {
        mosaic.api({ cmd: 'show', target: editor })
        mosaic.api({ cmd: 'show', target: scapp })
        var height = ed.el.getBoundingClientRect().height
        var width = window.innerWidth / 2
        ed.el.api.resize({ width, height })
      }
    },
    { title: 'preview',
        fn: e => {
        mosaic.api({ cmd: 'hide', target: editor })
        mosaic.api({ cmd: 'show', target: scapp })
        var height = 0 // ed.el.getBoundingClientRect().height
        var width = 0 // window.innerWidth / 2
        ed.el.api.resize({ width, height })
      }
    },
  ]
  const mb = { el: menubar({ items, theme }) }
  const mosaic = (theme !== defaultTheme ? twm(theme) : used++ ? twm : twm(theme))`
    [[${ed}]] ${out} | ${sc}
    ${mb}`
  const [,[,[,editor, output],[,scapp]],[,navbar]] = Array.from(mosaic)
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
