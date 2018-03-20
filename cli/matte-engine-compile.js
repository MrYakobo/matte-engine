#!/usr/bin/env node

var program = require('commander')
var yesno = require('yesno')

var main = require('..')

program
    .usage('[dir] [flags]')
    .option('-f, --force','force compilation (ignore earlier hashes)')
    .parse(process.argv);

var dir = program.args[0] == null ? '.' : program.args[0]

compile()

async function compile() {
    try {
        await main.compile(dir, program.force)
    } catch (er) {
        console.log('Error: ' + er)
        program.help()
    }
}