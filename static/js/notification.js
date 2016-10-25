/**
 * 桌面通知
 */
define(function(require, exports, module){
	var
	    webTitle = document.title,
	    timer = null,
	    windowstatus = "",
	    util = require("util"),
	    ntimer = null,
	    support = window.webkitNotifications;
	
	
	
	function notify(icon,title, content, events, key){
		if(util.cookie("isOpenDesk") == "0"){
			return;
		}
		events = events || {};
		if(support){
			if(support.checkPermission() == 0){
				if(!content){
					return;
				}
				
				if(ntimer){
					clearTimeout(ntimer);
				}
				var notice = support.createNotification(icon ||"./img/img-avatar.png", title, content);

				if(key){
					notice.replaceId = key;
				}else{
					notice.replaceId = "edd.jd.com";
				}
				notice.onshow = function(){
					if(events.onshow){
						events.onshow(notice);
					}
//					show = true;
				};
				notice.onclose = function(){
					if(events.onclose){
						events.onclose();
					}
//					show = false;
				};
				notice.onclick = function(){
					if(events.onclick){
						events.onclick(notice);
					}
					notice.cancel();
				};

				notice.show();
                var ttl = parseInt(util.cookie("cttl"));
                if(isNaN(ttl)){
                    ttl = 10000;
                }
                if(ttl <= 10000) {
                    ntimer = setTimeout(function(){
                        if(notice) {
                            notice.cancel();
                        }
                    }, ttl);
                }
				return notice;
			}else{
				support.requestPermission(notify);
			}
		}else if(window.Notification){
			if(Notification.permission == "granted"){
				if(ntimer){
					clearTimeout(ntimer);
				}
				var notice = new Notification(title, {body:content,icon:icon||"./img/img-avatar.png", tag:key ||"ee.jd.com"});
				if(events){
					notice.onshow = onshow;
					notice.onshow = events.onshow;
					notice.onclose = events.onclose;
					notice.onerror = events.onerror;
				}
				notice.onclick = function(){
					if(events.onclick){
						events.onclick(notice);
					}
					notice.close();
				};
                var ttl = parseInt(util.cookie("cttl"));
                if(isNaN(ttl)){
                    ttl = 10000;
                }
                if(ttl <= 10000) {
                    ntimer = setTimeout(function(){
                        if(notice) {
                            notice.close();
                        }
                    }, ttl);
                }
                return notice;
			}
		}
		//支持改功能，但是用户还未授权
		// 0 授权   1未授权未拒绝  2拒绝
		/*if(support && support.checkPermission() != 2){
			setTimeout(function(){
				create(title, content, events);
			}, 3000);
		}else{
			create(title, content, events);
		}*/
		
		
	}
	
	function create(title, content, events){
		if(!content){
			return;
		}
		//不支持或者没有权限
		if($("#web-notice").length > 0){
			$("#web-notice").remove();
		}
		var html = build(title, content);
		if(events && events.onshow){
			events.onshow.call();
		}
		$("body").append(html);
		$("#web-notice-close").click(function(){
			if(events && events.onclose){
				events.onclick.call();
			}
			document.title = webTitle;
			if(timer){
				clearInterval(timer);
			}
			$("#web-notice").remove();
			return false;
		});
		if(events && events.onclick){
			$("#web-notice-content").click(events.onclick);
		}
		if(timer){
			clearInterval(timer);
		}
		timer = setInterval(function(){
			if(document.title != webTitle){
				document.title = webTitle;
			}else{
				document.title = "\u3010\u60a8\u6709\u65b0\u7684\u6d88\u606f\u3011";
			}
		}, 500);
	}
	
	function build(title, content){
		var html = "<div id='web-notice' class='web-notice'>"+
		"<h4 id='web-notice-title' class='web-notice-title'>"+title+"<span id='web-notice-close' class='web-notice-close'>\u00d7</span></h4>";
		html += "<div id='web-notice-content' class='web-notice-content'>"+content+"</div></div>";
		return html;
	}
	
	function urlNotify(url, events){
		var notice = null;
		if(!url){
			return;
		}
		if(util.cookie("isOpenDesk") == "0"){
			return;
		}
		if(support){
			if(support.checkPermission() == 0){
				notice = support.createHTMLNotification(url);
				notice.replaceId="ent.url.notification";
				if(events && typeof events == "object"){
					notice.onshow = events.onshow;
					notice.onclose = events.onclose;
					notice.onerror = events.onerror;
				}
				notice.onclick = function(){
					if(events.onclick){
						events.onclick();
					}
					notice.cancel();
				};
				$("#web-notice-url").remove();
				notice.show();
				return;
			}else{
				support.requestPermission(urlNotify);
			}
		}
		
	}
	
	function createIframe(url, events){
		var html = "<div id='web-notice-url' class='web-notice'><h4 id='web-notice-url-title' class='web-notice-title'><span id='web-notice-url-close' class='web-notice-close'>\u00d7</span></h4><div id='web-notice-url-content'><iframe src='"+url+"' class='web-notice-iframe'></iframe></div></div>";
		if($("#web-notice-url").length > 0){
			$("#web-notice-url").remove();
		}
		if(events && events.onshow){
			events.onshow.call();
		}
		$("body").append(html);
		$("#web-notice-url-close").click(function(){
			if(events && events.onclose){
				events.onclose();
			}
			$("#web-notice-url").remove();
			return false;
		});
		$("#web-notice-url-content").click(function(){
			if(events && events.onclick){
				events.onclick();
			}
			return false;
		});
	}
	
	
	function flashTitle(){
		if(timer){
			clearInterval(timer);
		}
		timer = setInterval(function(){
			if(document.title != webTitle){
				document.title = webTitle;
			}else{
				document.title = "\u3010\u60a8\u6709\u65b0\u7684\u6d88\u606f\u3011";
			}
		}, 500);
		$("body").click(function(){
			if(timer){
				clearInterval(timer);
			}
			document.title = webTitle;
            var conver = $(".panel-view").attr("conver");
            if(conver){
                var notice = Timline.getNotification(conver);
                if(notice){
                    notice.close();
                }
            }
		});
	}
	
	function requestPermission(callback){
		if(support){
			if(support.checkPermission() != 0){
				support.requestPermission(callback);
			}
		}
		//firefox
		if(window.Notification){
			if(Notification.permission === "default"){
				Notification.requestPermission(callback);
		    }
		}
	}
	
	function events(){
		$("#user_dest_set").click(function(){
			requestPermission();
		});
		$(window).blur(function(){
			windowstatus = "blur";
		}).focus(function(){
			windowstatus = "focus";
			$("body").click();
		});;
	}

  //获取简单的消息
  function getSimpleMsg(msg) {
    try{
      var tmp = $("<div></div>").html(msg);
      if(tmp.find("img").length > 0){
        msg = "[图片]"+tmp.text();
      }
      if(tmp.find("a[rel='send-file']").length > 0){
        msg = "[文件]";
      }
      if($.fn.jdExpression.replaceName(msg) != msg){
        tmp = $("<div></div>").html($.fn.jdExpression.replaceName(msg));
        msg = "[表情]"+tmp.text();
      }
      if(msg == "#A_振动"){
        msg = "[震屏]";
      }
      if(msg.length > 80){
        msg = msg.substring(0, 80)+"...";
      }
    }catch(e){

    }
    return msg;
  }
	
	function noticeMsg(icon,from, title, msg){
        var notice;
		if(windowstatus == "blur"){
            msg = getSimpleMsg(msg);
			notice = notify(icon,  title, msg, {
				onclick:function(notice){
					window.focus();
					if(!notice){
						return;
					}
					var conver = notice.replaceId || notice.tag;
					$("#recent-contacts").click();
					util.recentContactDom(conver).click();
					$("#text_in").focus();
				}
			},from);
            return notice;
		}
	}
	
	function hasPermission(){
		if(support){
			return support.checkPermission() == 0;
		}else if(window.Notification){
			return Notification.permission == "granted";
		}
		return false;
	}
	
	function isSupported(){
		return support || window.Notification;
	}

    function getWinStatus(){
        return windowstatus;
    }
	
	function systemMsg(msg){
//		DDstorage.set("system_msg_"+msg.body.mid, msg);
		var content = msg.body.content;
		if(content.length > 80){
			content = content.substring(0, 80)+"...";
		}
		if(hasPermission()){
			notice(msg.body.pic, msg.body.title, content,msg.body.mid, function(){
				var title = "<span style='vertical-align:middle'>系统消息&nbsp;-&nbsp;"+msg.body.title+"</span>", content;
				if(msg.body.pic){
					content = "<div style='text-align:left;'><img style='float:left;max-width:300px;max-height:240px; margin-right:20px;' src='"+msg.body.pic+"'>"+msg.body.content+"</div>";
				}else{
					content = "<div style='text-align:left;'>"+msg.body.content+"</div>";
				}
				
				window.focus();
				util.alert(title, content);
			});
		}
	}
	
	function notice(icon, title, content, mid,  onclick){
		var notice;
		if(window.webkitNotifications){
			notice = window.webkitNotifications.createNotification(icon ||"./img/img-avatar.png", title, content);
			notice.onclick = function(){
				onclick(mid);
				notice.cancel();
			};
			notice.replaceId = mid;
			notice.show();
		}else if(window.Notification){
			notice = new Notification(title, {body:content,icon:icon||"./img/img-avatar.png", tag:mid ||"ee.jd.com"});
			notice.onclick = function(){
				onclick(mid);
				notice.close();
			};
		}
	}
	
	events();
	return {
		notify:notify,
		urlNotify:urlNotify,
		flashTitle:flashTitle,
		noticeMsg: noticeMsg,
		hasPermission: hasPermission,
		isSupported: isSupported,
		requestPermission:requestPermission,
		systemMsg : systemMsg,
    getWindowStatus: getWinStatus,
    getSimpleMsg: getSimpleMsg
	};
});