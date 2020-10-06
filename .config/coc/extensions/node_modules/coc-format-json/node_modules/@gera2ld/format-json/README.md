# @gera2ld/format-json

![NPM](https://img.shields.io/npm/v/@gera2ld/format-json.svg)
![License](https://img.shields.io/npm/l/@gera2ld/format-json.svg)
![Downloads](https://img.shields.io/npm/dt/@gera2ld/format-json.svg)

Format JSON in different flavors

## Installation

```sh
$ yarn add @gera2ld/format-json
```

## Usage

```js
import { format } from '@gera2ld/format-json';

const data = {/* … */};
const jsonOptions = {
  indent: 0,
  quoteAsNeeded: false,
  quote: '"',
  trailing: false,
  template: false,
};
const jsOptions = {
  indent: 2,
  quoteAsNeeded: true,
  quote: '\'',
  trailing: true,
  template: true,
};

console.log('format as JSON:', format(data, jsonOptions));
console.log('format as JavaScript', format(data, jsOptions));
```
