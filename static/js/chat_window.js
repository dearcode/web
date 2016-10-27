/**
 * @author yfwuhuan
 */

define("chat_window",["util"],function(util){
	var textInVal = []; //保存输入框中的内容

    var _getHistoryMessages = function(conver, type){
        if($.isNumeric(conver)){
            get_group_history_all(conver, function(data){
                if(data.body){
                    msgWindow.showHistoryMsg(data.body, conver, type);
                }
            });
        } else {
            get_chat_history_all(conver,function(data){
                if(data.body){
                    msgWindow.showHistoryMsg(data.body, conver, type);
                }
            })
        }
    };

	var msgWindow={
		create:function(conver,kind){
			if(conver == util.cookie("uid")){
				$(".triangle-flag").hide();
				util.alert("提示","不能和自己聊天");
				return;
			}
			var text = $("#text_in").val();
			var f = false;
			for(var i=0; i<textInVal.length; i++){
				if(textInVal[i].key == this.conver){
					textInVal[i].value = text;
					f = true;
					break;
				}
			}
			if(!f){
				var kv = {};
				kv.key = this.conver;
				kv.value = text;
				textInVal.push(kv);
			}

			$("#text_in").val('');
			this.conver=conver;
			this.kind=kind;
			this.aid=util.cookie('aid');
			this.uid=util.cookie('uid');
			this.dom=$(".panel-view");
			if(util.isNumber(conver)){
				this.checkGroupData();
			}else{
				this.checkSingleData();
			}
			// 恢复切换窗口之前的输入数据
			for(var i=0; i<textInVal.length; i++){
				if(textInVal[i].key == this.conver){
					$("#text_in").val(textInVal[i].value);
					break;
				}
			}
            if(this.kind == "system") {
                $("#text_in").attr("disabled","disabled");
            } else {
                $("#text_in").removeAttr("disabled");
            }
			var text_in = $("#text_in").get(0);
			if (document.selection) {
				text_in.focus();
				document.selection.createRange().text = $("#text_in").val();
			} else {
				if (typeof text_in.selectionStart == "number") {
					text_in.selectionStart = text_in.selectionEnd = text_in.value.length;
					text_in.focus();
				}
			}
            var poll = require("poll");
            poll.msgCounter();

			//滚动条滚动到底部
			setTimeout(function(){
                $(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight()-$(".panel-msg .bd").height());
            }, 800);

            //窗口展开，关闭消息提醒
            var notice = Timline.getNotification(conver);
            if(notice) {
                notice.close();
            }
		},
		showSingleMsg:function(){
			var userinfo=DDstorage.get(this.conver) ||{};
			msgWindow.dom.attr("conver",msgWindow.conver);
			msgWindow.dom.attr("kind",msgWindow.kind);
			$(".panel-msg").find(".hd").removeClass("group-chat");
			//修改聊天窗口上显示undefined的问题
			var realname = userinfo.realname, position=userinfo.position;
			if(!realname){
				realname = util.recentContactDom(this.conver).find(".title").text();
			}
			if(!realname){
				realname = util.searchResDom(this.conver).find(".title").text();
				position = util.searchResDom(this.conver).find(".r").attr("pos");
			}
			if(!realname){
				realname = this.conver;
			}
			if(!position){
				position = "";
			}
            if(!userinfo.realname){
                userinfo.uid = this.conver;
                userinfo.realname = this.conver;
                get_user_info(this.conver, function(json){
                     if(json.code == 1){
                         DDstorage.set(json.body.uid, json.body);
                     }
                });
            }

			msgWindow.dom.find(".title").html('<span class="i" title="名片"></span><b>'+realname+'</b><sub>'+position+'</sub>');
			msgWindow.dom.find(".msg-wrap").empty();
			msgWindow.dom.find(".msg-wrap").html('<div class="load-more"  id="chat_load_more" count="1"><span class="i"></span></div>');
            var unreadmsg=DDstorage.get("chat_unreadmsg_"+msgWindow.uid+"_"+this.conver);
			if(unreadmsg!=null){
				msgWindow.showUnreadMsg(userinfo,unreadmsg);
				DDstorage.remove("chat_unreadmsg_"+msgWindow.uid+"_"+this.conver);
			}

            msgWindow.getHistoryMsg("init");
			$(".panels-wrap").css("left","0px");
			$("#clearmonitor").addClass("ui-hide");
			msgWindow.dom.show();
            if(this.kind == "system") {
                msgWindow.dom.find(".title .i").hide();
                $("#send-mail").hide();
                $("#team-share").hide();
                $("#team-temp").hide();

            } else {
                msgWindow.dom.find(".title .i").show();
                $("#send-mail").show();
                $("#team-share").show();
                $("#team-temp").show();
            }
		},
		showGroupMsg:function(){
            $("#send-mail").show();
            $("#team-share").show();
            $("#team-temp").show();

			msgWindow.dom.attr("conver",msgWindow.conver);
			msgWindow.dom.attr("kind",msgWindow.kind);
			if(msgWindow.kind == "discussion_group"){
				$(".panel-msg").find(".hd").addClass("group-chat");
			}else{
				$(".panel-msg").find(".hd").removeClass("group-chat");
			}

            var gname = util.filterMsg(DDstorage.get(this.conver+"info").name);
			msgWindow.dom.find(".title").html(gname);
			msgWindow.dom.find(".msg-wrap").empty();
			msgWindow.dom.find(".msg-wrap").html('<div class="load-more"  id="chat_load_more" count="1"><span class="i"></span></div>');
            var userinfo=DDstorage.get(this.conver);
            var unreadmsg=DDstorage.get("chat_unreadmsg_"+msgWindow.uid+"_"+this.conver);
			if(unreadmsg!=null){
				msgWindow.showUnreadMsg(userinfo,unreadmsg);
				DDstorage.remove("chat_unreadmsg_"+msgWindow.uid+"_"+this.conver);
			}

			msgWindow.getHistoryMsg("init");
			$(".panels-wrap").css("left","0px");
			$("#clearmonitor").addClass("ui-hide");
			msgWindow.dom.show();
		},
		checkSingleData:function(){
			var userinfo=DDstorage.get(this.conver);
			if(!userinfo || !userinfo.uid){
				get_user_info(msgWindow.conver,function(result){
					if(result.body && result.body.uid){
						DDstorage.set(msgWindow.conver,result.body);
					}
					msgWindow.showSingleMsg();
				});
			}else{
				msgWindow.showSingleMsg();
			}
		},
		checkGroupData:function(){
			var userinfo=DDstorage.get(msgWindow.conver);
			if(!userinfo){
				get_group_user_list(msgWindow.conver,function(result){
					var pnames=[];
					for(var i=0;i<result.body.items.length;i++){
                        var uid = result.body.items[i].user.uid;
						pnames.push(uid);
                        Timline.pushUids(uid);
					}
					get_batch_user_info(pnames,function(r){
						DDstorage.set(msgWindow.conver,r);
                        for(var i in r){
                            try {
                                var user = JSON.parse(r[i]);
                                if (user.body.uid) {
                                    DDstorage.set(user.body.uid,user.body);
                                }
                            } catch(e) {

                            }
                        }
					});
				});
				get_group_info(msgWindow.conver,function(result){
					for(var i=0;i<result.body.groups.length;i++){
						if(msgWindow.conver==result.body.groups[i].gid){
							DDstorage.set(msgWindow.conver+"info",result.body.groups[i]);
						}
					}
					msgWindow.showGroupMsg();
				});
			}else{
				msgWindow.showGroupMsg();
			}
		},
		showUnreadMsg:function(userinfo,unreadmsgs){
            var poll = require("poll");
            //对未读消息按mid小到大排序
            var mids = [];
            var unreadmsg = {};
            for (var k = 0; k < unreadmsgs.length; k++) {
                if (unreadmsgs[k].body && unreadmsgs[k].body.mid) {
                    var mid = unreadmsgs[k].body.mid;
                    mids.push(mid);
                    unreadmsg[mid] = unreadmsgs[k];
                }
            }
            mids.sort();
            //展现消息
            if (util.isNumber(msgWindow.conver)) {
                //群
                for (var m = 0; m < mids.length; m++) {
                    var j = mids[m];
                    $text1s = this.buildMsgHtml(unreadmsg[j], true);
                    var msg = "", kind = "chat";
                    var user = DDstorage.get(unreadmsg[j].from || unreadmsg[j].body.from);
                    if (unreadmsg[j].type && unreadmsg[j].type == "message_file") {
                        kind = "file";
                        msg = poll.getFileMsgHtml(unreadmsg[j]);
                    } else if (unreadmsg[j].body.mode == 5) {
                        msg = (user.realname || unreadmsg[j].from) + "取消了接收文件“" + unreadmsg[j].body.content + "”";
                    } else if (unreadmsg[j].body.mode == 7) {
                        msg = (user.realname || unreadmsg[j].from) + "接收了接收文件“" + unreadmsg[j].body.content + "”";
                    } else if (unreadmsg[j].body.mode == 1001) {
                        msg = msgWindow.buildCardMsg(unreadmsg[j]);
                    } else if (unreadmsg[j].body.kind == "voice") {
                        poll.showVoiceMsg(unreadmsg[j], $text1s);
                    } else if (unreadmsg[j].body.content) {
                        msg = util.filterMsg(unreadmsg[j].body.content, true, true).replace(/\n/g, "<br />");
                    }
                    poll.readMsg(msgWindow.conver, kind, this.kind, unreadmsg[j].body.mid);
                    if (msg) {
                        $text1s.find(".msg-cont").html(msg).addClass("mode" + unreadmsg[j].body.mode);
                    }

                    if (user) {
                        $text1s.find(".msg-avatar").find("p").html(user.realname);
                        $text1s.find(".msg-avatar").find("img").attr("src", user.avatar).attr("data-uid", user.uid);
                        $text1s.attr("time", unreadmsg[j].body.datetime);
                        $text1s.attr("mid", unreadmsg[j].body.mid);
                        $text1s.appendTo(".msg-wrap");

                    } else {
                        var show = false;
                        var user = DDstorage.get(unreadmsg[j].from);
                        for (var i = 0; !user && userinfo && userinfo.length && i < userinfo.length; i++) {
                            try {
                                user = eval("[" + userinfo[i] + "]")[0].body;
                                if (user && user.uid && unreadmsg[j].from == user.uid) {
                                    break;
                                }
                            } catch (e) {

                            }
                        }
                        if (user) {
                            $text1s.find(".msg-avatar").find("p").html(user.realname);
                            if (user.avatar) {
                                $text1s.find(".msg-avatar").find("img").attr("src", user.avatar);
                            }
                            $text1s.find(".msg-avatar").find("img").attr("data-uid", user.uid)
                            $text1s.attr("time", unreadmsg[j].body.datetime);
                            $text1s.attr("mid", unreadmsg[j].body.mid);
                            $text1s.appendTo(".msg-wrap");
                            show = true;
                        }
                        if (!show) {
                            $text1s.find(".msg-avatar").find("img").attr("data-uid", unreadmsg[j].from).end().find("p").html(unreadmsg[j].from);
                            $text1s.attr("time", unreadmsg[j].body.datetime);
                            $text1s.attr("mid", unreadmsg[j].body.mid);
                            $text1s.appendTo(".msg-wrap");
                        }

                    }
                }
            } else {
                //非群
                for (var m = 0; m < mids.length; m++) {
                    var j = mids[m];
                    var $text1s;
                    var user = DDstorage.get(unreadmsg[j].from) || { "uid" : unreadmsg[j].from};
                    $text1s = this.buildMsgHtml(unreadmsg[j], true);

                    var msg = "", kind = "chat";
                    if (unreadmsg[j].type && unreadmsg[j].type == "message_file") {
                        msg = poll.getFileMsgHtml(unreadmsg[j]);
                        kind = "file";
                    } else if (unreadmsg[j].body.mode == 5) {
                        msg = (user.realname || unreadmsg[j].from) + "取消了接收文件“" + unreadmsg[j].body.content + "”";
                    } else if (unreadmsg[j].body.mode == 7) {
                        msg = (user.realname || unreadmsg[j].from) + "接收了接收文件“" + unreadmsg[j].body.content + "”";
                    } else if (unreadmsg[j].body.mode == 1001) {
                        msg = msgWindow.buildCardMsg(unreadmsg[j], $text1s, userinfo);
                    } else if (unreadmsg[j].body.kind == "voice") {
                        poll.showVoiceMsg(unreadmsg[j], $text1s);
                    } else if (unreadmsg[j].body.content) {
                        msg = util.filterMsg(unreadmsg[j].body.content, true, true).replace(/\n/g, "<br />");
                    }
                    if (unreadmsg[j].type && unreadmsg[j].type == "message_notice") {
                        kind = "notice";
                        poll.readMsg(unreadmsg[j].from, kind, "", unreadmsg[j].body.mid);
                    } else {
                        poll.readMsg(msgWindow.conver, kind, "", unreadmsg[j].body.mid);
                    }

                    if (msg == "#A_振动") {
                        if(user.uid ==  util.cookie("uid")){
                            msg = "您发送了一个震屏消息";
                        } else {
                            msg = (user.realname || user.uid) + "向您发送了一个震屏消息";
                        }

                    }
                    if (unreadmsg[j].body.url && unreadmsg[j].type == "message_notice") {
                        msg += "&nbsp;&nbsp;&gt;&gt;<a href='" + unreadmsg[j].body.url + "' target='_blank'>点击这里查看详情</a>"
                    }
                    if (unreadmsg[j].body.pic && unreadmsg[j].type == "message_notice") {
                        msg += "<div><a rel='gallery' href='" + unreadmsg[j].body.pic + "'><img src='" + unreadmsg[j].body.pic + "' style='max-width: 320px;' class='message-img'></a></div>"
                    }
                    if (msg) {
                        $text1s.find(".msg-cont").html(msg).addClass("mode" + unreadmsg[j].body.mode);
                    }
                    $text1s.find(".msg-avatar").find("p").html(user.realname);
                    if (user.avatar) {
                        $text1s.find(".msg-avatar").find("img").attr("src", user.avatar);
                    }
                    $text1s.find(".msg-avatar").find("img").attr("data-uid", user.uid);
                    $text1s.attr("time", unreadmsg[j].body.datetime);
                    $text1s.attr("mid", unreadmsg[j].body.mid);
                    $text1s.appendTo(".msg-wrap");
                    $text1s.find(".msg-avatar").find("img").attr("data-uid", userinfo.uid).unbind("click").bind("click", function () {
                        var _this = this;
                        require(["visiting_card"], function (card) {
                            card.show($(_this).attr("data-uid"));
                        });
                    });
                }
            }
            poll.bindMsgEvent();

        },
		getHistoryMsg:function(type){
            var conver=$(".panel-view").attr("conver");
            $("#chat_load_more").addClass("load-more-ing");
            if(type == "init"){
                _getHistoryMessages(conver, type);
                return;
            }
            var mid=$(".msg-wrap").find(".msg:first").attr("mid");
            var end = $(".msg-wrap .msg:eq(0)").attr("time");
            if(!end){
                //获取服务器最新的历史记录
                end = "";
            }
            if($.isNumeric(end)){
                end = util.formatDate(new Date(parseInt(end)), "yyyy-MM-dd HH:mm:ss");
            }
            end = encodeURI(end);
            var start = "";
            get_history_message(conver, start, end, function(data){
                if(data.code == 1){
                    msgWindow.showHistoryMsg(data.body.logs, conver, type);
                } else {
                    $("#chat_load_more").remove();
                }
            }, function(){
                $("#chat_load_more").hide().remove();
            });
        },
		filterHistoryMsg:function(msgarr){
			var result=[];
			for(var i=0;i<msgarr.length;i++)
				{
					if(msgarr[i].type =="message_chat" || msgarr[i].type =="message_file"){
						result.push(msgarr[i]);
					}
				}
			return result;
		},
		showHistoryMsg:function(msgs,conver,type){
		    //当前conver不一致时不显示信息
		    if(conver != $(".panel-view").attr("conver")) return;
            var userinfo=DDstorage.get(conver);
            var poll = require("poll");
			var selfinfo=DDstorage.get(util.cookie("uid"));
			var max=msgs.length;
			if(type == "initload"){
				if(msgs.length==0){
					$("#chat_load_more").remove();
                    return ;
				}
                max = 3;
			}
			if(type=="init"){
				max = 10;
			}
			var skiped = 0;
            var msgHeightOld = $(".msg-wrap").outerHeight();
			if(max != 0){
                //对消息进行排序
                var mids = [];
                var msgarr = {};
                for(var i =0;i<max && i<msgs.length; i++){
                    var mid;
                    if(msgs[i].message){
                        mid = msgs[i].message.mid;
                    }else {
                        mid = msgs[i].mid;
                    }
                    mids.push(mid);
                    msgarr[mid]=msgs[i];
                }
                mids.sort(function(f,l){return f<l?1:-1;});
                for (var j = 0; j < mids.length; j++) {
                    var i = mids[j];

                    if (!msgarr[i].message) {
                        msgarr[i].message = msgarr[i].body || msgarr[i];
                    }

                    if (msgarr[i].message.muuid && $(".msg[msgid='" + msgarr[i].message.muuid + "']").length > 0) {
                        skiped++;
                        continue;
                    }

                    if (msgarr[i].mongoId && $(".msg[muid='" + msgarr[i].mongoId + "']").length > 0) {
                        skiped++;
                        continue;
                    }

                    if (mids[j] && $(".msg[mid='" + mids[j] + "']").length > 0) {
                        skiped++;
                        continue;
                    }

                    if(msgarr[i].sender==selfinfo.uid || msgarr[i].from == selfinfo.uid){
//						var $textc=msgWindow.buildClientContent(msgarr[i]);
                        var $textc = msgWindow.buildMsgHtml(msgarr[i], false)
                        var c = "";
                        if(msgarr[i].message.content == "#A_振动"){
                            msgarr[i].message.content = "您发送了一个震屏消息";
                        }
                        if(msgarr[i].message.kind == "voice"){
                            poll.showVoiceMsg(msgarr[i], $textc, true) ;
                        } else if(msgarr[i].type == "message_file" ||(msgarr[i].message && msgarr[i].message.ptype == "message_file")){
                            var html = poll.getFileMsgHtml(msgarr[i]);
                            $textc.find(".msg-cont").addClass("mode"+msgarr[i].message.mode).html(html);
                        } else if(!msgarr[i].message.content){
                            c = '<a download="'+msgarr[i].name+'" href="'
                                + msgarr[i].url
                                + '" target="_blank" rel="send-file"><img src="./img/file2.png" style="vertical-align:middle;margin-right:10px;"/> '
                                + (msgarr[i].name) + '</a>';
                        } else if(msgarr[i].message.mode == 5){
                            c = "您取消了接收文件“"+msgarr[i].message.content+"”";
                        } else if(msgarr[i].message.mode == 7){
                            c = "您接收了接收文件“"+msgarr[i].message.content+"”";
                        } else if(msgarr[i].message.mode == 1001){
                            c = msgWindow.buildCardMsg(msgarr[i],$textc, selfinfo);
                        }else {
                            if(!msgarr[i].message.content) {
//                                    console.log(msgarr[i]);
                            }  else {
                                c = util.filterMsg(msgarr[i].message.content, true, true).replace(/\n/g,"<br />");
                            }
                        }
                        if(c) {
                            $textc.find(".msg-cont").addClass("mode"+msgarr[i].message.mode).html(c);
                        }

                        $textc.attr("time",msgarr[i].message.datetime || msgarr[i].created);
                        $textc.attr("mid",msgarr[i].message.mid);
                        $textc.attr("muid",msgarr[i].mongoId);
                        $textc.attr("msgid",msgarr[i].message.muuid);
                        $textc.find(".msg-avatar").find("p").text(selfinfo.realname);
                        if(selfinfo.avatar){
                            $textc.find(".msg-avatar").find("img").attr("src",selfinfo.avatar);
                        }
                        $textc.find(".msg-avatar").find("img").attr("data-uid",selfinfo.uid)
                        $("#chat_load_more").after($textc);
                    }else{
                        if(util.isNumber(conver)){
                            var user = DDstorage.get(msgarr[i].sender || msgarr[i].from);
                            if(!user){
                                for(var j=0; $.isArray(userinfo) && j<userinfo.length; j++ ){
                                    try{
                                        var obj = eval("["+userinfo[j]+"]")[0];
                                        if(obj && obj.body && (obj.body.uid == msgarr[i].from || obj.body.uid == msgarr[i].sender)){
                                            user = obj.body;
                                        }
                                    }catch(e){

                                    }
                                }
                            }
                            if(!user){
                                get_user_info(msgarr[i].sender || msgarr[i].from, function(data){
                                    if(data.code == 1){
                                        DDstorage.set(data.body.uid, data.body);
                                        user = data.body;
                                    }
                                },function(){

                                }, false);
                            }
//								var $texts=msgWindow.buildServiceContent();
                            var $texts = this.buildMsgHtml(msgarr[i], false);
                            var c = "";
                            if(!userinfo) {
                                userinfo = {};
                            }
                            if(msgarr[i].type == "message_file" || msgarr[i].message.ptype == "message_file" || !msgarr[i].message.content){
                                c = poll.getFileMsgHtml(msgarr[i]);
                            }else if(msgarr[i].message.mode == 5){
                                c = (userinfo.realname || msgarr[i].sender) +"取消了接收文件“"+msgarr[i].message.content+"”";
                            }else if(msgarr[i].message.mode == 7){
                                c = (userinfo.realname || msgarr[i].sender) +"接收了接收文件“"+msgarr[i].message.content+"”";
                            }else if(msgarr[i].message.mode == 1001){
                                c = msgWindow.buildCardMsg(msgarr[i],$texts, user);
                                if(!c){
                                    continue;
                                }
                            }else if(msgarr[i].message.kind == "voice"){
                                poll.showVoiceMsg(msgarr[i], $texts, true);
                            }else if(msgarr[i].message && msgarr[i].message.content){
                                c = util.filterMsg(msgarr[i].message.content, true, true).replace(/\n/g,"<br />");
                            }
                            if(c){
                                $texts.find(".msg-cont").html(c).addClass("mode"+msgarr[i].message.mode);
                            }
                            $texts.attr("time",msgarr[i].message.datetime || msgarr[i].created);
                            $texts.attr("mid",msgarr[i].message.mid);
                            $texts.attr("muid",msgarr[i].mongoId);
                            $texts.attr("msgid",msgarr[i].message.muuid);
                            if(!user){
                                user = {realname : msgarr[i].sender || msgarr[i].from, uid: msgarr[i].sender || msgarr[i].from};
                            }
                            $texts.find(".msg-avatar").find("p").text(user.realname);
                            if(user.avatar){
                                $texts.find(".msg-avatar").find("img").attr("src",user.avatar);
                            }
                            $texts.find(".msg-avatar").find("img").attr("data-uid", user.uid);
                            $texts.find(".msg-avatar").find("img").attr("data-uid", user.uid).unbind("click").click(function(){
                                var _this = this;
                                require(["visiting_card"], function(card){
                                    card.show($(_this).attr("data-uid"));
                                });
                            });
                            $("#chat_load_more").after($texts);
                        }else{
//							$texts=msgWindow.buildServiceContent();
                            var $texts = this.buildMsgHtml(msgarr[i], false);
							var c = "";
							if(msgarr[i].type == "message_file" || msgarr[i].message.ptype == "message_file" || !msgarr[i].message.content){
                                c = poll.getFileMsgHtml(msgarr[i]);
                            }else if(msgarr[i].message.mode == 5){
								c = (userinfo.realname || msgarr[i].sender || msgarr[i].from) +"取消了接收文件“"+msgarr[i].message.content+"”";
							}else if(msgarr[i].message.mode == 7){
								c = (userinfo.realname || msgarr[i].sender) +"接收了接收文件“"+msgarr[i].message.content+"”";
							}else if(msgarr[i].message.mode == 1001){
                                c = msgWindow.buildCardMsg(msgarr[i], $texts, userinfo);
                                if(!c){
                                    continue;
                                }
                            }else if(msgarr[i].message.kind == "voice"){
                                poll.showVoiceMsg(msgarr[i], $texts, true)
                            }else if(msgarr[i].message && msgarr[i].message.content){
								c = util.filterMsg(msgarr[i].message.content, true, true).replace(/\n/g,"<br />");
							}
                            if(!userinfo){
                                userinfo = {
                                    realname: msgarr[i].sender
                                };
                            }
							if(c == "#A_振动"){
							    c = userinfo.realname+"向您发送了一个震屏";
                            }
                            if(msgarr[i].message.url && msgarr[i].type == "message_notice") {
                                 c  += "&nbsp;&nbsp;&gt;&gt;<a href='"+msgarr[i].message.url+"' target='_blank'>点击这里查看详情</a>"
                            }
                            if(msgarr[i].message.pic && msgarr[i].type == "message_notice") {
                                c += "<div><a rel='gallery' href='"+msgarr[i].message.pic+"'><img src='"+msgarr[i].message.pic+"' style='max-width:320px;' class='message-img'></a></div>"
                            }
							if(c) {
                                $texts.find(".msg-cont").html(c).addClass("mode"+msgarr[i].message.mode);
                            }
							$texts.attr("time",msgarr[i].message.datetime || msgarr[i].created);
							$texts.attr("mid",msgarr[i].message.mid);
                            $texts.attr("muid",msgarr[i].mongoId);
                            $texts.attr("msgid",msgarr[i].message.muuid);

							$texts.find(".msg-avatar").find("p").text(userinfo.realname);
							if(userinfo.avatar){
								$texts.find(".msg-avatar").find("img").attr("src",userinfo.avatar);
							}
                            $texts.find(".msg-avatar").find("img").attr("data-uid", userinfo.uid) ;
							$("#chat_load_more").after($texts);
						}
					}
                    if(type=="init" && j==0){
                        var con = msgarr[i].message.content;

                        if(!con){
                            con = "[文件]";
                        } else if(con.match(/<IMG /gi)){
                            con = "[图片]";
                        } else {

                        }
                        util.recentContactDom(conver).find(".rc-msg").text(con);
                    }
				}
			}else{
				$("#chat_load_more").remove();
			}
			if(type == "loadmore"){
				if(max < 10){
					$("#chat_load_more").remove();
				}
			}
            $("#chat_load_more").removeClass("load-more-ing");
            var msgHeightNew = $(".msg-wrap").outerHeight();
            poll.bindMsgEvent();
            if(type == "init" || type == "initload") {
                $(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(".panel-msg .bd").height());
            } else {
                //点击加载更多，滚动条保持在原来位置
                $(".panel-msg .bd").scrollTop(msgHeightNew - msgHeightOld);
            }
		},
		buildClientContent:function(msg){
            var time = "", timestamp = "";
            if($(".msg").length == 0) {
                time = msg.created || msg.body.datetime;
                if($.isNumeric(time)) {
                    time = new Date(parseInt(time, 10));
                } else {
                    time = util.parseDate(time, "yyyy-MM-dd HH:mm:ss");
                }
                time = util.formatDate(time, "yyyy-MM-dd HH:mm");
                timestamp = '<div class="time-stamp"><span>'+time+'</span></div>';
            }
			var cContent=[timestamp,'<div class="msg msg-self" time="" mid=""><div class="msg-avatar"> <img alt="" src="./img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>'];
			return $(cContent.join(""));
		},
		buildServiceContent:function(msg){
			var sContent=['<div class="msg msg-other" time="" mid=""><div class="msg-avatar"><img alt="" src="./img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>'];
			return $(sContent.join(""));
		},

        buildMsgHtml:function(msg, append){
            var time, lasttime, timestamp = "", html, userInfo = util.cookie("uid"), date, pattern,diff;
            if(msg.from == userInfo || msg.sender == userInfo) {
                html = '<div class="msg msg-self" time="" mid=""><div class="msg-avatar"> <img alt="" src="./img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>';
            } else {
                html = '<div class="msg msg-other" time="" mid=""><div class="msg-avatar"> <img alt="" src="./img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>';
            }
            time = msg.created || msg.datetime || msg.body.datetime;
            if(append) {
                lasttime = $(".msg").last().attr("time");
            } else {
                lasttime = $(".msg").eq(0).attr("time");
            }
            if(!lasttime) {
                if($.isNumeric(time)) {
                    date = new Date(parseInt(time, 10));
                    if(Math.abs(date.getDate() - new Date().getDate()) > 0) {
                         pattern = "yyyy-MM-dd HH:mm";
                    } else {
                        pattern = "HH:mm";
                    }
                } else {
                    date = util.parseDate(time, "yyyy-MM-dd HH:mm:ss");
                    if(Math.abs(date.getDate() - new Date().getDate()) > 0) {
                        pattern = "yyyy-MM-dd HH:mm";
                    } else {
                        pattern = "HH:mm";
                    }
                }
                time = util.formatDate(date, pattern);
                timestamp = '<div class="time-stamp"><span>'+time+'</span></div>';
            } else {
                if($.isNumeric(time)) {
                    time = new Date(parseInt(time, 10));
                } else {
                    time = util.parseDate(time, "yyyy-MM-dd HH:mm:ss");
                }
                if($.isNumeric(lasttime)) {
                    lasttime = new Date(parseInt(lasttime, 10));
                } else {
                    lasttime = util.parseDate(lasttime, "yyyy-MM-dd HH:mm:ss");
                }
                diff = Math.abs(time.getTime() - lasttime.getTime());
                if(diff > 1000*60*2) {
                    if(Math.abs(time.getDate()-new Date().getDate()) > 0) {
                        pattern = "yyyy-MM-dd HH:mm";
                    } else {
                        pattern = "HH:mm"
                    }
                    time = util.formatDate(time, pattern);
                    timestamp = '<div class="time-stamp"><span>'+time+'</span></div>';
                }
            }
//            if(append) {
//                html = timestamp + html;
//            } else {
//                html = html + timestamp;
//            }
            html = timestamp + html;
            return $(html);
        },
        buildCardMsg:function(msg, jdom, userinfo){
            var erp = msg.content ;
            if(!erp && msg.body && msg.body.content) {
                erp = msg.body.content;
            }
            if(!erp && msg.message && msg.message.content) {
                erp = msg.message.content;
            }
            if(!erp) {
                return;
            }
            var info = DDstorage.get(erp);
            if(info != null && info.uid) {
                var card = $("#idcard").clone();
                card.find(".pop-title").remove();
                card.find(".pop-bottom").remove();
                card.find(".idcard-name").text(info.realname);
                if(info.avatar) {
                    card.find(".idcard-img").attr("src", info.avatar);
                }
                if(info.tel){
                    card.find(".idcard-tel").text("座机："+info.tel);
                }
                card.find(".idcard-img").attr("uid", info.uid).css("cursor","pointer");
                card.find(".idcard-name").text(info.realname);
                card.find(".idcard-phone").text("手机："+(info.phone || ""));
                card.find(".idcard-email").text("邮箱："+(info.email ||""));
                card.find(".idcard-pos").text("岗位："+(info.position || ""));
                card.find(".idcard-orgname").html("部门：<span>"+(info.orgFullName)+"</span>");
                return card.html();
            } else {
                get_user_info(erp, function(data){
                    if(data.code == 1){
                        DDstorage.set(erp,data.body);
                        if(!userinfo || !userinfo.realname) {
                            userinfo  = {
                                realname:msg.sender
                            }
                        }
                        var card = $("#idcard").clone();
                        card.find(".pop-title").remove();
                        card.find(".pop-bottom").remove();
                        card.find(".idcard-name").text(data.body.realname);
                        if(data.body.avatar) {
                            card.find(".idcard-img").attr("src", data.body.avatar);
                        }
                        if(data.body.tel){
                            card.find(".idcard-tel").text("座机："+data.body.tel);
                        }
                        card.find(".idcard-name").text(data.body.realname);
                        card.find(".idcard-phone").text("手机："+(data.body.phone || ""));
                        card.find(".idcard-email").text("邮箱："+(data.body.email ||""));
                        card.find(".idcard-pos").text("岗位："+(data.body.position || ""));
                        card.find(".idcard-orgname").html("部门：<span>"+(data.body.orgFullName)+"</span>");
                        var c = card.html();
                        jdom.find(".msg-cont").html(c).addClass("mode"+msg.message.mode);
                        jdom.attr("time",msg.message.datetime || msg.created);
                        jdom.attr("mid",msg.message.mid);
                        jdom.attr("muid",msg.mongoId);

                        jdom.find(".msg-avatar").find("p").text(userinfo.realname);
                        if(userinfo.avatar){
                            jdom.find(".msg-avatar").find("img").attr("src",userinfo.avatar);
                        }
                        jdom.find(".msg-avatar").find("img").attr("data-uid", userinfo.uid) ;
                        $("#chat_load_more").after(jdom);
                    }
                }, function(){
                    util.alert("获取用户资料失败！");
                }, false);
            }
        }
	};
	return msgWindow;
});
