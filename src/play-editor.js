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
      pragma solidity >=0.4.22 <0.6.0;
      contract Ballot {

          struct Voter {
              uint weight;
              bool voted;
              uint8 vote;
              address delegate;
          }
          struct Proposal {
              uint voteCount;
          }

          address chairperson;
          mapping(address => Voter) voters;
          Proposal[] proposals;

          /// Create a new ballot with $(_numProposals) different proposals.
          constructor(uint8 _numProposals) public {
              chairperson = msg.sender;
              voters[chairperson].weight = 1;
              proposals.length = _numProposals;
          }

          /// Give $(toVoter) the right to vote on this ballot.
          /// May only be called by $(chairperson).
          function giveRightToVote(address toVoter) public {
              if (msg.sender != chairperson || voters[toVoter].voted) return;
              voters[toVoter].weight = 1;
          }

          /// Delegate your vote to the voter $(to).
          function delegate(address to) public {
              Voter storage sender = voters[msg.sender]; // assigns reference
              if (sender.voted) return;
              while (voters[to].delegate != address(0) && voters[to].delegate != msg.sender)
                  to = voters[to].delegate;
              if (to == msg.sender) return;
              sender.voted = true;
              sender.delegate = to;
              Voter storage delegateTo = voters[to];
              if (delegateTo.voted)
                  proposals[delegateTo.vote].voteCount += sender.weight;
              else
                  delegateTo.weight += sender.weight;
          }

          /// Give a single vote to proposal $(toProposal).
          function vote(uint8 toProposal) public {
              Voter storage sender = voters[msg.sender];
              if (sender.voted || toProposal >= proposals.length) return;
              sender.voted = true;
              sender.vote = toProposal;
              proposals[toProposal].voteCount += sender.weight;
          }

          function winningProposal() public view returns (uint8 _winningProposal) {
              uint256 winningVoteCount = 0;
              for (uint8 prop = 0; prop < proposals.length; prop++)
                  if (proposals[prop].voteCount > winningVoteCount) {
                      winningVoteCount = proposals[prop].voteCount;
                      _winningProposal = prop;
                  }
          }
      }
      `,
      lineNumbers: true,
    }, theme),
  }
  var compiler
  const download = async () => {
    const select = await solcjs.versions()
    const { releases, nightly, all } = select

    const version = releases[0]
    compiler = await solcjs(version)
    update()
  }
  download()
  function update () {
    if (compiler) {
      var sourcecode = ed.el.api.getValue()
      var id = setTimeout(async () => {
        try {
          var result = await compiler(sourcecode)
        } catch (e) {
          console.error('@TODO: report errors properly')
        }
        var el = smartcontract(result)
        scapp.el.innerHTML = ''
        scapp.el.appendChild(el)
        output.el.textContent = JSON.stringify(result)
      }, 0)
    }
  }
  ed.el.api.on('change', debounce((api) => update()))

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
