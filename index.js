var mjpage = require('mathjax-node-page').mjpage
var fs = require('fs-extra')
var path = require('path')
const cheerio = require('cheerio')
var path = require('path')
var checksum = require('checksum')
var glob = require('glob-promise')
var Handlebars = require('handlebars')

function numsort(a,b){
    let reg = /(\d+)/
    return parseInt(reg.exec(a)[1]) - parseInt(reg.exec(b)[1])
}

function getData(input){
    const $ = cheerio.load(input)
    let content = $('body').text().replace(/`.+?`/g,' ').replace(/\s{2,}/g,' ')
    return content
}

function display(str){
    return `Föreläsning ${parseInt(str.replace(/\D/g,''))}`
}

module.exports.init = async function(folder){
    await fs.copy(__dirname + '/boilerplate', folder)
    var _path = path.join(folder, 'boilerplate', 'index.html')
    var source = fs.readFileSync(_path)
    var ctx = {title: path.basename(folder), files: []}
    fs.writeFileSync(_path ,Handlebars.compile(source)(ctx))
}

module.exports.compile = async function(folder){
    //throw if user tries to compile a folder that don't have a src-folder.
    try{ fs.accessSync(path.join(folder, 'src')) }
    catch(er) { throw new Error('No src folder found in ' + path.resolve(folder))}

    //get files in requested folder (src):
    var files = await glob(path.join(folder,'src', 'fl*.html'))
    //sort'em
    files = files.sort(numsort)

    var globData = []
    //if old hashes don't exist, create new empty array
    try{
    var oldHashes = JSON.parse(fs.readFileSync(path.join(folder, 'hashes.json'),'utf8'))
    }
    catch(er){
        var oldHashes = new Array(files.length).fill('')
    }

var searchfix = 'function b(h){if(""!==location.hash){var a=location.hash.split("#")[1];find(a)}}window.onhashchange=b,b()' 

    for(var i = 0; i < files.length; i++){
        //if hash is the same as last time, skip file
        var cs = checksum(input)
        if(cs === oldHashes[i]) continue

        oldHashes[i] = cs

        var input = fs.readFileSync(files[i])

        //remove mathjax script, escape `''`
        input = input.replace(/<script src=".*mathjax.*/g, '').replace(/''/g, `^&#x2033;`).replace('</body>',`</body><script>${searchfix}</script>`)

        //compile asciimath to svg (heavy operation):
        var output = await mjPromise(input)

        //save contents of this file (plaintext) to globData
        globData.push({file: path.basename(files[i]),display: display(path.basename(files[i])),content:getData(input)})

        //save output
        fs.writeFileSync(path.join(path.dirname(path.dirname(files[i])), path.basename(files[i])), output)
    }

    //save data.js and hashes
    fs.writeFileSync(path.join(folder, 'data.js'), 'var data = ' + JSON.stringify(globData))
    fs.writeFileSync(path.join(folder, 'hashes.json'), JSON.stringify(oldHashes))

    //TODO: compile index.html for project
    var _path = path.join(folder, 'boilerplate', 'index.html')
    var source = fs.readFileSync(_path)
    var ctx = {title: path.basename(folder), files: []}
    fs.writeFileSync(_path, Handlebars.compile(source)(ctx))
}

function mjPromise(input){
    return new Promise((res,rej)=>{
        mjpage(input, {format: 'AsciiMath'}, {svg: true}, (output)=>{
            res(output)
        })
    })
}