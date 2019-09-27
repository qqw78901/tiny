import {ipcMain} from 'electron'

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
// import imagemin from 'imagemin';
// import imageminMozjpeg from 'imagemin-mozjpeg'
// import imageminPngquant from 'imagemin-pngquant'

const tinify = require("tinify");
// const Mini = require('./mini.js');
const path = require('path');
const fs = require('fs');
// const winston = require('winston');
// const {createLogger, format, transports} = winston;
// const {combine, timestamp, prettyPrint} = format;
// const logger = createLogger({
//     format: combine(
//         timestamp(),
//         prettyPrint()
//     ),
//     transports: [
//         new transports.Console(),
//         new transports.File({filename: 'combined.log'})
//     ]
// });
tinify.key = "MRipunF_0WpIfMxnrPa9LQEDLny7VL_m";
export default class Minify {
    constructor(mainWindow) {
        // console.log(mainWindow)
        this.mainWindow = mainWindow;
        this.on();
        this.sender();
    }

    /**
     * 监听压缩
     */
    on() {
        /**
         * type 压缩类型，1：tiny压缩；2：本地压缩
         */
        ipcMain.on('minify', (event, files, outputPath, type) => {
            console.log(files);
            console.log(outputPath);
            this.length = files.length;
            this.done = 0;
            if (type === 1) {
                tinify.validate((err) => {
                    if (err) {
                        this.sender('密钥失效,使用本地压缩');
                        this.localMinify(files, outputPath);
                    } else {
                        files.map((val) => {
                            this.minifying(val, outputPath)
                        });
                    }
                });
            } else {
                this.localMinify(files, outputPath);
            }
        });
    }

    /**
     * 发送消息
     * @param msg
     */
    sender(msg) {
        this.mainWindow.webContents.send('minifyCallback', msg)
    }
    /**
     * 发送通知
     * @param msg
     */
    notice(msg) {
        this.mainWindow.webContents.send('notice', msg)
    }

    /**
     * 主线程任务条进度
     * @param staticPercent 传的时候定死进度条的进度值
     */
    setProgress(staticPercent) {
        this.mainWindow.setProgressBar(staticPercent ? staticPercent : this.done / this.length);
        if (this.done === this.length) {
            this.sender('压缩完成');
            this.mainWindow.setProgressBar(0);

        }
    }

    /**
     * 处理压缩的逻辑
     * @param filePath
     * @param outputPath
     */
    minifying(filePath, outputPath) {
        let fileName = path.basename(filePath);
        let outPath = path.join(outputPath, fileName);
        tinify.fromFile(filePath).toFile(outPath, (err) => {
            if (err instanceof tinify.AccountError) {
                console.log("The error message is: " + err.message);
                this.sender('账号失效');
                // Verify your API key and account limit.
            } else if (err instanceof tinify.ClientError) {
                this.sender('Check your source image and request options');
                // Check your source image and request options.
            } else if (err instanceof tinify.ServerError) {
                this.sender("服务器错误")
                // Temporary issue with the Tinify API.
            } else if (err instanceof tinify.ConnectionError) {
                this.sender("网络连接错误，请重试")
                // A network connection error occurred.
            } else if (err) {
                this.sender(err.message);
                // Something else went wrong, unrelated to the Tinify API.
            } else {
                ++this.done;
                this.setProgress();
            }
        });
    }

    /**
     * imagemin方式本地压缩
     * @param filesArray
     * @param outputPath
     */
    localMinify(filesArray, outputPath) {
        // this.setProgress(0.01);
        // filesArray.forEach(filePath => {
        //     let basename = path.basename(filePath)
        //     this.notice(filePath);
            
        // })
        this.notice(JSON.stringify(filesArray) + outputPath);
        imagemin(filesArray, path.join(outputPath,''), {
            use: [
                imageminMozjpeg({}),
                imageminPngquant({})
            ]
        }).then((file) => {
            this.done++;
            this.setProgress();
        }).catch((err) => {
            setTimeout(() => {
                this.sender(JSON.stringify(err));
            }, 2000);
        });
        /*   imagemin(filesArray, outputPath, {
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
           });*/
    }

}
