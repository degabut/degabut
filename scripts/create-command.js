const fs = require("fs");

const commandName = process.argv[2];
const camelizedCommandName = camelize(commandName);
const commandDescription = process.argv[3];

const newCommand = `./src/commands/${camelizedCommandName}`;
const newCommandFile = `${newCommand}/index.ts`;

if (fs.existsSync(newCommand)) throw new Error("Command Exists");

fs.mkdirSync(newCommand, { recursive: true });

copyTemplate("template/command.ts", newCommandFile, camelizedCommandName, commandDescription);

function copyTemplate(src, path, commandName = "", commandDescription = "") {
	fs.readFile(src, "utf-8", (err, data) => {
		if (err) throw err;
		if (commandName) data = data.replace(/\[Your Command Name\]/g, commandName);
		if (commandDescription)
			data = data.replace(/\[Your Command Description\]/g, commandDescription);
		fs.writeFile(path, data, "utf8", function (err) {
			if (err) throw err;
		});
	});
}

function camelize(str) {
	let arr = str.split("-");
	let capital = arr.map((item, index) =>
		index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item
	);
	return capital.join("");
}
