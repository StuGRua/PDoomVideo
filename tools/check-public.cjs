const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>['.git','out','node_modules'].includes(e.name)?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root);
for(const file of files.filter(f=>/\.(?:js|cjs|mjs)$/.test(f))){
 const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,path.relative(root,file)+': '+r.stderr);
}
for(const name of ['studio.html','studio-whale.html','studio-whale-annotated.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 for(const [,src]of html.matchAll(/<script[^>]+src="([^"]+)"/g)){assert(fs.existsSync(path.join(root,src)),name+': missing '+src);assert(!src.includes('covers'),'正片入口不能加载封面');}
}
const actor=fs.readFileSync(path.join(root,'src/whale-check.js'),'utf8');
for(const [,name]of actor.match(/const names=(\[[^;]+\]);/)[1].matchAll(/'([^']+)'/g))for(const ext of ['png','svg'])assert(fs.existsSync(path.join(root,'assets/whale',name+'.'+ext)),name);
const render=fs.readFileSync(path.join(root,'render_whale.cjs'),'utf8');
assert(!render.includes('tools/covers')&&!render.includes('docs/whale-design'),'导出依赖了封面或私有目录');
console.log('Public structure, script syntax, runtime assets and cover isolation passed.');
