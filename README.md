# matte-engine

Package that compiles AsciiMath-HTML to complete, searchable websites. (with SVG-graphics)

### Disclaimer: This package ain't your all purpose, general package. This is niched against a fixed folder structure and fixed document structures. Be aware, and look at the examples for success.

This package exposes a function and a CLI.

### module usage
`npm i matte-engine`

```js
async function main(){
    var compile = require('matte-engine')
    await compile('matte/flervariabelanalys')
    console.log('Profit')
}
main()
```

### CLI
`npm i -g matte-engine`
```bash
matte-engine init matte/flervariabelanalys
# Created empty boilerplate in matte/flervariabelanalys
matte-engine matte/flervariabelanalys
```

## Conventions

### Uncompiled file structure:
```
signaler/
├── src
│   ├── boilerplate.html
│   ├── fl1.html
└── style.css
```

Note the convention of namespacing the files `src/fl*.html`. The boilerplate is there for practical reasons only, in case you need to take notes quickly (ie `cp boilerplate.html fl4.html && vim fl4.html`).

#### Compiled file structure:
```
signaler/
├── data.js
├── fl1.html
├── index.html
├── src
│   ├── boilerplate.html
│   ├── fl1.html
└── style.css
```

The package should create these files after compilation:
    `data.js`: File containing search information about files
    `fl*.html`: `src/fl*.html` but with SVG-graphics instead
    `index.html`: Index for site

### fl*.html

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=AM_HTMLorMML"></script>
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <div>
        Your stuff here `x = 0`
    </div>
    <div>
        These divs are seperated by a tiny amount, making readable "pages"
    </div>
</body>
```

This setup ensures that you are able to use `live-server` to live preview your changes to this file.

## Goals

Init script should set up a workspace for you. `matte-engine init`

You should be able to just `matte-engine` away, and then dump the files on a web server.
Development should be easy and straightforward.

Maybe: Expose a (very light wrapper around live-server) dev server to avoid using different tools.