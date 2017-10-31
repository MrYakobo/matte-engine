# matte-engine

Package that compiles AsciiMath-HTML to complete, searchable websites. (with SVG-graphics)

### Disclaimer: This package ain't your all purpose, general package. This is niched against a fixed folder structure and fixed document structures. Be aware, and look at the examples for success.

### Disclaimer 2: This package isn't published yet to npm, so to install do
```bash
git clone https://github.com/MrYakobo/matte-engine
cd matte-engine
# CLI:
npm link --local
# module usage
npm link
cd /other/project
npm link matte-engine
```

### Disclaimer 3: The name `matte-engine` is totally stupid and should be renamed. It's the main reason I havn't published to npm yet.

---

This package exposes a function and a CLI.

### module usage
`npm i matte-engine`

```js
async function main(){
    var compile = require('matte-engine').compile
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

#### Note: You don't really have to care about the folder structure if you're using the CLI to init your projects, and then dumping the root-folder at a web server. Just sayin

### Uncompiled file structure:
```
project/
├── src
│   ├── boilerplate.html
│   ├── fl1.html
└── style.css
```

Note the convention of namespacing the files `src/fl*.html`. The boilerplate is there for practical reasons only, in case you need to take notes quickly (ie `cp boilerplate.html fl4.html && vim fl4.html`).

#### Compiled file structure:
```
project/
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