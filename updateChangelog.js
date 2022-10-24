const { DateTime } = require('luxon')
const { exec } = require('child_process');
const fs = require('fs');
const { exit } = require('process');
const shell = require('shelljs')
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

function formatCommit(value, hashOrTimestamp) {
    var timestamp;
    if (hashOrTimestamp == 'hash') {
        shell.config.silent = true;
        timestamp = shell.exec(`git show -s --format=%ct ${value}`, {async: false}).stdout;
        timestamp = timestamp.trim();
    } else if (hashOrTimestamp == 'timestamp') {
        timestamp = value;
    }

    var myDateTime = DateTime.fromSeconds(parseInt(timestamp)).setZone('America/New_York'); // America/New_York or UTC
    var dateString = myDateTime.toFormat("LL/dd/yyyy hh:mm a ZZZZ");
    return {
        'string': dateString,
        'timestamp': parseInt(timestamp)
    };
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
} else if (mode == 'updateDates') {
    // echo $(git show -s --format=%ct 74a3d67bcfcc7dea8618a0ca5f48032ff13b7587)
    var data = fs.readFileSync('CHANGELOG.md', {encoding: 'utf-8'});
    var lines = data.split('\n');
    for (var i in lines) {
        if (lines[i].charAt(0) == '`') {
            var dateStringRemoved = lines[i].split('`');
            dateStringRemoved = dateStringRemoved[dateStringRemoved.length - 1];
            var timestamp = dateStringRemoved.split('--')[1].trim();
            var formattedCommit = formatCommit(timestamp, 'timestamp');
            lines[i] = `\`${formattedCommit.string}\`${dateStringRemoved}`
        }
    }
    fs.writeFileSync('CHANGELOG.md', lines.join('\n'));
    exit();
} else {
    function runCommandBetter(cmd) {
        shell.exec(cmd, {async: false}).stdout;
    }
    readline.question('\nCommit ID:\n', commitID => {
    readline.question('\nVersion:\n', version => {
    addDescription(function() {
    console.log('')

    var shortCommitID = commitID.slice(0, 7);

    let logRows = fs.readFileSync('CHANGELOG.md').toString().split('\n');
    descriptions.reverse();
    logRows.unshift(``);

    var formattedCommit = formatCommit(commitID, 'hash');

    for (var i in descriptions) {
        logRows.unshift(`* ${descriptions[i]}`);
    }

    logRows.unshift(`\`${formattedCommit.string}\`<!-- ${formattedCommit.timestamp} --><br />[${shortCommitID}](https://github.com/SteepAtticStairs/AtticRadar/commit/${commitID})`);
    logRows.unshift(`**v${version}**\\`);
    fs.writeFileSync('CHANGELOG.md', logRows.join('\n'));

    shell.config.silent = false;
    runCommandBetter(`git tag -a v${version} ${shortCommitID} -m ${version}`);
    runCommandBetter(`git push origin v${version}`);
    readline.close();




    })})})
}