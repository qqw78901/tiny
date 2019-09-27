const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
module.exports = function (filesArray, outputPath) {
    console.log(filesArray);
    imagemin(filesArray, outputPath, {
        use: [
            imageminMozjpeg(),
            imageminPngquant()
        ]
    }).then((file) => {
        this.done = this.length;
        this.sender('使用imagemin压缩完成');
        this.setProgress();
    }).catch((info) => {
        console.log(info);
    });

}
