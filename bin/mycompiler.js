const rimraf=require('rimraf');
const join=require('path').join;
const spawn=require('child_process').spawn;
const camelcase=require('camelcase');
const vfs=require('vinyl-fs');
const readFileSync=require('fs').readFileSync;
const outputFileSync=require('fs').outputFileSync;
const os=require('os');
const through=require('through2');
const chokidar=require('chokidar');
const mkdirp=require('mkdirp');

const script=camelcase(process.argv[2]);
const args=process.argv.slice(3);

function winPath(path){
	return path.replace(/\\/g,'/');
}

if(process.argv[2]==='-v'||process.argv[2]==='--version'){
	const pkg=require('../package.json');
	console.log("version is "+pkg.versioin);
	process.exit(0);
}
