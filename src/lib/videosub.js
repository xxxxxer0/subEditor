
    (function ($) {
        var tcsecs, timecode_max, timecode_min,parseStyle,colorRgb;
        $.fn.videoSub = function (options) {
            var _a, opts;
            if (typeof (typeof (_a = $('<video>').addtrack) !== "undefined" && _a !== null)) {
                opts = $.extend({}, $.fn.videoSub.defaults, options);
                return this.each(function () {
                    var $this, _a, bar, container, el, o, src,defaultStyle,$span;
                    el = this;
                    $this = $(this);
                    o = (typeof (_a = $.meta) !== "undefined" && _a !== null) ? $.extend(opts, $this.data()) : opts;
                    src = opts.src || $('track', this).attr('src') ;
                    
                    if (typeof src !== "undefined" && src !== null) {
                        container = $('<div class="' + o.containerClass + '">');
                        container.css({
                            'position': 'absolute',
                            'height': '100%',
                            'width' : '100%',
                            'top': '0',
                            'left' : '0'
                        });
                        // container = $this.wrap(container).parent();
                        $this.after(container)
                        bar = $('<div class="' + o.barClass + '">');
                        $span = $('<span></span>')
                        // bar.css('width', $this.outerWidth() - 40);
                        defaultStyle = {
                            'width': '100%',
                            'position': 'absolute',
                            'padding': '0 25px',
                            'text-align': 'center',
                            'color': '#ffffff',
                            'font-family': 'Helvetica, Arial, sans-serif',
                            'font-size': '16px',
                            'font-weight': 'bold',
                            'text-shadow': '#000000 1px 1px 0px',
                            'box-sizing': 'border-box'
                        };
                        bar.appendTo(container);
                        $span.appendTo(bar)
                        el.subtitles = [];
                        el.subcount = 0;
                        el.update = function (ret) {
                            var req = ret.trim()
                            var match = req.match(/\{.*\}/)
                            req = req.replace(/\{.*\}/g,'')
                            var targetStyle = parseStyle(match[0])
                            var style = $.extend({},defaultStyle,targetStyle)
                            bar.css(style)
                            $span.css('background',targetStyle.background.background)
                            var r, records;
                            records = req.replace(/(\r\n|\r|\n)/g, '\n').split('\n\n');
                            r = 0;
                            $(records).each(function (i) {
                                el.subtitles[r] = [];
                                return (el.subtitles[r++] = records[i].split('\n'));
                            });
                            $this.bind('play', function (e) {
                                return (el.subcount = 0);
                            });
                            $this.bind('ended', function (e) {
                                return (el.subcount = 0);
                            });
                            $this.bind('seeked', function (e) {
                                var _b;
                                el.subcount = 0;
                                _b = [];
                                while (timecode_max(el.subtitles[el.subcount][1]) < this.currentTime.toFixed(1)) {
                                    el.subcount++;
                                    if (el.subcount > el.subtitles.length - 1) {
                                        el.subcount = el.subtitles.length - 1;
                                        break;
                                    }
                                }
                                return _b;
                            });
                            return $this.bind('timeupdate', function (e) {
                                var subtitle;
                                subtitle = '';
                                if (el.currentTime.toFixed(1) > timecode_min(el.subtitles[el.subcount][1]) && el.currentTime.toFixed(1) < timecode_max(el.subtitles[el.subcount][1])) {
                                    subtitle = el.subtitles[el.subcount][2];
                                }
                                if (el.currentTime.toFixed(1) > timecode_max(el.subtitles[el.subcount][1]) && el.subcount < (el.subtitles.length - 1)) {
                                    el.subcount++;
                                }
                                return $span.html(subtitle);
                            });
                        };
                        return opts.subText ? 
                            el.update(opts.subText) :
                            ($.ajax({
                                method: 'get',
                                url: src,
                                success: el.update
                            }));
                    }
                });
            }
        };
        timecode_min = function (tc) {
            var tcpair;
            tcpair = tc.split(' --> ');
            return tcsecs(tcpair[0]);
        };
        timecode_max = function (tc) {
            var tcpair;
            tcpair = tc.split(' --> ');
            return tcsecs(tcpair[1]);
        };
        tcsecs = function (tc) {
            var secs, tc1, tc2;
            tc1 = tc.split(',');
            tc2 = tc1[0].split(':');
            return (secs = Math.floor(tc2[0] * 60 * 60) + Math.floor(tc2[1] * 60) + Math.floor(tc2[2]));
        };
        parseStyle = function (str) {
            /**
             * {\fs12\4a&H0&\an2\1c&HFFFFFF&\4c&H000000&}
             * 1 fontsize 
             * 2 background opacity
             * 3 position
             * 4 font color
             * 5 textshadow color
             */
            var fontSize,opacity,position,fontColor,shadowColor,backgroundColor,styleObj,split
            split = str.split('\\')
            for(var i = 1 ; i < split.length; i++) {
                if(/^fs/.test(split[i])) {
                    fontSize = split[i].replace(/fs/, '') + 'px'
                }else if(/^4a\&H.*\&$/.test(split[i])) {
                    opacity = split[i].match(/H(\S*)\&/)[1]
                }else if(/^an/.test(split[i])) {
                    position = split[i] == 'an2' ? 'bottom' : 'top'
                }else if(/^1c\&H.*\&$/.test(split[i])) {
                    fontColor = '#' + split[i].match(/H(\S*)\&/)[1]
                }else if(/^4c\&H.*\&/.test(split[i])) {
                    shadowColor = '#' + split[i].match(/H(\S*)\&/)[1]
                }
            }
            backgroundColor = colorRgb('#000000',opacity)
            styleObj = {
                'font-size' : fontSize,
                'color' : fontColor,
                'text-shadow' : shadowColor + ' 1px 1px 3px',
                background:{background:backgroundColor}
            }
            styleObj[position] = '40px'
            return styleObj
             
        };
        colorRgb = function (str,alpha) {
            var sColor = str.toLowerCase();
            
            //处理六位的颜色值
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            sColorChange.push((alpha / 255).toFixed(2))
            return "rgba(" + sColorChange.join(",") + ")";

        }
        $.fn.videoSub.defaults = {
            containerClass: 'videosub-container',
            barClass: 'videosub-bar',
            useBarDefaultStyle: true
        };
    })(jQuery);