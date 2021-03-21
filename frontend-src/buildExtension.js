const fs = require('fs-extra');

const buildPathFiles = ['build/static', 'build/index.html', 'build/asset-manifest.json'];
const extensionPathFiles = ['../extension-pack/static', '../extension-pack/index.html', '../extension-pack/asset-manifest.json'];

function removeExtensionOldFiles() {
    extensionPathFiles.forEach((file) => {
        fs.rmdirSync(file, {recursive: true});
        // console.log( '\u001b[32;1mRemoved file: ' + file + '\u001b[0m');
    });
}

function copyExtensionNewFiles() {
    buildPathFiles.forEach((file) => {
        const filename  = file.split('/')[1];
        fs.copySync(file, '../extension-pack/' + filename)
        // console.log( '\u001b[32;1mCopied file to: ../extension-pack/' + file + '\u001b[0m');
    });
}

function buildExtension() {
    try {
        removeExtensionOldFiles();
        copyExtensionNewFiles();

        console.log( '\u001b[32;1mExtension build successfully!\u001b[0m');
    }
    catch (error) {
        console.error(error);
    }
}

buildExtension();

  