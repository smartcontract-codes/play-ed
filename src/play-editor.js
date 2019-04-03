const bel = require('bel')
const csjs = require('csjs-inject')

const solcjs = require('solc-js')
const smartcontract = require('smartcontract-app')
const codingeditor = require('coding-editor')

const twm = require('twm')
const menubar = require('menubar')
const getCompilerVersion = require('getCompilerVersion')

const defaultTheme = require('./theme.js')

module.exports = playeditor

function playeditor (opts = {}, theme = defaultTheme) {
  const code = `
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract InvoiceJournal {

/// WHAT DATA WILL WE STORE ON BLOCKCHAIN
  struct Contractor {
    string name;
    string email;
    string pubkey;
    bool active;
    bool exists;
  }
  struct Invoice {
    address contractor;
    uint invoice_id;
    string storage_url;
    string[] encrypted_decrypt_keys; // @TODO: not in use yet :-)
  }
  address operator;
  mapping(address => Contractor) contractors;
  mapping(address => Invoice[]) invoices;
  address[] contractor_addresses;

/// GET A LIST OF ALL PUBLISHED INVOICES
  function getAllInvoices () public view returns (Invoice[][] memory) {
    uint len = contractor_addresses.length;
  	Invoice[][] memory result = new Invoice[][](len);
    for (uint i = 0; i < len; i++) {
      result[i] = invoices[contractor_addresses[i]];
    }
    return result;
  }

/// GET A LIST OF ALL CONTRACTORS (ACTIVE AND NOT ACTIVE)
  function getAllContractors () public view returns (Contractor[] memory) {
    uint len = contractor_addresses.length;
  	Contractor[] memory result = new Contractor[](len);
    for (uint i = 0; i < len; i++) {
      result[i] = contractors[contractor_addresses[i]];
    }
    return result;
  }

/// GET A LIST OF ALL YOUR INVOICES
  function getYourInvoices () public view returns (Invoice[] memory) {
    return invoices[msg.sender];
  }

/// FIRST STEP: ADD/RE-ACTIVATE A CONTRACTOR
  function activateContractor (address contractor_address) public {
    require(operator == msg.sender, "Only an authorized operator can add new contractors");
    Contractor storage contractor = contractors[contractor_address];
    contractor.active = true;
    if (!contractor.exists) {
      contractor.exists = true;
      contractor_addresses.push(contractor_address);
    }
  }

/// DE-ACTIVATE A CONTRACTOR
  function deactivateContractor (address contractor_address) public {
    require(operator == msg.sender, "Only an authorized operator can remove contractors");
    Contractor storage contractor = contractors[contractor_address];
    if (!contractor.active) return;
    contractor.active = false;
  }

/// ONLY CONTRACTORS THEMSELF CAN UPDATE THEIR DATA
  function updateContractor (string memory name, string memory email, string memory pubkey) public {
    Contractor storage contractor = contractors[msg.sender];
    require(contractor.active, "Unauthorized contractors cannot set their pubkeys");
    contractor.name = name;
    contractor.email = email;
    contractor.pubkey = pubkey;
  }

/// ACTIVE CONTRACTOR CAN ADD A NEW INVOICE
  function addInvoice (uint invoice_id, string memory storage_url, string[] memory keys) public returns (Contractor memory) {
    Contractor memory contractor = contractors[msg.sender];
    require(contractor.exists, "Unknown contractors cannot submit invoices");
    require(contractor.active, "Unauthorized contractors cannot submit invoices");
    Invoice[] storage _invoices = invoices[msg.sender];
    Invoice memory new_invoice = Invoice({
      contractor: msg.sender,
      invoice_id: invoice_id,
      storage_url: storage_url,
      encrypted_decrypt_keys: keys
    });

    _invoices.push(new_invoice);
    return contractor;
  }

/// CONSTRUCTOR (RUNS ONLY ONCE - WHEN CONTRACT IS DEPLOYED)
  constructor () public {
    operator = msg.sender;
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
