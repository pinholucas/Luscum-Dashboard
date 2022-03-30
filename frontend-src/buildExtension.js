const fs = require('fs-extra');
const path = require('path');

const buildPathFiles = [
  'build/static',
  'build/assets',
  'build/index.html',
  'build/asset-manifest.json',
  'build/manifest.json',
];

function removeExtensionOldFiles() {
  const directory = '../extension-pack';

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlinkSync(path.join(directory, file), (err) => {
        if (err) throw err;
      });

      console.log('\u001b[32;1mRemoved file: ' + file + '\u001b[0m');
    }
  });
}

function copyExtensionNewFiles() {
  buildPathFiles.forEach((file) => {
    const filename = file.split('/')[1];
    fs.copySync(file, '../extension-pack/' + filename);
    console.log(
      '\u001b[32;1mCopied file to: ../extension-pack/' + file + '\u001b[0m',
    );
  });
}

function buildExtension() {
  try {
    removeExtensionOldFiles();
    copyExtensionNewFiles();

    console.log('\u001b[32;1mExtension build successfully!\u001b[0m');
  } catch (error) {
    console.error(error);
  }
}

buildExtension();
