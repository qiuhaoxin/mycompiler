#!/usr/bin/env node

const rimraf=require('rimraf');
const join=require('path').join;
const spawn=require('child_process').spawn;
const camelcase=require('camelcase');
const vfs=require('vinyl-fs');
const chalk=require('chalk');
const readFileSync=require('fs').readFileSync;
const outputFileSync=require('fs-extra').outputFileSync;
const os=require('os');
const babel=require('@babel/core');
const through=require('through2');
const chokidar=require('chokidar');
const mkdirp=require('mkdirp');
const getBabelConfig=require('../src/getBabelConfig');


const script=camelcase(process.argv[2]);
console.log("script is "+script)
const args=process.argv.slice(3);

const cwd=winPath(process.cwd());
console.log("cwd value is "+cwd);
function winPath(path){
	return path.replace(/\\/g,'/');
}
function watchAndBuild(src){
	console.log("start watch and the path is "+src);
	const watcher=chokidar.watch(src,{
		persistent:true,
	});
	watcher.on('all',(event,fullPath)=>{
		if(['add','change'].indexOf(event)>-1){
			const path=winPath(fullPath).replace(`${cwd}/src/`,'');
			console.log(chalk.green.bold(`[${event}]`,`src/${path}`));
			const content=readFileSync(fullPath,'utf-8');
			try{
                const transformContent=babel.transform(content,getBabelConfig()).code;
                mkdirp.sync(join(cwd,'lib'));
                outputFileSync(join(cwd,'lib',path),transformContent,'utf-8');

			}catch(e){
				console.log(chalk.red('Compiled failed.'));
				console.log(chalk.red(e.message));
			}
		}
	})
}
function build(){
	console.log("begin building!");
	rimraf.sync('./lib');
	if(args.indexOf('-w')>-1 || args.indexOf('--watch')>-1){
		setTimeout(()=>{
           watchAndBuild(join(cwd,'./src'));
		},1000);
	};
	return vfs.src('./src/**/*.js')
	  .pipe(through.obj(function(f,enc,cb){
         f.contents=new Buffer(babel.transform(f.contents,getBabelConfig()).code);
         cb(null,f);
	  }))
	  .pipe(vfs.dest('./lib/'));
}
function test(noCoverage){

}
function runCommand(cmd){
	console.log(chalk.green.bold(`>>${cmd}`));
	const command=(os.platform()==='win32'?'cmd.exe':'sh');
	const args=(os.platform()==='win32'?['/s','/c']:['-c']);
	return spawn(command,args.concat([cmd]),{
		stdio:'inherit',
	});
}
function pub(){
	build()
	  .on('end',()=>{
	  	const name=JSON.parse(readFileSync(join(cwd,'package.json'),'utf-8')).name;
	  	const cmd=args.indexOf('--beta')>-1?`npm publish --beta`:`npm publish`;
	  	runCommand(cmd).on('exit',()=>{
	  		console.log(chalk.green.bold(`finish publish!`))
	  	})
	  })
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

