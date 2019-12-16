const solidityeditor = require('../')

document.title = 'editor-solidity'

const style = document.createElement('style')
style.setAttribute('class', 'base')
style.textContent = [
  '*, *:before, *:after { box-sizing: inherit; }',
  'body { margin: 0; height: 100vh; min-height: 100vh; }',
].join('\n')
document.head.appendChild(style)
// <center><h1> demo: 4x themed play editors </h1></center>`

// function makeBox (color = `hsla(${360*Math.random()},100%,50%,1)`) {
//   var box = document.createElement('div')
//   box.style = `box-sizing: border-box; padding: 10px; border: 3px dashed ${color};`
//   return box
// }
// var boxes = [...Array(4)].map(makeBox)
// boxes.forEach(el => document.body.appendChild(el))
;[solidityeditor({ name: 'contract.sol' }),
// solidityeditor({ value: contract() }, {
//   color1: 'red',
//   color2: 'green',
//   color3: 'yellow',
//   color4: 'olive'
// }),
// solidityeditor({ value: contract() }),
// solidityeditor()
// ].forEach((el, i) => boxes[i].appendChild(el))
].forEach((el, i) => document.body.appendChild(el))

function contract () {
  return `
  pragma solidity 0.5.9;

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
}
