const bel = require('bel')
const csjs = require('csjs-inject')

const solcjs = require('solc-js')
const smartcontract = require('smartcontract-app')
const codingeditor = require('coding-editor')

const tiler = require('tiler')

const menubar = require('menubar')

module.exports = playeditor

function playeditor (opts = {}) {
  const ed = {
    name: 'contract.sol',
    el: codingeditor({
      value: `
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
    }),
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
      var metadata = compiler.compile(sourcecode)
      console.log(metadata)
      var el = smartcontract({ metadata })
      scapp.el.innerHTML = ''
      scapp.el.appendChild(el)
      output.el.textContent = JSON.stringify(metadata)
    }
  }
  ed.el.api.on('change', debounce((api) => update()))
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
  const out = { el: bel`<p>OUTPUT</b>`, name: 'output' }
  const sc = { el: bel`<div></div>`, name: 'preview' }
  const mb = { el: menubar(), name: 'navbar' }
  const mosaic = tiler`
    [${ed}] ${out} | ${sc}
    ${mb}`
  const [,[,[,editor, output],[,scapp]],[,navbar]] = Array.from(mosaic)
  return bel`<div class=${css.playeditor}>${mosaic}</div>`
}

const css = csjs`
  .playeditor {
    background-color: pink;
    height: 100%;
    width: 100%;
  }
`
