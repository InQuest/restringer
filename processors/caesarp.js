/**
 * Caesar+ Deobfuscator
 * The Caesar+ obfuscation is comprised of two layers:
 * 1. The outer layer builds the inner layer by using HTMLElements to manipulate strings,
 *    creating elements, concatenating strings to their innerHTML properties, base64 decoding and concatenating again,
 *    it assigns the resulting string to a variable's toString method and then implicitly invokes it.
 *    E.g.
 *    const a = document.createElement('div');
 *    const b = 'Y29uc29sZS5sb2co';
 *    const c = 'IlJFc3RyaW5nZXIiKQ==';
 *    a.innerHTML = b + c;
 *    var d = {};
 *    d.toString = ''.constructor.constructor(atob(a.innerHTML))
 *    d = d + "this will execute d's toString method";
 *
 * 2. The inner layer contains a cnc check and other run-time limiters,
 *    but also the original target code, still obfuscated.
 */

function extractInnerLayer(script) {
	// The outer layer is a lot of code moved around and concatenated, but it all comes together in the last
	// couple of lines where an object's toString is being replaced with the inner layer code, and then
	// run when the object is being added to a string, implicitly invoking the object's toString method.
	// We can catch the variable holding the code before it's injected and output it instead.
	const lineWithFinalAssignmentRegex = /(\w{3})\[.*]\s*=.*\((\w{3})\).*=\s*\1\s*\+\s*['"]/ms;
	const variableContainingTheInnerLayerRegex = /\(((\w{3}\()+(\w{3})\)*)\)/gms;

	const matches = lineWithFinalAssignmentRegex.exec(script);
	if (!matches?.length) return;
	const lineToReplace = script.substring(matches.index);
	// Sometimes the first layer variable is wrapped in other functions which will decrypt it
	// like OdP(qv4(dAN(RKt))) instead of just RKt, so we need output the entire chain.
	const innerLayerVarMatches = variableContainingTheInnerLayerRegex.exec(lineToReplace);
	const variableContainingTheInnerLayer = innerLayerVarMatches ? innerLayerVarMatches[0] : matches[2];
	script = script.replace(lineToReplace, `console.log(${variableContainingTheInnerLayer}.toString());})();\n`);
	const evald_script = this._evalWithDom(script);
	if (evald_script) this.script = evald_script;
}

function cleanCode() {
	this.removeDeadNodes();
}

module.exports = {
	preprocessors: [extractInnerLayer],
	postprocessors: [cleanCode],
};
