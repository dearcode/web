
(function(window, $, undefined) {
    var grayscaleUtil = {
        gsCLS: 'gs-mask',
        grayscale: function(target) {
            var me = this;
            target = $(target);

            me.preCheck(target) && target.each(function(idx, ele) {
                target = $(ele);
                me.isMasked(target) ?
                    target.next().show():
                    target.after(me.initMask(target)).next().show();
            });
        },
        grayscaleReset: function(target) {
            var me = this;
            target = $(target);

            me.preCheck(target) && target.each(function(idx, ele) {
                target = $(ele);
                if(!me.isMasked(target)) return;
                target.next().hide();
            })

        },
        initMask: function(img) {
            //var pos = img.position(),
            var POSITION = {
                    'rc-wrap': {top:2, left: 2},
                    'contact' : {top: 2, left: 2},
                    'g-member-mgr': {top:4, left: 4},
                    'idcard': {width:120, height:120, top:10, left:10}
                },
                pos = (function() {
                    var pos;
                    for(var key in POSITION) {
                        if(POSITION.hasOwnProperty(key) && img.parents('.'+key).length) {
                            pos = POSITION[key];
                        }
                    }
                    return pos;
                }()),
                mask = $('<span class="'+ this.gsCLS+ '" title="不在线"></span>').
                css($.extend({
                    width:img.width(),
                    height:img.height()
                }, pos || {
                        left:img.position().left + parseFloat(img.css('border-left-width')) + parseFloat(img.css('padding-left')),
                        top: img.position().top + parseFloat(img.css('border-top-width')) + parseFloat(img.css('padding-top'))
                }));

            return mask;
        },
        isMasked: function(target) {
            return target.next().is('.'+this.gsCLS);
        },
        preCheck: function(target) {
            var ret =  !!target.length;
            if(!ret) return false;
            target.each(function() {
                if(this.tagName !== 'IMG') {
                    ret = false;
                    return false;
                }
            });
            if(!ret) {
                throw new Error('both fucntion grayscale and grayscaleReset are only can be used to img element');
            }
            return ret;
        }
    }

    window.gsu = grayscaleUtil;
    window.msgFixed = {
    	target: null,
    	getScrollTop: function() {
    		!this.target && (this.target = $(".panel-msg .bd"));
    		this.oldMgsNum = $('.msg-wrap .msg').length;
    		this.scrollTop = this.target && this.target.scrollTop();
    	},
    	setScrollTop: function() {
    		var h = 0;
    		$('.msg-wrap .msg').slice(0, $('.msg-wrap .msg').length - this.oldMgsNum || 0).each(function() {
    			h += ($(this).height() + 10);
    		});
    		this.target && this.target.scrollTop(this.scrollTop + h + 53);
    	}
    };

})(window,jQuery);
