// Optional one-time optimisation; Terser is a maintainer tool, not a runtime dependency.
const fs = require('fs'); const vm = require('vm');
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync('/private/tmp/dms-terser.js','utf8'), ctx);
(async()=>{
 const source = 'window.THREE=(function(){var exports={};'+fs.readFileSync('assets/three-source.cjs','utf8')+';return exports;})();';
 const output = await ctx.Terser.minify(source,{compress:{passes:2},mangle:true,format:{comments:false}});
 fs.writeFileSync('js/vendor/three.min.js','/*! Three.js r180 | MIT | See THREE-LICENSE.txt */\n'+output.code);
 console.log('Minified engine bytes: '+fs.statSync('js/vendor/three.min.js').size);
})();
