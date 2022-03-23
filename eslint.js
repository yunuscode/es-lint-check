const fs = require("fs");
const path = require("path");
const paths = ["packages/mypackage/src/text/en.json"];

function getFiles(dir, files_) {
	// Bu funksiya barcha papka ichida ichma ich joylashgan ts, tsx fayllarni yig'ib beradi
	files_ = files_ || [];
	var files = fs.readdirSync(dir);
	// Papkani o'qish uchun
	for (var i in files) {
		var name = dir + "/" + files[i];
		// Papkalarni ichida papka chiqib qolsa recursive funksiya ishlatamiz
		if (fs.statSync(name).isDirectory()) {
			getFiles(name, files_);
		} else {
			// fayllarni topsak qo'shamiz
			if (name.endsWith(".ts") || name.endsWith(".tsx")) {
				files_.push(name);
			}
		}
	}
	return files_;
}

function checkIsUsedOrNot(array) {
	// Bu funksiya tilning faylidagi properties ni iteratsiya qilib, tepadagi funksiya topgan fayllar ichidan qidirib chiqadi.
	const notUsedKeys = [];
	for (let lgFilePath of array) {
		const parentPath = path.join(lgFilePath, "..", "..", "..");
		// Har bir til faylni package papkasini topib olishimiz kerak
		if (!parentPath.startsWith("packages")) return;
		// Agar shu papka packagesni ichida bo'lmasa to'xtatadi;
		let allFiles = getFiles(parentPath);
		// Hamma ichma ich ts, tsx fayllarni olib oldik
		let jsonKeys = JSON.parse(
			fs.readFileSync(path.join(__dirname, lgFilePath), "utf-8")
		);
		// Til faylini js object shakliga o'tkazdim
		for (let item in jsonKeys) {
			// Har bir til propertisini tekshirib chiqamiz
			let used = false;
			loop1: for (const i of allFiles) {
				let fileBody = fs.readFileSync(
					path.join(__dirname, i),
					"utf-8"
				);
				fileBody = fileBody.split("\n");

				for (let line of fileBody) {
					line = line.trim();
					if (
						!line.startsWith("//") &&
						line.includes(item) &&
						!line.includes("/*") &&
						!line.includes("*/")
					) {
						// anti komment :)
						used = true;
						break loop1;
					} else {
						used = false;
					}
				}

				// faylni o'qiymiz
				// Agar ichida shu so'z ishlatilgan bo'lsa qo'shmaymiz, bo'lmasa ro'yxatga qo'shamiz
			}
			if (!used)
				notUsedKeys.push({
					lF: lgFilePath,
					key: item,
				});
		}
	}
	// Qaytarib beramiz
	return notUsedKeys;
}

// console.log(getFiles(__dirname));

// Prettied format of code;

class checkFile {
	constructor(path_list) {
		this.path_list = path_list;
	}

	#getFiles(dirname, files_ = []) {
		let files = fs.readdirSync(dirname);
		for (let file in files) {
			let name = path.join(dirname, files[file]);
			if (fs.statSync(name).isDirectory()) {
				getFiles(name, files_);
			} else {
				if (name.endsWith(".ts") || name.endsWith(".tsx")) {
					files_.push(name);
				}
			}
		}
		return files_;
	}

	checkIsUsedOrNot() {
		const notUsedKeys = [];
		for (let lgFilePath of this.path_list) {
			const parentPath = path.join(lgFilePath, "..", "..", "..");
			if (!parentPath.startsWith("packages")) return;
			let allFiles = this.#getFiles(parentPath);
			let jsonKeys = JSON.parse(
				fs.readFileSync(path.join(__dirname, lgFilePath), "utf-8")
			);
			for (let item in jsonKeys) {
				let used = false;
				loop1: for (const i of allFiles) {
					let fileBody = fs.readFileSync(
						path.join(__dirname, i),
						"utf-8"
					);
					fileBody = fileBody.split("\n");
					for (let line of fileBody) {
						line = line.trim();
						if (
							!line.startsWith("//") &&
							line.includes(item) &&
							!line.includes("/*") &&
							!line.includes("*/")
						) {
							used = true;
							break loop1;
						} else {
							used = false;
						}
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
}

const check = new checkFile(paths);
console.log(check.checkIsUsedOrNot());
