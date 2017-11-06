#!/usr/bin/env node

var program = require('commander')
var yesno = require('yesno')

var main = require('..')

program
    .usage('[dir]')
    .parse(process.argv);

var dir = program.args[0] == null ? '.' : program.args[0]

main.server(dir)