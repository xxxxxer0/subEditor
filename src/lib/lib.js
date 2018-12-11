import axios from 'axios'


export default {
    formatTime(s) {
        s = s / 1
        var h = Math.floor(s / 3600) + ''
        h = h.length > 1 ? h : '0' + h 
        s = s % 3600
        var m = Math.floor(s / 60) + ''
        m = m.length > 1 ? m : '0' + m 
        s = (s % 60).toFixed(3)
        s = (s + '').split('.')[0].length > 1 ? s : '0' + s
        s = s.replace(/\./g,",")
        return h + ':' + m + ':' + s
    },
    getMax(obj) {
        var arr = []
        for (var key in obj) {
            if (key == 'yuanhua') {
                return 'yuanhua'
            }
            arr.push(key)
        }
        return Math.max.apply(this, arr)
    },
    decr (r) {
        var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!~*-_.()'".split("");
        var n = [];
        var a = [];
        r.split("").reverse().forEach(function (r, t) {
            var o = e.indexOf(r);
            if (parseInt((t + 1) % 2) == 1) {
                a.push(o)
            } else {
                var p = parseInt(o - a[(t + 1) / 2 - 1]);
                n.push(e[p])
            }
        });
        var t = n.join("").replace(/@/g, "%");
        return decodeURIComponent(t)
    },
    deCodeArg(target) {
        var srcMap = {};
        if (JSON.parse) {
            srcMap = JSON.parse(this.decr(target));
        } else {
            srcMap = eval('(' + this.decr(target) + ')');
        }
        return srcMap;
    },

    


    //返回选中项
    findColor(list) {
        var color = list.find( item => item.checked).option
        color = color.replace(/\#/g,"")
        return color

    },

    //xx:xx:xx,xxx -> xxx.xx s
    parseTime (time) {
        time = time.replace(/\,/,'.')
        var split = time.split(':')
        return ( (split[0]/1) * 3600 ) / 1 + ( (split[1]/1) * 60 ) / 1 + ( split[2] ) /1
    },


    //ctrl + s 事件
    keydownSave(cb) {
        document.onkeydown = function(e) {
            var keyCode = e.keyCode || e.which || e.charCode;
            var ctrlKey = e.ctrlKey || e.metaKey;
            if(ctrlKey && keyCode == 83) {
                // e.preventDefault();
                cb && cb()
                return false;
            }
            
            // 
        }
    },
    //计算每秒字数
    velocity(item) {
        var start = this.parseTime(item.start)
        var end = this.parseTime(item.end)
        return (item.text.length / (end - start)).toFixed(2)

    },

    //写srt文本
    writeSrt(sublist,style) {
        var srt = ''
        sublist.forEach((item,i) => {
            srt += 
            `${i+1}
${item.start} --> ${item.end}
${style} ${item.text}

`
        })
        return srt
    }



}