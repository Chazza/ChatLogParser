# ChatLogParser
A simple, easy-to-use chat log parser with javascript.

## Installation
To install, run `npm i chatlogparser`.

## Usage
Reading from a chat log file.
```js
const chat = require('./parser');
const fs = require('fs');

fs.readFile(`./log.txt`, 'utf8', (err, data) => {
  console.log(chat.parse(data))
})
```