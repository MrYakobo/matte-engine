#!/usr/bin/env node

var program = require('commander')
var yesno = require('yesno')
var main = require('..')
var path = require('path')

program
.usage('[dir]')
.parse(process.argv);

var dir = program.args[0]
if(dir == null){
    yesno.ask('Init in current directory? [Y/n]', true, (ok)=>{
        if(ok) init('.')
        else process.exit(0)
    })
}
else{
    init(dir)
}

async function init(folder){
    await main.init(folder)
    console.log('Initalized in ' + path.resolve(folder))
    process.exit(0)
}