const playeditor = require('./')

document.body.innerHTML = `
  <style>
    html, body {
      display: flex;
      flex-direction: column;
      margin: 0;
      height: 100%;
    }
  </style>
  <center><h1> demo: play editor </h1></center>
`

document.body.appendChild(playeditor())
