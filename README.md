# tiny png tool

基于electron和tinypngAPI的图片压缩软件

在开发本地压缩过程出现问题，目前进度 ~~debuging~~  已修复




- 支持[tinyPng](https://tinypng.com/)方式压缩
- 支持本地压缩
- 软件配备热更新，在 [tinypngTool-Win版](http://www.gdutzuo.top/electron/tinypngTool/tinypngTool.exe)可下载 下载后自动更新到最新版本，[mac版dmg地址](http://www.gdutzuo.top/electron/tinypngTool/tinypng-1.3.0.dmg)



![demo](https://github.com/qqw78901/tiny/raw/master/demo.gif)


---

> tiny png

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


```

---

## 问题解决

- 本地压缩使用imagemin，开发环境不报错，打包构建后报错

解决方案：经过多翻调试，发现问题不在imagemin上而是在jpg和png的压缩plugin上；翻查issue发现解决方案：

> package.json的build项添加 "asar": false 
[issue地址](https://github.com/imagemin/imagemin-mozjpeg/issues/39)

问题解决。