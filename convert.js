const sharp = require('sharp');
sharp('img/favicon.png')
    .webp({ quality: 80 })
    .toFile('img/favicon.webp')
    .then(() => console.log('Successfully converted favicon.png to favicon.webp'))
    .catch(err => console.error(err));
