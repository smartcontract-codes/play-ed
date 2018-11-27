const playeditor = require('./')

document.title = 'play-editor'

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
;[playeditor({ name: 'contract.sol' }),
// playeditor({ value: contract() }, {
//   color1: 'red',
//   color2: 'green',
//   color3: 'yellow',
//   color4: 'olive'
// }),
// playeditor({ value: contract() }),
// playeditor()
// ].forEach((el, i) => boxes[i].appendChild(el))
].forEach((el, i) => document.body.appendChild(el))

function contract () {
  return `
  pragma solidity ^0.4.0;
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
      function Ballot(uint8 _numProposals) public {
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

      function winningProposal() public constant returns (uint8 _winningProposal) {
          uint256 winningVoteCount = 0;
          for (uint8 prop = 0; prop < proposals.length; prop++)
              if (proposals[prop].voteCount > winningVoteCount) {
                  winningVoteCount = proposals[prop].voteCount;
                  _winningProposal = prop;
              }
      }
  }`
}
