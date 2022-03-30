const fs = require('fs-extra');

const buildPathFiles = [
  'build/static',
  'build/assets',
  'build/index.html',
  'build/asset-manifest.json',
  'build/manifest.json',
];

function buildExtension() {
  try {
    buildPathFiles.forEach((file) => {
      const filename = file.split('/')[1];
      fs.copySync(file, './build/extension-pack/' + filename);
      console.log(
        '\u001b[32;1mCopied file to: ./build/extension-pack/' +
          file +
          '\u001b[0m',
      );
    });

    console.log('\u001b[32;1mExtension build successfully!\u001b[0m');
  } catch (error) {
    console.error(error);
  }
}

buildExtension();
