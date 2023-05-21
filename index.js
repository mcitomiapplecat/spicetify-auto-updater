const child_process = require('child_process'), fs = require('fs'), axios = require('axios');
let config;
try {
    config = require('./config.json');
} catch (error) {
    fs.writeFileSync('./config.json', JSON.stringify({"lastUpdate":""}));
    config = require('./config.json');
}

const command = `
iwr -useb https://raw.githubusercontent.com/spicetify/spicetify-cli/master/install.ps1 | iex
iwr -useb https://raw.githubusercontent.com/spicetify/spicetify-marketplace/main/resources/install.ps1 | iex
`;

async function main() {
    if(await updated()) {
        child_process.exec(command, {'shell':'powershell.exe'}, (error, stdout, stderr)=> {
            console.log(error, stdout, stderr);
        });
    } else {
        return;
    }
}

async function updated() {
    try {
        const res = await axios.get("https://api.github.com/repos/spicetify/spicetify-cli/releases/latest");
        if(res.data.published_at !== config.lastUpdate) {
            const json = fs.readFileSync('./config.json');
            const jsonContent = JSON.parse(json);
            jsonContent.lastUpdate = res.data.published_at;
            fs.writeFileSync('./config.json', JSON.stringify(jsonContent));
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

main();
