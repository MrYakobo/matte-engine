var mjpage = require('mathjax-node-page').mjpage
var fs = require('fs-extra')
var path = require('path')
const cheerio = require('cheerio')
var checksum = require('checksum')
var glob = require('glob-promise')
var Handlebars = require('handlebars')
var minify = require('html-minify').minify
var watch = require('watch').watchTree
var liveServer = require('live-server')
const showdown = require('showdown')
const md = new showdown.Converter({
    simpleLineBreaks: true
})

var ora = require('ora')

function numsort(a, b) {
    let reg = /(\d+)/
    return parseInt(reg.exec(a)[1]) - parseInt(reg.exec(b)[1])
}

function getData(input) {
    const $ = cheerio.load(input)
    let content = $('body').text().replace(/`.+?`/g, ' ').replace(/\s{2,}/g, ' ')
    return content
}

function display(str) {
    return `Föreläsning ${parseInt(str.replace(/\D/g,''))}`
}

module.exports.server = function (folder) {
    watch(folder, (f, curr, prev) => {
        if (typeof f == "object" && prev === null && curr === null) {
            // Finished walking the tree
        } else {
            compileFile(f)
        }
    })
    liveServer.start({
        host: process.env.IP,
        port: process.env.PORT,
        open: true,
        mount: [],
        proxy: [],
        middleware: [],
        logLevel: 2,
        watch: folder
    })
}

module.exports.init = async function (folder) {
    await fs.copy(__dirname + '/boilerplate', path.resolve(folder))
    var _path = path.join(folder, 'index.html')
    var source = fs.readFileSync(_path, 'utf8')
    var ctx = {
        title: path.basename(folder),
        files: []
    }
    fs.writeFileSync(_path, Handlebars.compile(source)(ctx))
}

module.exports.compile = compile

async function compileFile(file){
    var out = await compileAM(fs.readFileSync(file))
    fs.writeFileSync(file ,out)
}

async function compileAM({input, isHTML, title} = {input: '', isHTML: false, title: 'fl'}) {
    if(isHTML){
    var searchfix = 'function b(h){if(""!==location.hash){var a=location.hash.split("#")[1];find(a)}}window.onhashchange=b,b()'
    //remove mathjax script, escape `''`, insert search highlighting script, remap ../style.css to style.css
    input = input
            .replace(/<script src=".*mathjax.*/g, '')
            .replace(/''/g, `^&#x2033;`)
            .replace('../style.css','style.css')
    }
    else {
        const $ = cheerio.load(`<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="stylesheet" href="style.css"></head><body class="markdown">${input}</body>`)
        
        const nodes = $('p:contains("`")').contents().toArray() //unpack <p>`foo`bar</p> to `foo`<p>bar</p>.
        const unpack = nodes.filter(t=> t.data != null && t.data.indexOf('\\`')>-1)
        unpack.forEach(t=> {
            const math = /\\`(.+?)\\`/.exec(t.data)
            $(t).text(t.data.replace(math, '')) //remove math from element
            $(t.parentNode).before(math) //add math as a seperate text node before <p>.
        })
        input = $.html()
    }
    //compile asciimath to svg (heavy operation):
    var str = await mjPromise(input)
    str = str.replace('</body>', `</body><script>${searchfix}</script>`)
    try{
        var minified = minify(str)
        return minified
    }
    catch(er){
        return str
    }
}

async function compile(folder, force) {
    //throw if user tries to compile a folder that don't have a src-folder.
    try {
        fs.accessSync(path.join(folder, 'src'))
    } catch (er) {
        throw new Error('No src folder found in ' + path.resolve(folder))
    }

    //get files in requested folder (src):
    var files = await glob(path.join(folder, 'src', 'fl*'))
    //sort'em
    files = files.sort(numsort)

    var globData = []
    //if old hashes don't exist, create new empty array
    if(force){
        var oldHashes = new Array(files.length).fill('')
    }
    else{
        try {
            var oldHashes = JSON.parse(fs.readFileSync(path.join(folder, 'hashes.json'), 'utf8'))
        } catch (er) {
            var oldHashes = new Array(files.length).fill('')
        }
    }

    const spinner = ora('Compiling files...')
    for (var i = 0; i < files.length; i++) {
        spinner.start('Compiling files...')
        var input = fs.readFileSync(files[i], 'utf8')

        let ext = path.extname(files[i]).toLowerCase()
        //save contents of this file (plaintext) to globData
        const file = path.basename(files[i]).replace(ext, '.html')
        globData.push({
            file: file,
            display: display(path.basename(files[i])),
            content: getData(input)
        })

        //if hash is the same as last time, skip file
        var cs = checksum(input)
        if (cs === oldHashes[i]) {
            spinner.info(files[i] + ': file not changed, therefore not compiling')
            continue
        }

        oldHashes[i] = cs
        if(ext == '.md' || ext == '.markdown'){
            const escaped = input.replace(/`(.+?)`/g,'\\`$1\\`')
            input = md.makeHtml(escaped)
        } else if(ext != '.html') {
            spinner.info(files[i] + ' is not markdown or html, skipping')
            continue
        }
        
        const output = await compileAM({input: input, isHTML: ext == '.html', title: file.replace('.html', '')})

        var outfile = path.join(path.dirname(path.dirname(files[i])), file)
        //save output
        fs.writeFileSync(outfile, output)
        spinner.succeed(files[i] + ' compiled to ' + outfile)
    }

    //save data.js and hashes
    fs.writeFileSync(path.join(folder, 'data.js'), 'var data = ' + JSON.stringify(globData))
    fs.writeFileSync(path.join(folder, 'hashes.json'), JSON.stringify(oldHashes))

    var source = fs.readFileSync(path.join(__dirname, 'boilerplate', 'index.html'), 'utf8')
    var ctx = {
        title: path.basename(path.resolve(folder)),
        files: globData
    }
    fs.writeFileSync(path.join(folder, 'index.html'), Handlebars.compile(source)(ctx))
}

function mjPromise(input) {
    return new Promise((res, rej) => {
        mjpage(input, {
            format: 'AsciiMath'
        }, {
            svg: true
        }, (output) => {
            res(output)
        })
    })
}