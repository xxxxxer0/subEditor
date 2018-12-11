import '../sass/global.scss'
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue'
import axios from 'axios'
import listMap from './data'
import lib from '../lib/lib'
import vuescroll from 'vuescroll';
import 'vuescroll/dist/vuescroll.css';
import { Slider, Notification } from 'element-ui';
import '../lib/videosub'


axios.defaults.withCredentials = true;  //让ajax携带cookie
Vue.component(Slider.name, Slider);
Vue.prototype.$notify = Notification;
Vue.use(vuescroll,{
    ops:{
        scrollPanel:{
            initialScrollY:true
        },
        rail: {
            background: '#232323',
            opacity: 1,
            size: '14px',
            keepShow : true,
            specifyBorderRadius : '1px',
            gutterOfSide : '10px'
        },
        bar: {
            keepShow: true,
            background: '#404040',
            opacity: 1
        }
    }
});


let {
    fontPositionOptions,
    fontSizeOptions,
    fontColorList,
    textShadowList
} = listMap

new Vue({
    el: '#app',
    data() {
        return {
            isToggle: false, //进度条是否展开
            fontPositionOptions, //字体位置选项
            fontSizeOptions, //字体尺寸选项
            playing: false, //播放中
            currentTime: '', //视频当前时间
            fontColorList, //字体颜色列表
            textShadowList, //
            opacity: 0, //字体透描边透明度
            progress: 0, //视频进度
            divides: [], //刻度尺数据  
            duration: 0, //视频长度 单位s
            volume: 0, //音量
            subList: [], //字幕条目
            subValue: '', //当前编辑字幕
            videoEle: null, //视频节点对象
            hasChecked: false, //是否选总编辑字幕
            srtSrc: '', //srt文件路径
            isloading: false, //加载中
            curSub: {}, //当前正在编辑的字幕条目
            scale: 0  //比例尺缩放级数
        }

    },
    mounted: function () {
        var self = this
        var video = self.$refs.video
        self.videoEle = video
        self.srtSrc = document.querySelector('track').src
        this.initVideoData()
        this.loadSrt()
        this.keyDownSave()

    },
    computed: {
        //计算每秒字数
        velocity() {
            return function (item) {
                var start = lib.parseTime(item.start)
                var end = lib.parseTime(item.end)
                return (item.text.length / (end - start)).toFixed(2)
            }
        },
        //计算刻度缩放时的宽度
        innerWidth() {
            if(!this.isToggle) {
                return '754px'
            }else {
                return (this.scale * 0.2 + 1) * 1160 + 'px' 
            }
        }
    },
    methods: {


        //获取视频链接 并初始化视频数据
        initVideoData() {
            var self = this
            var video = self.videoEle
            video.oncanplay = function () {
                if (self.duration) return
                self.duration = video.duration
                self.volume = video.volume * 10
                self.createDivides(35)

                self.displaySub()
            }
        },

        //组合键保存字幕
        keyDownSave() {
            lib.keydownSave(this.preview)
        },

        /**
         * 构造刻度尺数据 
         * @param {Number} count  刻度尺数量 控制条展开为55 收起为35
         */
        createDivides(count) {
            this.divides = []
            var divide = this.duration / count

            var value = 0
            for (var i = 0; i <= count; i++) {
                this.divides.push(value)
                value += divide
            }

        },
        //格式化时间
        formatTime(s) {
            return lib.formatTime(s)
        },

        //选取字体颜色
        checkFontColor(key, list) {
            list.forEach((item, index) => {
                item.checked = 0
            })
            list[key].checked = 1
        },

        //输入字幕
        inputSub() {
            this.pause()
            this.curSub.start = lib.formatTime(this.videoEle.currentTime)
        },

        //添加字幕条目
        addSub() {
            var obj = {
                end: lib.formatTime(this.videoEle.currentTime + 2),
                text: this.subValue,
                checked: 0
            }
            Object.assign(this.curSub, obj)
            this.curSub.velocity = lib.velocity(this.curSub)
            this.subValue = ''
            this.$refs.subInput.blur()
            this.subList.push(this.curSub)
            this.curSub = {}
            this.sortSubList()
            this.play()
        },

        //编辑字幕条目
        editSub(key) {
            var flag = false
            this.subList[key].checked = !this.subList[key].checked
            //看是否有条目被选中 判断点亮删除图标
            this.subList.forEach( item => {
                if(item.checked) {
                    flag = true
                }
            })
            this.hasChecked = flag
        },



        //删除字幕
        delSub() {
            var count = 0 //多少个被选中
            this.subList.sort((a, b) => a.checked - b.checked)
            this.subList.forEach((item, index) => {
                if (item.checked) count++
            })
            for (var i = 0; i < count; i++) {
                this.subList.pop()
            }
        },

        //视频时间更新事件
        timeupdate() {
            this.currentTime = this.videoEle.currentTime
            this.isloading = false
        },

        //视频进度条拖拽
        videoSlide(val) {
            this.videoEle.currentTime = val
            this.play()
        },

        //视频拖拽进度条前先暂停视频
        mousedown() {
            this.videoEle.pause()
        },

        //刻度尺放大级数
        scaleChange(val) {
            
   
        },

        //音量拖拽 音量范围[0,1]
        volumeChange(val) {
            this.videoEle.volume = val / 10
        },
        //静音
        muted() {
            this.volume = 0
            this.videoEle.volume = 0
        },
        //暂停
        pause() {
            this.videoEle.pause()
            this.playing = false
        },

        //播放
        play() {
            this.videoEle.play()
            this.playing = true
        },


        //停止
        reload() {
            this.videoEle.load()
            this.playing = false
        },

        //前进
        next() {
            var divide = this.duration / 35
            this.videoEle.currentTime += divide
        },

        //后退
        prev() {
            var divide = this.duration / 35
            var currentTime = this.videoEle.currentTime
            currentTime = currentTime < divide ? 0 : currentTime - divide
            this.videoEle.currentTime = currentTime
        },
        //滚动条滚右边
        srollRight() {
            this.$refs['scrollBar'].scrollBy({dx: '-80'})
        },
        //滚动条滚左边
        srollLeft() {
            
            this.$refs['scrollBar'].scrollBy({dx: '20%'})

        },

        //刻度尺放大
        expand() {
            if(this.scale >= 5) return
            this.scale ++

        },

        //刻度尺缩小
        zoom() {
            if(this.scale <= 0) return
            this.scale--
        },


        //选择字体尺寸、位置
        checkFontStyle(index, options) {
            options.forEach((item, index) => {
                item.checked = 0
            })
            options[index].checked = 1

        },

        //渲染字幕列表
        renderSubList(srt) {
            var srtLine = srt.replace(/(\r\n|\r|\n)/g, '\n').split('\n\n')
            var styleStr = srt.match(/\{.*\}/)[0]
            srtLine.forEach((item) => {
                var split = item.split('\n')
                var obj = {
                    start: split[1].split(' --> ')[0],
                    end: split[1].split(' --> ')[1],
                    text: split[2].replace(/\{.*\}/g, ""),
                    checked: 0
                }
                obj.velocity = lib.velocity(obj)
                this.subList.push(obj)
            })
            //解析获取样式
            var fontSize,opacity,position,fontColor,shadowColor,backgroundColor,split
            split = srt.split('\\')
            for(var i = 1 ; i < split.length; i++) {
                if(/^fs/.test(split[i])) {
                    fontSize = split[i].replace(/fs/, '') 
                }else if(/^4a\&H.*\&$/.test(split[i])) {
                    opacity = split[i].match(/H(\S*)\&/)[1]
                }else if(/^an/.test(split[i])) {
                    position = split[i] == 'an2' ? 2 : 8
                }else if(/^1c\&H.*\&$/.test(split[i])) {
                    fontColor = '#' + split[i].match(/H(\S*)\&/)[1]
                }else if(/^4c\&H.*\&/.test(split[i])) {
                    shadowColor = '#' + split[i].match(/H(\S*)\&/)[1]
                }else {
                    
                }
            }
            this.setStyle({
                fontSize,
                position,
                fontColor,
                shadowColor,
                opacity
            })

        },

        //设置样式
        setStyle(opt) {
            var self = this
            checkFromList(self.fontColorList, opt.fontColor)
            checkFromList(self.textShadowList, opt.shadowColor)
            checkFromList(self.fontPositionOptions, opt.position)
            checkFromList(self.fontSizeOptions, opt.fontSize)

            function checkFromList(list, checked) {
                list.forEach(item => {
                    item.option == checked || item.value == checked ? item.checked = 1 : item.checked = 0
                })
            }
            var opacity = ((opt.opacity / 255) * 100).toFixed(0)
            self.opacity = parseInt(opacity)
        },

        //加载字幕列表
        loadSrt() {
            var self = this
            if (!self.srtSrc) return
            axios.get(self.srtSrc).then(({data}) => {
                var srt = data.trim()
                self.renderSubList(srt)
            })
        },


        //下载字幕文件
        download() {
            var styleStr = this.packageData()
            var srt = lib.writeSrt(this.subList,styleStr)
            //生成文本下载文件
            var aLink = document.createElement('a');
            var blob = new Blob([srt], {
                type: 'text/plain'
             });
            var evt = new Event('click');
            aLink.download = 'srt字幕.srt';
            aLink.href = URL.createObjectURL(blob);
            aLink.click();
            URL.revokeObjectURL(blob);
        },

        //视频字幕显示
        displaySub(opt = {}) {
            var self = this
            if (!self.srtSrc) return
            //先解绑事件
            $('video').unbind('timeupdate').unbind('seeked')
            $('.videosub-container').remove()
            opt.src = self.srtSrc
            $('video').videoSub(opt)
        },


        //组装数据
        packageData() {
            var fontColor = lib.findColor(this.fontColorList)
            var textShadow = lib.findColor(this.textShadowList)
            var opacity = (255 * (this.opacity / 100)).toFixed(0)
            var fontSize = this.fontSizeOptions.find(item => item.checked).value
            var fontPosition = this.fontPositionOptions.find(item => item.checked).value
            this.subList.forEach((item, index) => {
                item.num = index + 1
            })
            var styleStr = '{\\fs' + fontSize + '\\4a&H' + opacity + '&\\an' + fontPosition + '\\1c&H' + fontColor + '&\\4c&H' + textShadow + '&}'
            return styleStr

        },

        //预览字幕
        preview() {
            var self = this
            var styleStr = this.packageData()
            var srt = lib.writeSrt(this.subList,styleStr)
            this.displaySub({subText: srt})
            this.$notify({
                title: '成功',
                message: '预览成功',
                type: 'success'
            });
        },

        //跳到该字幕时间
        viewSingleSub(time) {
            var second = lib.parseTime(time)
            this.videoEle.currentTime = second
        },

        //字幕列表排序
        sortSubList() {
            this.subList.sort((a, b) => {
                return lib.parseTime(a.start) - lib.parseTime(b.start)
            })
        }




    },
    watch: {
        isToggle(val) {
            var count = val ? 55 : 35
            this.createDivides(count)
        },
        scale(val) {
            this.createDivides((val * 0.2 + 1) * 55)
        }
    },
    filters: {
        formatTime(s) {
            return lib.formatTime(s)
        }
    }
})