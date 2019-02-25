// @TODO: add two classes to components
// 1. invariant class (layout, etc...)
// 2. custom class with default class fallback (for customisation)
// 3. make it "live updatable" (classes)
// 4. enable constraints inside "custom" (e.g. css variables?)
// 5. enable updates to (e.g. css variables)

var tabfont = 'Courier New'  // mono spaced
var smokewhite = '#f5f5f5'   // background light
var slateGrey = '#8a929b'    // input background text
var lavenderGrey = '#e3e8ee' // inputs background
var white = '#ffffff'        // borders & font on input background
var darkgrey = '#21252b'     // separators

var dark = '#2c323c'         // background dark
var darkish = 'hsla(0, 0%, 8%, 1)' // dark seperator
// var violetRed = '#b25068'    // used as red in types (bool etc.)
// var aquaMarine = '#90FCF9'   // used as green in types (bool etc.)
// var turquoise = '#14b9d5'
// var yellow = '#F2CD5D'
// var androidGreen = '#9BC53D'

const lighttheme = {
  // TWM ------------------------------
  font1: tabfont,                // tab font
  color_text: darkgrey,          // tab inactive text
  color_activeText: white,       // tab active text
  color_bgPanel: smokewhite,     // panel background & separators
  color_bgTab: lavenderGrey,     // tab
  color_bgContent: lavenderGrey, // TAB BACKGROUND - lavenderGrey -
  color_background: slateGrey,   // PLAY EDITOR BACKGROUND
  color_bgPane: white,           // panel background
  color_bgMenubar: lavenderGrey, // menubar background color
  // LOGO ------------------------------
  logo:[
    `hsla(${360*Math.random()},100%,90%,1)`,
    `hsla(${360*Math.random()},100%,90%,1)`,
    `hsla(${360*Math.random()},100%,90%,1)`,
  ],
  // EDITOR ------------------------------
  color_bgEditor: lavenderGrey,
  color_bgLinebar: lavenderGrey,
  color_seperator: smokewhite,
}
const darktheme = {
  // TWM ------------------------------
  font1: tabfont,              // tab font
  color_text: slateGrey,       // tab inactive text
  color_activeText: white,     // tab active text
  color_bgPanel: dark,         // panel background & separators
  color_bgTab: darkgrey,       // tab
  color_bgContent: darkgrey,   // TAB BACKGROUND - lavenderGrey -
  color_background: slateGrey, // PLAY EDITOR BACKGROUND
  color_bgPane: darkgrey,      // panel background
  color_bgMenubar: darkgrey,   // menubar background color
  // LOGO ------------------------------
  logo:[
    `hsla(${360*Math.random()},100%,30%,1)`,
    `hsla(${360*Math.random()},100%,30%,1)`,
    `hsla(${360*Math.random()},100%,30%,1)`,
  ],
  // EDITOR ------------------------------
  color_bgEditor: darkgrey,
  color_bgLinebar: darkgrey,
  color_seperator: dark,
}

// module.exports = lighttheme
module.exports = darktheme

// // ----- CODESANDBOX
// #1c2022 // dark background
// #24282a // light background
// #111314 // seperator
// #141618 // bar background
//
// #333739 // input background
// #696a6a // input background text
//
// #7b7d7e // icons
//
// #ffffff // active font
// #a1a1a2 // inactive font
// #818183 // counter
// #434446 // counter circle
// #65686a //
//
// #f2f2f2 // browser bar background
// #ffffff // browser blank background
//
// // ---- CODEPEN
// #1d1e22 // editor background     !!!!!
// #31363e // editor line numbers
// #ffffff // editor text
//
// #1a1b1f // menubar backgroundcolor  !!!!!
// #c5c8d4 // menubar color
//
// #26272a // editor-bar seperator
//
// #36383f // panel seperator background !!!!!!!
//
// #26282d // thin line seperator
// #080809 // another thin seperator color
//
// #36383f // icon background
// #ffffff // icon text
