#!/usr/bin/env node

const rimraf=require('rimraf');
const join=require('path').join;
const spawn=require('child_process').spawn;
const camelcase=require('camelcase');
const vfs=require('vinyl-fs');
const readFileSync=require('fs').readFileSync;
const outputFileSync=require('fs').outputFileSync;
const os=require('os');
const babel=require('@babel/core');
const through=require('through2');
const chokidar=require('chokidar');
const mkdirp=require('mkdirp');
const getBabelConfig=require('../src/getBabelConfig');


const script=camelcase(process.argv[2]);
console.log("script is "+script)
const args=process.argv.slice(3);

function winPath(path){
	return path.replace(/\\/g,'/');
}
function build(){
	rimraf.sync('./lib');
	if(args.indexOf('-w')>-1 || args.indexOf('--watch')>-1){
		setTimeout(()=>{
           
		},1000);
	};
	return vfs.src('./src/**/*.js')
	  .pipe(through.obj(function(f,enc,cb){
         f.contents=new Buffer(babel.transform(f.contents,getBabelConfig()).code);
	  }))
	  .pipe(vfs.dest('./lib/'));
}

if(process.argv[2]==='-v'||process.argv[2]==='--version'){
	const pkg=require('../package.json');
	console.log("version is "+pkg.version);
	process.exit(0);
}

if(!script){
	console.error(`please specify the script.what do you want?`);
	process.exit(1);
}

if(eval(`typeof ${script}`)!=='function'){
	console.error(`Unknown script ${script}`);
	process.exit(1);
}

eval(`${script}()`);

