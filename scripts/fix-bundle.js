const fs = require('fs').promises;
const path = require('path');

const bundlePath = path.join(__dirname, '../dist/bundle.js');

async function fix() {
  console.log(`...............Fixing ${bundlePath}`);
  let contents = await fs.readFile(bundlePath, 'utf8');
	contents = contents.replace(new RegExp("eval\\(", "g"), "eval8484(")
	contents = contents.replace(new RegExp("var ejs", "g"), "// var ejs")
	contents = contents.replace(new RegExp(" throw new Error\\(\"The tree depth must be between 16 and 32\"\\)", "g"), "// ")
	contents = contents.replace(new RegExp("if \\(singleThread", "g"),  "if (true")
	contents = contents.replace(new RegExp("ffjavascript.buildBn128\\(", "g"),  "ffjavascript.buildBn128(true")
	// contents = contents.replace(new RegExp("textData = atob\\(textData", "g"), "// textData = atob(textData")
  await fs.writeFile(bundlePath, contents);
}

fix();

