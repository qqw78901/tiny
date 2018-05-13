const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const winston = require('winston');
const {createLogger, format, transports} = winston;
const {combine, timestamp, prettyPrint} = format;
const logger = createLogger({
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: 'combined.log'})
    ]
});
module.exports = function(filesArray, outputPath){
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
        logger.info(info);
    });

}
