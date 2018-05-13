<template>
    <div class="">
        <div @dragenter.prevent="logger" @dragover.prevent="logger" @dragLeave.prevent="leave" @drop.prevent="drop"
             draggable="true" @click="logger" class="dragWindow">
            <template v-if="paths.length==0">
                <p class="tips" @click="selectFiles">拖拽到这里添加图片</p>
            </template>
            <ul class="fileUlList" v-else>
                <li v-for="item in paths">{{item}}</li>
            </ul>

        </div>
        <p style="font-size: 12px;">
            *只能添加同一个目录下的图片
        </p>
        <p>
            <button class="button button-primary button-small" @click="setOutputPath">输出目录</button>
            <template v-if="outputPath">
                <a @click="openFolder" href="javascript:void (0)">{{outputPath}}</a>
            </template>
            <template v-else>
                点左边按钮设置输出目录
            </template>
        </p>
        <p>
            压缩方式：
            <label>tinyPng<input type="radio" checked name="tinyType" :value="1" v-model="tinyType"/></label>
            <label>imagemin[本地]<input type="radio" name="tinyType" :value="2" v-model="tinyType">
            </label>
        </p>
        <div>
            <button class="button button-primary-flat button-small" @click="sendTiny">压缩并输出</button>
            <button class="button button-primary-flat button-small" @click="resetFileList">清空</button>
        </div>
    </div>

</template>
<script>
    import {ipcRenderer, remote, shell} from 'electron'

    const {dialog} = remote;
    let loadIndex;
    export default {
        name: 'tiny',
        data() {
            return {
                tinyType: 1,
                paths: [],
                hasDrop: false,
                outputPath: ""
            }
        },

        methods: {
            resetFileList() {
                this.paths = [];
            },
            logger() {
                console.log("log")
            },
            /**
             * 拖拽方式事件处理
             * @param e
             */
            drop(e) {
                console.log("drop");
                let fls = e.dataTransfer.files;
                if (this.paths.length > 0) {
                    layer.confirm('再次拖拽将要重置文件列表，是否继续', (index) => {
                        layer.close(index);
                        this.drop2File(fls);
                    });
                } else {
                    this.drop2File(fls);
                }

            },
            /**
             * 处理业务
             * @param fileList
             */
            drop2File(fileList) {
                //获取文件对象
                let paths = [];
                for (let val of fileList) {
                    if (val.type === "image/png" || val.type === "image/jpeg") {
                        paths.push(val.path);
                    }
                }
                this.paths = paths;
            },
            /**
             * 选择文件方式事件处理
             */
            selectFiles() {
                dialog.showOpenDialog({
                    title: '选择图片',
                    filters: [{name: '图片', extensions: ['jpg', 'png']}],
                    properties: ['openFile', 'multiSelections']
                }, (filenPaths) => {
                    if (filenPaths.length > 0) {
                        this.paths = filenPaths;
                    }
                })

            },
            setOutputPath() {
                dialog.showOpenDialog({
                    title: '选择目录',
                    filters: [{name: 'All Files', extensions: ['*']}],
                    properties: ['openDirectory']
                }, (filenames) => {
                    this.outputPath = filenames[0]
                })

            },
            openFolder() {
                shell.openItem(this.outputPath)
            },
            sendTiny() {
                if (this.paths.length > 0 && this.outputPath) {
                    loadIndex = layer.load(2, {
                        shade: 0.3
                    });
                    setTimeout(()=>{
                        ipcRenderer.send('minify', this.paths, this.outputPath, this.tinyType)
                    },500);
                } else {
                    layer.alert('输入内容不完整');
                }
            },
            sendNotification(msg) {
                const notification = {
                    title: '图片压缩工具',
                    body: msg
                };
                const myNotification = new window.Notification(notification.title, notification)
            },
            minifyCallback(event, msg) {
                layer.close(loadIndex);
                layer.msg(msg);
                this.sendNotification(msg)
            }
        },
        mounted() {
            ipcRenderer.on('updateMessage',(msg)=>{
                layer.confirm(msg);
            });
            ipcRenderer.on('minifyCallback', this.minifyCallback)
            document.ondragleave = (e) => {
                e.preventDefault();
            };
            document.ondrop = (e) => {
                e.preventDefault();
            };
            document.ondragenter = e => {
                e.preventDefault();
            };
            document.ondragover = e => {
                e.preventDefault();
            }
        }
    }
</script>
<style>
    .dragWindow {
        width: 100%;
        height: 200px;
        border: 2.5px dashed #e0e0e0;
        overflow-y: auto;
    }

    .tips {
        cursor: pointer;
        margin: 0;
        line-height: 200px;
        text-align: center;
        height: 200px;
        font-size: 40px;
        color: #090909;
    }

    .fileUlList {
        margin: 10px;
        padding: 0;
        list-style: none;
        font-size: 14px;
        color: black;
    }

    .fileUlList li {
        padding-bottom: 5px;
        line-height: 1.25;
        border-bottom: 1px solid #e0e0e0;
    }
</style>