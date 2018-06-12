
// console fun with tagged String litteralstremplate
// To deactivate debug
// log.noop()

(function( global ){

    var log = (ss,...p)=> log.level > 2 && console.log.apply(console, [ss.join('%')].concat(p));
    log.level = 3; // 0> nothing, 1> errors, 2> infos, 3> logs, 4> accessors, 5> proxies
    log.I = (ss,...p)=> log.level > 1 && console.info.apply(console, [ss.join('%')].concat(p));
    log.E = (ss,...p)=> log.level > 0 && console.error.apply(console, [ss.join('%')].concat(p));
    log.G = (ss,...p)=> log.level > 2 && console.groupCollapsed.apply(console, [ss.join('%')].concat(p));

    log.noop = ()=> { log = o=>o; log.I = log.G = log.E = log; global.log = log }
    global.log = log;

})( global || window )

/* exemples:

log `
window = ${window}o
innerHeight = ${`color:blue`}c${window.innerHeight}d${``}cpx
${`color:white;background:green`}cOK`

log.I `
Hello ${window}o, tu est grande de ${`color:blue`}c${window.innerHeight}d${``}c pixels !
${`color:green`}c Bravo!!`

log.E `
Hello ${window}o tu est grande que de ${window.innerHeight}d pixels !
${`color:white;background:red`}c Pas bien!!`


var bigreen = `color:white;background:green;font-size:1.2em;padding:0 .3em`
  , bigred = `color:white;background:red;font-size:1.2em;padding:0 .3em`
log `${bigreen}cOK`
log `${bigred}cKO`
log `${window.innerHeight<500 ? bigred : bigreen}c${window.innerHeight<500 ? "trop petiiiiit!s" : "Ok mon grand .."}s`

// var toLog = window;
// log.G`[class ${'color: indigo'}c${toLog.constructor.name}s${''}c]
//     this = ${window}o
//     innerWidth = ${`color:blue`}c${window.innerWidth}d${``}cpx
//     innerHeight = ${`color:blue`}c${window.innerHeight}d${``}cpx
//     document = ${document}o
//         title = ${`color:white;background:indigo`}c"${document.title}s"${``}c
// `

*/


