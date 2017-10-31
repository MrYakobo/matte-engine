#!/usr/bin/env node
var program = require('commander');
var fs = require('fs')
var path = require('path')

var main = require('..')

program
.version(JSON.parse(fs.readFileSync(path.join(__dirname, '../','package.json'),'utf8')).version)
.usage('<command> [dir]')
.command('compile [dir]', 'compile directory for web', {isDefault: true})
.command('init [dir]', 'initialize matte-engine\'s folder structure in specified directory')

program.parse(process.argv);