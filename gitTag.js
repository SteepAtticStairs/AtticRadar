const { exec } = require('child_process');
const fs = require('fs')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function runCommand(cmd, cb) {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            cb();
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            cb();
            return;
        }
        console.log(`stdout: ${stdout}`);
        cb();
    });
}

var descriptions = [];
function descriptionLine(description, cb) {
    descriptions.push(description);
    readline.question('', description => {
        if (description != 'done') {
            descriptionLine(description, cb);
        } else {
            cb();
        }
    })
}
function addDescription(cb) {
    readline.question('\nDescription:\n', description => {
        descriptionLine(description, cb);
    })
}

var args = process.argv;
const mode = args[2];
if (mode == 'rename') {
    //const newName = args[3];
    const oldName = args[3];
    const newName = `${oldName}.0`;

    runCommand(`git tag ${newName} ${oldName}`, function() {
    runCommand(`git tag -d ${oldName}`, function() {
    runCommand(`git push origin ${newName} :${oldName}`, function() {
    })})})
} else {
    readline.question('\nCommit ID:\n', commitID => {
    readline.question('\nVersion:\n', version => {
    addDescription(function() {
    console.log('')

    var shortCommitID = commitID.slice(0, 7);

    let logRows = fs.readFileSync('CHANGELOG.md').toString().split('\n');
    descriptions.reverse();
    logRows.unshift(``);
    for (var i in descriptions) {
        logRows.unshift(`* ${descriptions[i]}`);
    }
    logRows.unshift(`[${shortCommitID}](https://github.com/SteepAtticStairs/AtticRadar/commit/${commitID})`);
    logRows.unshift(`**v${version}**\\`);
    fs.writeFileSync('CHANGELOG.md', logRows.join('\n'));

    runCommand(`git tag -a v${version} ${shortCommitID} -m ${version}`, function() {
    runCommand(`git push origin v${version}`, function() {
    readline.close();




    })})})})})
}