const fs = require("fs");
const path = require("path");
const paths = ["packages/mypackage/src/text/en.json"];

function getFiles(dir, files_) {
	files_ = files_ || [];
	var files = fs.readdirSync(dir);
	for (var i in files) {
		var name = dir + "/" + files[i];
		if (fs.statSync(name).isDirectory()) {
			getFiles(name, files_);
		} else {
			if (
				name.endsWith(".js") ||
				name.endsWith(".ts") ||
				name.endsWith(".tsx") ||
				name.endsWith(".jsx")
			) {
				files_.push(name);
			}
		}
	}
	return files_;
}

function checkIsUsedOrNot(array) {
	const notUsedKeys = [];
	for (let lgFilePath of array) {
		const parentPath = path.join(lgFilePath, "..", "..", "..");
		if (!parentPath.startsWith("packages")) return;
		let allFiles = getFiles(parentPath);
		let jsonKeys = JSON.parse(
			fs.readFileSync(path.join(__dirname, lgFilePath), "utf-8")
		);
		for (let item in jsonKeys) {
			let used = false;
			for (const i of allFiles) {
				let fileBody = fs.readFileSync(
					path.join(__dirname, i),
					"utf-8"
				);
				if (fileBody.includes(item)) {
					used = true;
					break;
				} else {
					used = false;
				}
			}
			if (!used)
				notUsedKeys.push({
					lF: lgFilePath,
					key: item,
				});
		}
	}

	return notUsedKeys;
}

// console.log(getFiles(__dirname));
console.log(checkIsUsedOrNot(paths));
