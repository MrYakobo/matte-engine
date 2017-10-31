#!/usr/bin/env node

var program = require('commander')
var yesno = require('yesno')

var main = require('..')

program
    .usage('[dir]')
    .parse(process.argv);

var dir = program.args[0] == null ? '.' : program.args[0]

compile()

async function compile() {
    try {
        await main.compile(dir)
    } catch (er) {
        console.log('Error: ' + er.message)
        program.help()
    }
}