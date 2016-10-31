/**
 *
 */
define("util",function(require, exports, module){

	/**
	 * 读取cookie cookie(key);
	 * 写cookie  cookie(key, value)
	 * 或者 cookie(key, value, {expires:days, path:, domain:"", secure:""});
	 * 删除cookie(key, any, {expires:-1})
	 */
	function cookie (key, value, options) {
	    if (arguments.length > 1 && String(value) !== "[object Object]") {
	        options = $.extend({}, options);
	        if (value === null || value === undefined) {
	            options.expires = -1;
	        }
	        if (typeof options.expires === 'number') {
	            var days = options.expires, t = options.expires = new Date();
	            t.setDate(t.getDate() + days);
	        }

	        value = String(value);

	        return (document.cookie = [
	            encodeURIComponent(key), '=',
	            options.raw ? value : encodeURIComponent(value),
	            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
	            options.path ? '; path=' + options.path : '',
	            options.domain ? '; domain=' + options.domain : "",
	            options.secure ? '; secure' : ''
	        ].join(''));
	    }
	    options = value || {};
	    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
	    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
	}

	/**
	 * 浏览器类型
	 */
	function browerType(){
		if(!!window.ActiveXObject || "ActiveXObject" in window){
			return "MSIE";
		}
		if(navigator.userAgent.indexOf("Chrome") > 0){
			return "Chrome";
		}
		if(navigator.userAgent.indexOf("Firefox")>0){
			return "Firefox";
		}
		if(navigator.userAgent.indexOf("Safari")>0) {
			return "Safari";
		}
		if(navigator.userAgent.indexOf("Camino")>0){
			return "Camino";
		}
		if(navigator.userAgent.indexOf("Gecko/")>0){
			return "Gecko";
		}
	}

	/**
	 * 返回格式化的当前时间
	 */
	function curTime(){
		return formatDate(new Date(), "yyyy-MM-dd HH:mm:ss");
	}

	/**
	 * 格式化时间
	 */
	function formatDate(date, pattern){
		var y1, y2, m1,m2, d1, d2, h1,h2,h3, h4, m3,m4,s1,s2;
		if(!date instanceof Date){
			date = parseDate(date);
		}
		y1 = date.getFullYear();
		y2 = String(y1).substring(2,4);
		m1 = date.getMonth()+1;
		m2 = m1;
		if(m2 < 10){
			m2 = "0"+m2;
		}
		d1 = date.getDate();
		d2 = d1;
		if(d2 < 10){
			d2 = "0"+d2;
		}
		h1 = date.getHours();
		h2 = h1;
		h3 = h1;
		h4 = h1;
		if(h2 < 10){
			h2 = "0"+h2;
		}
		if(h3 > 12){
			h3 = h3 - 12;
		}else if(h3 < 10){
			h3 = "0"+h3;
		}
		if(h4 > 12){
			h4 = h4 - 12;
		}
		m3 = date.getMinutes();
		m4 = m3;
		if(m4 < 10){
			m4 = "0"+m4;
		}
		s1 = date.getSeconds();
		s2 = s1;
		if(s2 < 10){
			s2 = "0"+s2;
		}
		return pattern.replace("yyyy", y1).replace("yy",y2).replace("MM", m2)
		       .replace("M",m1).replace("dd",d2).replace("d",d1).replace("HH",h2)
		       .replace("H",h1).replace("hh",h3).replace("h",h4).replace("mm",m4)
		       .replace("m",m3).replace("ss",s2).replace("s",s1);
	}

	/**
	 * 将字符串转换为时间
	 */
	function parseDate(input){
        if(!input){
            return new Date();
        }
		var arr = input.split(/\D+/),
	        date = new Date();
		date.setHours(0, 0, 0, 0);
		if(arr.length >= 3){
			date.setYear(parseInt(arr[0],10));
			date.setMonth(parseInt(arr[1]-1, 10));
			date.setDate(parseInt(arr[2], 10));
		}
		if(arr.length >=6 ){
			date.setHours(parseInt(arr[3], 10), parseInt(arr[4],10), parseInt(arr[5],10), 0);
		}
		return date;

	}

	/**
	 * 将字符转换为16进制编码
	 */
	function toHexString(args){
		var len, result = "", i=0, code;
		if(!args){
			return result;
		}
		len = args.length;
		for(i; i<len; i++){
			code = args.charCodeAt(i);
			if(code < 128){
				result += args.charAt(i);
				continue;
			}
			result += "\\u"+args.charCodeAt(i).toString(16);
		}
		return result;
	}

	function log(msg){
		if(window.console && console.log){
			console.log(msg);
		}
	}

	function info(msg){
		if(window.console && console.info){
			console.info(msg);
		}
	}

	function warn(msg){
		if(window.console && console.warn){
			console.warn(msg);
		}
	}

	/**
	 *
	 */
	function alert(title, msg, confirmclick,canleClick){
		if($("#msgbox-alert-mask").length > 0){
			return;
		}
		 var html = "<div id='msgbox-alert-mask' class='msgbox-mask'></div>" +
         "<div id='msgbox-alert-main' class='msgbox-main'>" +
         "<h5 id='msgbox-alert-title' class='msgbox-title'>"+title+
         "<span id='msgbox-alert-close' class='msgbox-close'></span></h5>" +
         "<div id='msgbox-alert-content' class='msgbox-content'></div>" +
         "<div class='msgbox-bottom'><a  id='msgbox-alert-ok' class='msgbox-btn' href='javascript:;'>确定</a></div>" +
         "</div>";
		$("body").append(html);
		$("#msgbox-alert-content").html(msg);
		$("#msgbox-alert-close").click(function(){
			if(canleClick){
				canleClick($(this));
			} else {
                if(confirmclick) {
                    confirmclick($(this));
                }
            }
			$("#msgbox-alert-mask").remove();
			$("#msgbox-alert-main").remove();
			return false;
		});
		$("#msgbox-alert-ok").click(function(){
			if(confirmclick){
				confirmclick($(this));
			}
			$("#msgbox-alert-mask").remove();
			$("#msgbox-alert-main").remove();
			return false;
		});
		$("body").bind("keydown", function(evt){
			if(evt.keyCode == 13){
				$("#msgbox-alert-ok").click();
			}
		});

		//调整弹窗的位置
        var docWidth, docHeight, msgBoxWidth;
        docWidth = $(document).width();
		docHeight = $(document).height()+$(window).scrollTop();
        msgBoxWidth = $("#msgbox-alert-main").width();

        $("#msgbox-alert-main").css("left", (docWidth-msgBoxWidth)/2+"px");
		$("#msgbox-alert-main").css("top", docHeight*25%+"px");
	}

	/**
	 *
	 */
	function confirm(title, msg, okEvent, cancleEvent){
		 var html = "<div id='msgbox-confirm-mask' class='msgbox-mask'></div>" +
         "<div id='msgbox-confirm-main' class='msgbox-main'>" +
         "<h5 id='msgbox-confirm-title' class='msgbox-title'>"+title+
         "<span id='msgbox-confirm-close' class='msgbox-close'></span></h5>" +
         "<div id='msgbox-confirm-content' class='msgbox-content'></div>" +
         "<div class='msgbox-bottom'>" +
         "<a id='msgbox-confirm-ok' class='msgbox-btn' href='javascript:;'>确定</a>" +
         "<a id='msgbox-confirm-cancel' class='msgbox-btn-gray' href='javascript:;'>取消</a></div>" +
         "</div>", height, docHeight;
		$("body").append(html);
		$("#msgbox-confirm-content").html(msg);
		$("#msgbox-confirm-close").click(function(){
			$("#msgbox-confirm-mask").remove();
			$("#msgbox-confirm-main").remove();
			return false;
		});
		$("#msgbox-confirm-ok").click(function(){
			if(okEvent){
				okEvent($(this));
			}
			$("#msgbox-confirm-close").click();
			return false;
		});
		$("#msgbox-confirm-cancel").click(function(){
			if(cancleEvent){
				cancleEvent($(this));
			}
			$("#msgbox-confirm-close").click();
			return false;
		});
		height = $("#msgbox-confirm-title").outerHeight()
                 +$("#msgbox-confirm-content").outerHeight()+
                 $("msgbox-confirm-ok").outerHeight()
                 +parseInt($("#msgbox-confirm-content").css("paddingTop"))+50;
        $("#msgbox-confirm-main").height(height);
    	docHeight = $(document).height()+$(window).scrollTop();
		$("#msgbox-confirm-main").css("top", docHeight*25%+"px");
	}

	/**
	 * 弹出框
	 */
	function popup(title, content){
		if(!title){
			title = "";
		}
		if(!content){
			return;
		}
		var html = "<div id='msgbox-pop-mask' class='msgbox-mask'></div>" +
				"<div id='msgbox-pop-main' class='msgbox-main'>" +
        "<h5 id='msgbox-pop-title' class='msgbox-title'>"+title+
        "<span id='msgbox-pop-close' class='msgbox-close'></span></h5>" +
        "<div id='msgbox-pop-content'></div>", height, h2 = 0;
		$("body").append(html);
		$("#msgbox-pop-content").html(content);
		$("#msgbox-pop-close").click(function(){
			$("#msgbox-pop-mask").remove();
			$("#msgbox-pop-main").remove();
		});
		//首先调整高度
		height = $("#msgbox-pop-title").outerHeight()+$("#msgbox-pop-content").outerHeight();
		$("#msgbox-confirm-main").height(height);
		//如果有图片的话，则需要再次调整高度
		$("#msgbox-pop-content img").load(function(){
			var h = $(this).height();
			h2 = $("#msgbox-pop-content").height();
			if(h > h2){
				$("#msgbox-pop-content").height(h);
			}
			height = $("#msgbox-pop-title").outerHeight()+$("#msgbox-pop-content").outerHeight();
			$("#msgbox-confirm-main").height(height);
		});

	}

	/**
	 * 显示进度条
	 */
	function progress(current, total, target, showPercent,  showCancel, cancelEvent){
		var percent = "", html="", width = 0, left, top;
		if(isNaN(current) || isNaN(total) || !target){
			return;
		}
		if(current > total){
			return;
		}
		if(current == total){
			showCancel = false;
			setTimeout(function(){
				target.children(".ui-progress").remove();
				target.children(".ui-progress-clear").remove();
				target.children(".ui-progress-cancel").remove();
			}, 200);
		}
		if(target.nodeType || typeof target == "string"){
			target = $(target);
		}
		percent = (current/total*100).toFixed(2)+"%";
		if(target.children(".ui-progress").length == 0){
			html = "<div class='ui-progress'><span class='ui-progress-text'></span><span class='ui-progress-current'></div><div class='ui-progress-clear'></div><span class='ui-progress-cancel'>\u00d7</span>";
		}
		target.append(html);
		width = target.children(".ui-progress").width()*current/total;
		target.children(".ui-progress").children(".ui-progress-current").width(width);
		if(showPercent){
			target.children(".ui-progress").css("height","15px");
			target.children(".ui-progress").children(".ui-progress-current").css("height","15px");
			left = target.children(".ui-progress").position().left+target.children(".ui-progress").width()/2-4;
			top = target.children(".ui-progress").position().top;
			target.children(".ui-progress").children(".ui-progress-text").css({"top":top+"px","left":left+"px"}).text(percent);
		}
		target.children(".ui-progress").attr("title",percent);
		if(!showCancel){
			target.children(".ui-progress-cancel").hide();
		}

		if(showCancel){
			target.children(".ui-progress-cancel").unbind("click").bind("click", function(){
				if(cancelEvent){
					cancelEvent();
				}
				target.children(".ui-progress").remove();
				target.children(".ui-progress-clear").remove();
				target.children(".ui-progress-cancel").remove();
			});
		}
	}

	function isNumber(target){
		 var reNum =/^\d*$/;
	      return (reNum.test(target));
	};

	/**
	 * 消息过滤
	 */
	function filterMsg(msg, replaceExp, replaceurl){
		if(!msg){
			return msg;
		}
		try{
			//可能绑定有事件
			if(/<img.*(onload|onerror)\s*=.+>/i.test(msg)){
				msg = msg.replace(/(onerror|onload)\s*=/gi,'');
			}
			var temp = $("<div></div>").html(msg);
			var result = "";
            var flag = false;
			temp.find("*").each(function(){
				//发送图片、接收到的图片
				if($(this).hasClass("message-img") && this.tagName && this.tagName.toLowerCase() =='img'){
                    flag = true;
					return;
				}
				//发送的文件，被下面的
				if($(this).parent().attr("rel") == "send-file" && this.tagName && this.tagName.toLowerCase() =='img'){
					flag = true;
                    return;
				}

				if($(this).hasClass("image-file") && this.tagName && this.tagName.toLowerCase() == "a"){
					//上传的图片
					filterEvents(this);
					result += $(this).wrap("<div></div>").parent().html();
                    flag = true;
				}else if($(this).attr("rel") == "send-file" && this.tagName && this.tagName.toLowerCase() =='a'){
					var url = $(this).attr("href");
					var text = $(this).text();
                    flag = true;
					result += "<a download='"+text+"' href='"+url+"' target='_blank' rel='send-file'><img src='./img/file2.png' style='vertical-align:middle;margin-right:10px;'/>"+text+"</a>";
				}else if($(this).attr("rel") == "gallery" && this.tagName && this.tagName.toLowerCase() =='a'){
					//客户端发送的图片
					result += filter0(getNodeHtml(this));
                    flag = true;
				}else{

				}
			});
			//可能是纯文本
			if(!result){
				result = msg;
			}
			if(replaceExp){
				var af = $.fn.jdExpression.replaceName(result);
                if(af != result) {
                    flag = true;
                    result = af;
                }
			}
            if(!flag) {
                result = result.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
            if(replaceurl) {
                result = replaceURL(result);
            }
			return result;
		}catch(e){

		}
		return msg;
	}

    function replaceURL(msg){
        var regexA = new RegExp("[iI][mM][gG][\\s\\S]*[sS][rR][cC][\\s\\S]*[=]");
        var regexIMG = new RegExp("[aA][\\s\\S]*[hH][rR][eE][Ff][\\s\\S]*[=]");
        if (regexA.test(msg) || regexIMG.test(msg)) {
            return msg;
        }

        var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|\+|\(|\)|;|%|#|,|_|:)+)/g;
        var atag;

        if (reg.test(msg)) {
            atag = msg.replace(reg,
                "<a href='$1$2' target=\"_blank\" tips='tips'>$1$2</a>");
        } else {
            var reg = /(www\.)((\w|=|\?|\.|\/|&|-|\+|\(|\)|;|%|#|,|_|:)+)/g;
            atag = msg.replace(reg,
                "<a href='http://$1$2' target=\"_blank\" tips='tips'>$1$2</a>");
        }

        return atag;
    }

	function filter0(msg){
		var wrap = $("<div></div>").html(msg);
		var dom = wrap.get(0);
		var next = dom.firstChild;
		var result = "";
		while(next){
			if(next.nodeType == 3){
				result += next.nodeValue;
			}else if(next.nodeType == 1){
				filterEvents(next);
				result += getNodeHtml(next);
			}
			next = next.nextSibling;
		}
		return result;
	}

	function getNodeHtml(node){
		if(!node || node.nodeType != 1){
			return "";
		}
		var wrap = document.createElement("div");
		wrap.appendChildren(node.cloneNode());
		return wrap.innerHTML;
	}
	/**
	 * 过滤节点上绑定的事件
	 */
	function filterEvents(node){
		if(!node || !node.nodeName){
			return;
		}
		try{
			var attrs = node.attributes;
			for(var i=0; i<attrs.length; i++){
				var name = attrs[i].name.toLowerCase();
                if (name.indexOf("on") == 0) {
                    $(node).removeAttr(attrs[i].name);
                }
			}
			if(node.children){
				for(var i=0; i<node.children.length; i++){
					filterEvents(node.children[i]);
				}
			}
		}catch(e){

		}
	}
	/**
	 * 生成随机uuid
	 */
	function uuid(){
		var s = [];
		var hexDigits = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits[Math.floor(Math.random() * 0x10)];
		}
		s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits[(s[19] & 0x3) | 0x8];  // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	}

	/** 转换uid中@字符， 带@的账号为自建账号，jquery选择器需要转换*/
	function replaceAt(uid) {
		var reg = /@/g;
		return reg.test(uid) ? uid.replace(reg, "\\@") : uid;
	}

	function jqDom(prefix, sid){
		return $(prefix + replaceAt(sid));
	}

	function recentContactDom(sid){
		return jqDom("#recent-contact-", sid);
	}

	function searchResDom(sid){
		return jqDom("#search-re-", sid);
	}

	function contactDom(sid){
		return jqDom("#contact-", sid);
	}

	return {
		cookie:cookie,
		browerType:browerType,
		curTime:curTime,
		formatDate:formatDate,
		parseDate:parseDate,
		log: log,
		info: info,
		warn: warn,
		alert: alert,
		confirm: confirm,
		progress:progress,
		isNumber:isNumber,
		filterMsg: filterMsg,
		popup:popup,
		uuid:uuid,
		replaceAt:replaceAt,
		recentContactDom:recentContactDom,
		searchResDom:searchResDom,
		contactDom:contactDom
	};
});
