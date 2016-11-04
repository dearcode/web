define(function(require, exports, module) {
	var util = require("util"),
		//screenshot = require("screenshot"),
		//team_msg = require("team_msg"),
		notification = require("notification"),
		//share = require("share"),

		stop = false,
		errorTimes = 0,
		aid = util.cookie("aid"),
		uid = util.cookie("uid"),
		invisibleMsgTimer = null,
		stopPoll = false;

	//拉取消息
	function poll() {
		if (stopPoll) {
			return;
		}

		var from = util.cookie("uid");
		if (stop) {
			popup4Relogin();
			return;
		}

		if (!from) {
			stop = true;
		}

		$.ajax({
			url: "/api.action?aid=" + aid + "&from=" + from +
				"&type=iq_offline_message_get",
			type: "GET",
			timeout: 60000,
			complete: function(result) {
				try {
					var response = result.responseText,
						msg;
					//空消息
					if (!response) {
						poll();
						return;
					}
					if (errorTimes > 0) {
						errorTimes = 0;
					}

					if ($("#net-error").length > 0) {
						$.graynormal($("#user-avatar").find("img"));
						$("#msgbox-alert-ok").click();
					}

					//初步解析消息
					msg = JSON.parse(response);
					if (msg.error && msg.error == "100") {
						stop = true;
					}

					if ($.isArray(msg)) {
						for (var i = 0; i < msg.length; i++) {
							rebackMsg(msg[i]);
							parse(msg[i]);
						}
					} else {
						rebackMsg(msg);
						parse(msg);
					}
				} catch (e) {
					console.log(e.stack || e.message || e);
				}
				poll();
			},
			error: function() {
				errorTimes++;
				if (errorTimes > 2 && $("#net-error").length == 0) {
					$.grayscale($("#user-avatar").find("img"));
					var state = $("#user_state").attr("class");
					if (state != "i i-offline") {
						$("#user_state").attr("last-status", state).attr("class",
							"i i-offline");
					}
					stopPoll = true;
					util.alert("提示", "<div id='net-error'>您的网络可能存在问题，请检查网络是否连接正常</div>",
						function() {
							errorTimes = 0;
							window.location.reload();
						});
				}
			}
		});
	}

	function errorReport(msg, ext) {
		var data = "";
		if (typeof msg == "object") {
			data = encodeURI(encodeURI(JSON.stringify(msg)));
		} else {
			data = encodeURI(encodeURI(msg));
		}
		$.ajax({
			url: "/api.action?message=" + data + "&uid=" + uid + "&aid=" + aid +
				"&type=" + ext + "&cuid=" + util.cookie("uid"),
			type: "GET"
		});
	}

	function stopPoll() {
		stopPoll = true;
	}
	//弹框提醒重新登录
	function popup4Relogin(msg) {
		stopPoll = true;
		//延迟5s弹框
		setTimeout(function() {
			offline = true;
			util.alert("提示", msg || "登陆失效，请重新登陆", function() {
				util.cookie("uid", "", {
					expires: -1
				});
				util.cookie("aid", "", {
					expires: -1
				});
				window.location.href = "/login";
			});
		}, 5000);
	}

	//解析消息
	function parse(msgBean) {
		if (!msgBean || typeof msgBean != 'object') {
			return;
		}
		//截屏消息
		/*if(msgBean.type == "screenshot"){
			screenshot.screenshot(msgBean);
			return;
		}
		*/
		//在线聊天消息
		if (msgBean.type == "message_chat") {
			if (beforeParse(msgBean)) {
				return;
			}
			msgBean.kind = "chat";
			parseChat(msgBean, false);
			return;
		}
		//离线消息
		if (msgBean.type == "iq_offline_message_get") {
			parseOffline(msgBean);
			return;
		}
		//状态改变
		if (msgBean.type == "presence") {
			update_status(msgBean);
			return;
		}
		//系统消息
		if (msgBean.type == "message_notice") {
			msgBean.kind = "notice";
			var tim = util.formatDate(new Date(msgBean.body.datetime),
				"yyyy-MM-dd HH:mm:ss");
			msgBean.body.content = "【" + tim + "】&nbsp;&nbsp;" + msgBean.body.content;
			parseChat(msgBean);
			return;
		}
		//文件消息
		if (msgBean.type == "message_file") {
			if (beforeParse(msgBean)) {
				return;
			}
			msgBean.kind = "file";
			parseChat(msgBean);
			return;
		}
		//群设置消息
		/*if(msgBean.type == "iq_group_set"){
			team_msg.parse(msgBean);
			return;
		}
		*/
		//群联系人信息改变
		/*if(msgBean.type == "iq_roster_item_set"){
			team_msg.parse(msgBean);
			return;
		}
		*/
		//群成员改变消息
		/*if(msgBean.type == "iq_roster_item_delete"){
			team_msg.parse(msgBean);
			return;
		}*/
		//踢出群
		/*if(msgBean.type == "presence_group_kick"){
			team_msg.parse(msgBean);
			return;
		}*/
		//邀请加入群
		/*if(msgBean.type == "message_group_invite"){
			team_msg.parse(msgBean);
			return;
		}*/

		// 用户资料更新
		if (msgBean.type == "message_user_updated") {
			updateUserInfo(msgBean);
			return;
		}

		//未授权访问
		if (msgBean.code == 110) {
			popup4Relogin(msgBean.msg);
		}
		//账号另一地登录
		if (msgBean.type == "failure" && msgBean.body && msgBean.body.code == 88) {
			if (beforeParse(msgBean)) {
				return;
			}
			popup4Relogin(msgBean.body.msg);
		}

		if (msgBean.type == "message_read_notify") {
			parseRead(msgBean);
			return;
		}
	}

	function beforeParse(msgBean) {
		return (typeof msgBean.to != "undefined" && msgBean.to != uid && !$.isNumeric(
			msgBean.to)) && (typeof msgBean.from != "undefined" && msgBean.from !=
			uid);
	}

	function updateUserInfo(msg) {
		get_user_info(msg.from, function(json) {
			var old = DDstorage.get(msg.from),
				avatar;
			if (old && old.uid) {
				avatar = old.avatar;
			}
			if (json && json.code == 1) {
				DDstorage.set(msg.from, json.body);
				if (json.body.avatar && json.body.avatar != avatar && json.body.avatar.indexOf(
						"http://") >= 0) {
					$("img[src='" + avatar + "']").attr("src", json.body.avatar);
				}
			}
		});
	}

	//
	function parseChat(msgBean, offline) {
		var conver = $(".panel-view").attr("conver"),
			userinfo, from, gid, content, len;
		if (msgBean.body && msgBean.body.content) {
			content = msgBean.body.content;
		}
		from = msgBean.from;
		var f = msgBean.from.toLowerCase();
		var t = msgBean.to;
		var u = uid.toLowerCase();
		if (!$.isNumeric(t) && f != u && msgBean.type != 'message_notice' && t.toLowerCase() !=
			u) {
			errorReport(msgBean, offline ? "offline" : "");
			return;
		}
		if (msgBean.body && msgBean.body.gid) {
			gid = msgBean.body.gid;
		}

		//已经存在的全局消息(协议id)不再显示
		var l = $(".msg-wrap .msg[msgid='" + msgBean.id + "']").length;
		if (l > 0) {
			return;
		}

		//已经存在的消息(mid唯一)不再显示
		len = $(".msg-wrap .msg[mid='" + msgBean.body.mid + "']").length;
		if (len > 0) {
			return;
		}

		if (t != conver && from != conver) {
			if (isInUnread(msgBean)) {
				return;
			}
		}
		//显示左侧消息
		showLeftMsg(msgBean);
		msgBean.body.content = content;

		if (!gid) {
			if (msgBean.type == "message_notice") {
				userinfo = noticeInfo(msgBean);
			} else {
				userinfo = getUserInfo(from);
			}

		} else {
			userinfo = getUserInfo(from);
		}
		//需要显示消息
		if ((conver == from && !gid) || (conver == gid && gid) || (msgBean.type ==
				"message_notice" && conver == msgBean.body.source) || (conver == t &&
				msgBean.from == uid)) {
			showMsg(msgBean, userinfo, true);
			if (conver == gid) {
				readMsg(conver, msgBean.kind, $(".panel-view").attr("kind"), msgBean.body
					.mid);
			} else {
				readMsg(msgBean.from, msgBean.kind, "", msgBean.body.mid);
			}

		} else {
			saveUnReadMsg(msgBean);
		}
		msgBean.body.content = content;
		//保存消息记录
		saveHistory(msgBean);
		//显示未读消息数目
		if (msgBean.from != uid) {
			msgCounter();
			notification.flashTitle();
			if (util.cookie('isOpenSound') == 1) {
				$.publish('soundPlay');
			}
		}
	}

	//系统消息
	function parseSystemMsg(msgBean) {
		notification.systemMsg(msgBean);
	}

	//离线消息
	function parseOffline(msgBean) {
		var offline, len, i, type;
		if ($.isArray(msgBean.body)) {
			offline = msgBean.body;
		} else {
			offline = JSON.parse(msgBean.body)
		}
		for (i = 0, len = offline.length; i < len; i++) {
			type = offline[i].data.type;
			if (type == "message_chat") {
				offline[i].data.kind = "chat";
				parseChat(offline[i].data, true);
			} else if (type == "message_file") {
				offline[i].data.kind = "file";
				parseFile(offline[i].data, true);
			} else if (type == "message_notice") {
				offline[i].data.kind = "notice";
				parseSystemMsg(offline[i].data);
			} else {
				console.log(offline[i]);
			}
		}
	}
	//转换文件消息
	function parseFile(msgBean, offline) {
		var html = getFileMsgHtml(msgBean);
		if (html) {
			msgBean.body.content = html;
			parseChat(msgBean, offline);
		}
	}

	//显示左边最近联系人列表中的消息
	function showLeftMsg(msg) {
		var gid, from, info;
		from = msg.from;
		if (from == uid) {
			from = msg.to;
		}
		if (msg.body.gid) {
			gid = msg.body.gid;
		}
		var userinfo;
		if (msg.type == "message_notice") {
			userinfo = noticeInfo(msg);
		} else {
			userinfo = getUserInfo(from);
		}
		if (!gid) {
			if (msg.type == "message_notice") {
				showNoticeLeft(msg, userinfo);
			} else {
				showUserLeft(msg, userinfo);
			}
		} else {
			info = DDstorage.get(gid + "info");
			showGroupLeft(msg, info, userinfo);
		}
	}

	function showGroupLeft(msg, info, userinfo) {
		var gid = msg.body.gid,
			i, group, target;
		if (!info || !info.gid) {
			get_group_info(gid, function(json) {
				if (json && json.body) {
					for (i = 0; json.body.groups && i < json.body.groups.length; i++) {
						group = json.body.groups[i];
						if (group.gid == gid) {
							info = group;
						}
						//保存数据
						DDstorage.set(group.gid + "info", group);
					}
					if (info && info.gid) {
						showGroupLeft(msg, info, userinfo);
					} else {
						errorReport(msg, "qun&gid=" + gid)
					}

				}
			});
		} else {
			notify(msg, userinfo);
			buildRecentView(info.kind, gid, "", info.name, msg);
		}
	}

	function showUserLeft(msg, info) {
		var from = msg.from;
		if (msg.from == uid) {
			from = msg.to;
		}
		if (!info || !info.uid) {
			get_user_info(from, function(json) {
				if (json && json.code == 1) {
					info = json.body;
					DDstorage.set(from, info);
					showUserLeft(msg, info);
				}
			});
		} else {
			notify(msg, info);
			if (msg.from == uid) {
				from = msg.to;
			}
			buildRecentView("customer", from, info.avatar, info.realname || from, msg);
		}
	}

	function showNoticeLeft(msg, info) {
		notify(msg, info);
		buildRecentView("system", info.uid, info.avatar, info.realname, msg);
	}

	//左侧消息
	function buildRecentView(kind, conver, avatar, name, msg) {
		var target = util.recentContactDom(conver);
		var html = '<li kind="" id="" conver="" class="rc-item"><div class="l">' +
			'<img alt="" src="./img/team-avatar.png"><span class="i"></span></div><div class="m">' +
			'<div class="nickname"><span class="i i-on"></span></div><div class="rc-msg wto"></div></div><div class="r"></div></li>';
		if (target.length == 0) {
			target = $(html);
		}
		target.attr("kind", kind).attr("conver", conver).attr("id",
			"recent-contact-" + conver);

		if (kind == "temp_group") {
			target.find("img").attr("src", "./img/mainchat-avatar.png");
		} else if (kind == "discussion_group") {
			target.find("img").attr("src", "./img/team-avatar.png");
		} else if (kind == "customer") {
			if (avatar) {
				target.find("img").attr("src", avatar);
			} else {
				target.find("img").attr("src", "./img/img-avatar.png");
			}
		} else if (kind == "system") {
			target.find("img").attr("src", avatar);
		}
		target.find(".nickname").text(name);
		target.find(".r").html(util.formatDate(new Date(msg.body.datetime),
			"HH:mm:ss"));
		target.find(".wto").text(filterMsgForLeft(msg));
		if ($(".panel-view").attr("conver") != conver && msg.from != uid) {
			var unread = target.find(".l").find(".i").text();
			if (unread != "") {
				unread = parseInt(unread) + 1;
				target.find(".l").find(".i").html(unread);
			} else {
				target.find(".l").find(".i").text(1).removeClass("ui-hide");
			}
		}
		$('#jd-recent-contacts .rc-wrap').prepend(target);
	}

	function filterMsgForLeft(msg) {
		var html = "";
		if (msg && msg.body && msg.body.content) {
			html = msg.body.content;
			try {
				var tmp = $("<div></div>").html(util.filterMsg(html));
				if (tmp.find("img").length > 0) {
					html = "[图片]" + tmp.text();
				}
				if (tmp.find("a[rel='send-file']").length > 0) {
					html = "[文件]";
				}
				if ($.fn.jdExpression.replaceName(html) != html) {
					tmp = $("<div></div>").html($.fn.jdExpression.replaceName(html));
					html = "[表情]" + tmp.text();
				}
				if (html == "#A_振动") {
					html = "[震屏]";
				}
				if (msg.type == "message_file") {
					html = "[文件]";
				}
				if (msg.body.kind == "voice") {
					html = "[语音]"
				}
				if (msg.body.mode == 1001) {
					html = "[名片]";
				}
			} catch (e) {
				console.log(e.stack || e.message || e);
			}
		}
		html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return html;
	}

	//消息回执
	function rebackMsg(msgBean) {
		var gid, from, mid;
		if (msgBean.type == "iq_offline_message_get") {
			rebackMsgOffline(msgBean);
		} else {
			if (msgBean.type == "message_chat" || msgBean.type == "message_file") {
				gid = msgBean.body.gid;
				from = msgBean.from;
				mid = msgBean.body.mid;
				if (gid && $.isNumeric(gid)) {
					message_read_receipt_group(gid, mid, function() {});
				} else {
					var u = uid.toLowerCase();
					var t = msgBean.to.toLowerCase();
					var f = msgBean.from.toLowerCase();
					if (f != u && t != u) {
						errorReport(msgBean, "online");
						return;
					}
					message_read_receipt_single(from, mid, function() {});
				}
			}
		}
	}

	//离线消息回执
	function rebackMsgOffline(msgBean) {
		var list, i, type, from, gid, mid;
		if ($.isArray(msgBean.body)) {
			list = msgBean.body;
		} else {
			list = JSON.parse(msgBean.body)
		}
		for (i = 0; i < list.length; i++) {
			type = list[i].data.type;
			gid = list[i].data.body.gid;
			from = list[i].data.from;
			mid = list[i].data.body.mid;
			var t = list[i].data.to.toLowerCase();
			var f = list[i].data.from.toLowerCase();
			var u = uid.toLowerCase();
			if (!$.isNumeric(gid) && t != u && f != u) {
				errorReport(list[i].data, "offline");
				return;
			}
			if (type == "message_chat" || type == "message_file") {
				if (list[i].data.from != uid) {
					if (gid && $.isNumeric(gid)) {
						message_read_receipt_group(gid, mid, function() {});
					} else {
						message_read_receipt_single(from, mid, function() {});
					}
				}
			} else if (type == "message_group_invite" || type ==
				"message_group_accept" || type == "message_group_decline") {
				message_read_receipt_invite(from, mid, function() {});
			} else {
				message_read_receipt_other(mid, function(data) {});
			}
		}
	}

	//保存消息记录
	function saveHistory(msgBean) {
		var history, key;
		if (msgBean.body.gid) {
			key = "chat_recentmsg_" + uid + "_" + msgBean.body.gid;
		} else {
			if (msgBean.type == "message_notice") {
				key = "chat_recentmsg_" + uid + "_" + msgBean.body.source;
			} else {
				key = "chat_recentmsg_" + uid + "_" + msgBean.from;
			}
		}
		if (msgBean.from == uid && !msgBean.body.gid) {
			key = "chat_recentmsg_" + uid + "_" + msgBean.to;
		}
		history = DDstorage.get(key);
		if ($.isArray(history)) {
			history.unshift(msgBean);
		} else {
			history = [msgBean];
		}
		if (msgBean.type == "message_notice") {
			DDstorage.set(key, history, 1);
		} else {
			DDstorage.set(key, history);
		}
	}

	//保存未读消息
	function saveUnReadMsg(msgBean) {
		var unread, key;
		if (msgBean.body.gid) {
			key = "chat_unreadmsg_" + uid + "_" + msgBean.body.gid;
		} else {
			if (msgBean.type == "message_notice") {
				key = "chat_unreadmsg_" + uid + "_" + msgBean.body.source;
			} else {
				key = "chat_unreadmsg_" + uid + "_" + msgBean.from;
			}
		}

		if (msgBean.from == uid && !msgBean.body.gid) {
			key = "chat_unreadmsg_" + uid + "_" + msgBean.to;
		}
		unread = DDstorage.get(key);
		if ($.isArray(unread)) {
			unread.push(msgBean);
		} else {
			unread = [msgBean];
		}
		DDstorage.set(key, unread);
	}

	function isInUnread(msgBean) {
		var unread, key;
		if (msgBean.body.gid) {
			key = "chat_unreadmsg_" + uid + "_" + msgBean.body.gid;
		} else {
			key = "chat_unreadmsg_" + uid + "_" + msgBean.from;
		}
		unread = DDstorage.get(key);
		if (!unread) {
			return false;
		}
		for (var i = 0; i < unread.length; i++) {
			var msg = unread[i];
			if (msg.body.mid == msgBean.body.mid) {
				return true;
			}
		}
		return false;
	}

	//显示消息
	function showMsg(msg, userInfo, confirm) {
		if (!userInfo) {
			get_user_info(msg.from, function(json) {
				if (json.code == 1) {
					DDstorage.set(msg.from, json.body);
					showMsg(msg, json.body, confirm);
				} else {
					//获取用户资料失败
					var data = {};
					data.realname = msg.from;
					data.uid = msg.from;
					showMsg(msg, data, confirm);
				}
			}, function() {
				var data = {};
				data.realname = msg.from;
				data.uid = msg.from;
				showMsg(msg, data, confirm);
			});
		} else {
			if (msg.from != userInfo.uid) {
				console.log("--------------------------error\n" + msg + "\n" + userInfo +
					"\n-------------------------------------");
				var errorMsg = "get message=" + JSON.stringify(msg) + ", userInfo=" +
					JSON.stringify(userInfo);
				errorReport(errorMsg);
				userInfo.uid = msg.from;
				userInfo.realname = msg.from;

			}

			//判断最后一条消息是否超出可视范围
			var isMsgOutOfWrap = showMsgOutOfWrap(msg, userInfo);

			var jdom = buildContent(msg),
				lastTime, info;
			timeline(msg);
			if (msg.body.kind != 'voice') {
				filterMsg(msg, userInfo);
			}

			if (msg.body.mode == 1001) {
				var card = buildCardMsg(msg);
				if (card) {
					jdom.find(".msg-cont").html(card);
				} else {
					return;
				}
			} else if (msg.body.kind == "voice") {
				showVoiceMsg(msg, jdom);
			} else if (msg.type == "message_file") {
				var content = getFileMsgHtml(msg);
				jdom.find(".msg-cont").html(content);
			} else {
				var content = msg.body.content;
				if (msg.body.url && msg.type == "message_notice") {
					content += "&nbsp;&nbsp;&gt;&gt;<a href='" + msg.body.url +
						"' target='_blank'>点击这里查看详情</a>"
				}
				if (msg.body.pic && msg.type == "message_notice") {
					content += "<div><a rel='gallery' href='" + msg.body.pic +
						"'><img src='" + msg.body.pic +
						"' style='max-width:320px;' class='message-img'></a></div>"
				}
				jdom.find(".msg-cont").html(content);
			}
			if (userInfo.avatar) {
				jdom.find(".msg-avatar").find("img").attr("src", userInfo.avatar);
			}
			jdom.find(".msg-avatar").find("p").text(userInfo.realname || userInfo.uid);
			jdom.attr("time", msg.body.datetime);
			jdom.attr("mid", msg.body.mid);
			if (msg.id) {
				jdom.attr("msgid", msg.id);
			}

			jdom.appendTo(".msg-wrap");
			if (msg.body.mode >= 0) {
				jdom.find(".msg-cont").addClass("mode" + msg.body.mode);
			}
			//其他处理
			if (isMsgOutOfWrap) {
				//do nothing
			} else {
				$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(
					".panel-msg .bd").height());
			}

			if ($(".message-img").length > 0) {
				$(".msg-wrap .message-img").parent().lightBox();
			}
			//文件消息回执
			/*if(confirm) {
			    share.fileAck();
			}*/

			//事件绑定
			jdom.find(".msg-avatar").find("img").attr("data-uid", userInfo.uid).css(
				"cursor", "pointer");
			bindMsgEvent(1);
		}
	}

	function notify(msgBean, userinfo, getNotify) {
		var key, content;
		if (msgBean.from == uid) {
			console.log("from self");
			return;
		}
		if (!userinfo) {
			userinfo = {};
			userinfo.uid = msgBean.from;
			userinfo.realname = msgBean.from;
			userinfo.avatar = "../../img/img-avatar.png";
			console.log("using default userinfo");
		}

		if (msgBean.body && msgBean.body.content) {
			key = msgBean.from;
			if ($.isNumeric(msgBean.to)) {
				key = msgBean.to;
			}
			content = msgBean.body.content;
			if (msgBean.type == "message_file") {
				content = "[文件]";
			}
			if (msgBean.body.mode == 1001) {
				content = "[名片]";
			}
			if (msgBean.body.kind == "voice") {
				content = "[语音]";
			}
			if (msgBean.type == "message_notice") {
				key = msgBean.body.source;
				content = msgBean.body.title;
			}
		} else if (msgBean.type == "message_file") {
			key = msgBean.from;
			if ($.isNumeric(msgBean.to)) {
				key = msgBean.to;
			}
			content = "[文件]";
		}
		if (getNotify) {
			var content = notification.getSimpleMsg(content);
			return {
				avatar: userinfo.avatar,
				from: key,
				title: userinfo.realname || msgBean.from,
				content: content
			}
		} else {
			var notice = notification.noticeMsg(userinfo.avatar, key, userinfo.realname ||
				msgBean.from, content);
			var noticeCover;
			if (msgBean.to == uid) {
				noticeCover = msgBean.from;
			} else {
				noticeCover = msgBean.to;
			}
			Timline.putNotification(noticeCover, notice);
		}
	}

	function filterMsg(msg, userInfo) {
		var content;
		if (msg.type == "message_file") {
			return;
		}
		if (msg.body && msg.body.content) {
			content = util.filterMsg(msg.body.content, true, true).replace(/\n/g,
				"<br />");
			if (content == "#A_振动") {
				content = (userInfo.realname || userInfo.uid) + "向您发送了一个震屏";
			}
			if (msg.body.mode == 5) {
				content = (userInfo.realname || userInfo.uid) + "取消了接收文件“" + msg.body.content +
					"”";
			}
			if (msg.body.mode == 7) {
				content = (userInfo.realname || userInfo.uid) + "接收了文件“" + msg.body.content +
					"”";
			}
			msg.body.content = content;
		}

	}

	/**
	 * 判断最后一条消息是否超出可视范围，如果超出，底部显示消息提示
	 * @param msg 消息对象
	 * @param userInfo 用户信息
	 * @return bool 是否显示超出的消息提示
	 */
	function showMsgOutOfWrap(msg, userInfo) {
		var notifyMsg = notify(msg, userInfo, true);
		//当前消息的总高度 - 滚动条离上面的高度 > 2个显示高度，则超出可视范围
		var invisible = $(".msg-wrap").outerHeight() - $(".panel-msg .bd").scrollTop() >
			2 * $(".panel-msg .bd").height();
		if (invisible) {
			var $tipsWrap = $(".panel-msg .bar-wrap");
			var $tips = $(
				'<div class="msg-invisible-wrap"><p><img class="msg-invisible-avatar" src="' +
				userInfo.avatar + '"/>' + notifyMsg.title + "：" + notifyMsg.content +
				'</p></div>')
			$tipsWrap.find(".msg-invisible-wrap").remove();
			$tipsWrap.append($tips);
			clearTimeout(invisibleMsgTimer);
			invisibleMsgTimer = setTimeout(function() {
				$tips.remove();
			}, 3000);
			//滚动条到底部时移除
			$(".panel-msg .bd").off("scroll").on("scroll", function() {
				if ($(this).scrollTop() == $(".msg-wrap").outerHeight() - $(
						".panel-msg .bd").height()) {
					$tips.remove();
				}
			});
			//点击滚动到底部
			$tips.one("click", function() {
				$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(
					".panel-msg .bd").height());
				$tips.remove();
			});
		}
		return invisible;
	}

	//显示时间线
	function timeline(msgBean, history) {
		var lastTime = $(".msg-wrap .msg:last").attr("time"),
			jdom, time, diff = 0;
		if (!msgBean) {
			return;
		}
		if (!msgBean.body && msgBean.message) {
			msgBean.body = msgBean.message;
		}
		if (!lastTime) {
			lastTime = new Date().getTime();
		}
		if (!$.isNumeric(lastTime)) {
			lastTime = util.parseDate(lastTime);
		}
		diff = Math.abs(lastTime - msgBean.body.datetime);
		if (diff > 120000 && diff < 1000 * 60 * 60 * 24) {
			if ($.isNumeric(msgBean.body.datetime)) {
				time = util.formatDate(new Date(msgBean.body.datetime), "HH:mm");
			} else {
				time = util.formatDate(util.parseDate(msgBean.body.datetime), "HH:mm");
			}
		} else if (diff > 1000 * 60 * 60 * 24) {
			if ($.isNumeric(msgBean.body.datetime)) {
				time = util.formatDate(new Date(msgBean.body.datetime),
					"yyyy-MM-dd HH:mm:ss");
			} else {
				time = util.formatDate(util.parseDate(msgBean.body.datetime),
					"yyyy-MM-dd HH:mm:ss");
			}
		}
		if (time) {
			jdom = $('<div class="time-stamp"><span></span></div>');
			jdom.find("span").text(time);
			if (history) {
				$("#chat_load_more").after(jdom);
			} else {
				jdom.appendTo(".msg-wrap");
			}
		}
	}


	//获取文件消息显示
	function getFileMsgHtml(msg) {
		if (!msg.body) {
			msg.body = msg.message;
		}
		if ((msg.type && msg.type == "message_file") || (msg.body && msg.body.ptype ==
				"message_file") || !msg.body.content) {
			var filesize = msg.body.size;
			if (filesize > 1024 * 1024) {
				filesize = (filesize / 1024 / 1024).toFixed(2) + "MB";
			} else if (filesize > 1024) {
				filesize = (filesize / 1024).toFixed(2) + "KB";
			} else if (filesize < 1024) {
				filesize = filesize + "字节";
			}
			var html = "<table><tr><td rowspan='2'><img src='./img/file2.png'></td>" +
				"<td><span style='margin:0 10px;'>" + msg.body.name + "</span></td>" +
				"<td rowspan='2'><a download='" + msg.body.name +
				"' style='margin:0 10px;' class='file_receive' target='_blank' href='" +
				msg.body.url + "'> &nbsp;&nbsp;接收  </a></td>" +
				"</tr><tr><td><span style='margin:0 10px;'>" + filesize +
				"</span></td></tr></table>";
			return html;
		} else {
			return "";
		}
	}

	//从本地获取用户信息
	function getUserInfo(key, erp) {
		//可能是群消息
		if ($.isNumeric(key) && erp) {
			//在某些情况数据异常
			try {
				var list = DDstorage.get(key),
					i = 0,
					user;
				user = DDstorage.get(erp);
				if (user && user.uid == erp) {
					return user;
				}
				for (i = 0; $.isArray(list) && i < list.length; i++) {
					user = JSON.parse(list[i]);
					if (user.body.uid == erp) {
						return user.body;
					}
				}
				return null;
			} catch (e) {
				console.log(e.stack || e.message || e);
				return null;
			}
		} else {
			var user = DDstorage.get(key);
			if (user && user.uid) {
				return user;
			}
			return null;
		}
	}

	function buildContent(msg) {
		var sContent =
			'<div class="msg msg-other" time="" mid=""><div class="msg-avatar"><img src="./img/img-avatar.png"><p></p></div><div class="msg-cont"></div></div>';
		if (msg.from == uid) {
			sContent =
				'<div class="msg msg-self" time="" mid=""><div class="msg-avatar"><img src="./img/img-avatar.png"><p></p></div><div class="msg-cont"></div></div>';
		}
		return $(sContent);
	}

	function buildCardMsg(msg) {
		var erp = msg.body.content;
		if (!erp) {
			return;
		}
		var info = DDstorage.get(erp);
		if (info != null && info.uid) {
			var card = $("#idcard").clone();
			card.find(".pop-title").remove();
			card.find(".pop-bottom").remove();
			card.find(".idcard-name").text(info.realname);
			if (info.avatar) {
				card.find(".idcard-img").attr("src", info.avatar);
			}
			card.find(".idcard-img").attr("uid", info.uid).css("cursor", "pointer");
			if (info.tel) {
				card.find(".idcard-tel").text("座机：" + info.tel);
			}
			card.find(".idcard-name").text(info.realname);
			card.find(".idcard-phone").text("手机：" + (info.phone || ""));
			card.find(".idcard-email").text("邮箱：" + (info.email || ""));
			card.find(".idcard-pos").text("岗位：" + (info.position || ""));
			card.find(".idcard-orgname").html("部门：<span>" + (info.orgFullName) +
				"</span>");
			return card.html();
		} else {
			get_user_info(erp, function(data) {
				if (data.code == 1) {
					DDstorage.set(erp, data.body);
					showMsg(msg, getUserInfo(msg.from));
				} else {
					util.alert("提示", "您收到一条名片消息，但查找用户信息失败，对方的erp账号为：【" + erp + "】 您可以手动搜索");
				}
			}, function() {
				util.alert("获取用户资料失败！");
			}, false);
		}
	}


	function readMsg(id, kind, groupKind, mid, callback) {
		var arr = [];
		if (!$.isArray(mid)) {
			arr = new Array();
			arr.push(mid);
		}
		var req = {
			aid: util.cookie("aid"),
			from: util.cookie("uid"),
			to: "im.jd.com",
			type: "message_read_notify",
			version: "1.0",
			body: {
				id: id,
				kind: kind,
				mids: arr,
				clientType: "web"
			}
		}
		if (groupKind) {
			req.body.groupKind = groupKind
		}
		$.ajax({
			url: "/api.action",
			data: {
				webJson: JSON.stringify(req)
			},
			dataType: "json",
			type: "GET",
			success: function(json) {
				if (callback && typeof callback == "function") {
					callback(json);
				}
			}
		});
	}

	function parseRead(msgBean) {
		var id = msgBean.body.id,
			len = 0;
		if (msgBean.body && msgBean.body.mids && msgBean.body.mids.length) {
			len = msgBean.body.mids.length;
		}
		var dom1 = util.recentContactDom(id).find(".i");

		if (!dom1.hasClass("ui-hide")) {
			var unread = parseInt(dom1.text());
			var r = unread - len;
			if (r > 0) {
				dom1.text(r + "");
			} else {
				dom1.addClass("ui-hide").text("");
			}
		} else {
			dom1.text("");
		}
		var dom2 = $("#msgcounter");
		if (dom2.is("visible")) {
			var unread = parseInt(dom2.text());
			var r = unread - len;
			if (r > 0) {
				dom2.text(r);
			} else {
				dom2.text("");
			}
		}
		msgCounter();
		//修改本地的未读消息
		var uid = util.cookie("uid");
		var key = "chat_unreadmsg_" + uid + "_" + msgBean.body.id;
		var localUnreadMessages = DDstorage.get(key);
		if (localUnreadMessages) {
			DDstorage.remove(key);
		}
	}

	function noticeInfo(msg) {
		var info = {};
		if (msg.type != "message_notice") {
			return info;
		}
		info.avatar = msg.body.icon || "/static/img/notice.png";
		info.uid = msg.body.source;
		info.realname = msg.body.source;
		info.type = "system";
		//保存信息，供其他地方调用
		var list = DDstorage.get("system_user_list");
		if (!$.isArray(list)) {
			list = new Array();
		}
		if (list.indexOf(info.uid) == -1) {
			list.push(info.uid);
			DDstorage.set("system_user_list", list, true);
		}

		DDstorage.set(info.uid, info, true);
		return info;
	}


	function showVoiceMsg(msgBean, jdom, read) {
		if (msgBean.message) {
			msgBean.body = msgBean.message;
		}
		if (msgBean.sender) {
			msgBean.from = msgBean.sender;
		}
		if (msgBean.receiver) {
			msgBean.to = msgBean.receiver;
		}
		if (msgBean.from == uid) {
			read = true;
		}
		var d = msgBean.body.duration || msgBean.message.duration;
		var width = 15 + 10 * d;
		if (width > 220) {
			width = 220;
		}
		var voice, html;
		if (msgBean.from == util.cookie("uid")) {
			voice = "<span class='voice-msg voice-msg-self' data-url='" + msgBean.body
				.content + "'></span>";
			html =
				"<div><table class='voice-status voice-status-self'><tr><td class='unread'><img src='/static/img/sound_2.png' /></td></tr><tr><td>" +
				msgBean.body.duration + "'</td></tr></table></div>";
		} else {
			voice = "<span class='voice-msg' data-url='" + msgBean.body.content +
				"'></span>";
			html =
				"<div><table class='voice-status'><tr><td class='unread'><img src='/static/img/sound_2.png' /></td></tr><tr><td>" +
				msgBean.body.duration + "'</td></tr></table></div>";
		}
		jdom.not(".time-stamp").append(html).find(".msg-cont").html(voice).css(
			"width", width + "px");
		if (read) {
			jdom.find("table").find(".unread").addClass("read");
		}
	}

	function bindMsgEvent(imgonload) {
		if ($(".message-img").length > 0) {
			$(".msg-wrap .message-img").parent().lightBox();
		}
		$(".msg-avatar img").unbind("click").bind("click", function() {
			var id = $(this).attr("data-uid");
			require(["visiting_card"], function(card) {
				card.show(id);
			});
		});
		if (imgonload) {
			$("#jd-recent-contacts .rc-item .rc-msg a").unbind("click").bind("click",
				function(event) {
					event.preventDefault();
					return false;
				});
		}

		$("img.idcard-img").unbind("click").bind("click", function() {
			var id = $(this).attr("uid");
			require(["visiting_card"], function(card) {
				card.show(id);
			});
		});
		$("a[download]").unbind("click").bind("click", function() {
			var href = $(this).attr("href"),
				download = $(this).attr("download");
			if (href.indexOf("http://storage.dearcode.net") == 0 || href.indexOf(
					"http://s.dearcode.net") == 0) {
				download = encodeURI(encodeURI(download));
				href = "/file/download?url=" + encodeURIComponent(href) + "&fileName=" +
					download;
				$(this).attr("href", href)
			}
		});

		$(".msg-avatar img").unbind("error").bind("error", function() {
			$(this).attr("src", "/static/img/img-avatar.png");
		});
		$(".voice-msg").unbind("click").bind("click", function() {
			var url = $(this).attr("data-url");
			url = "/msg/voice?url=" + encodeURIComponent(url);
			var player = $("#player_voice");
			var _this = this;
			$(".voice-msg").removeClass("playing").removeClass("voice-playing").removeClass(
				"voice-playing-self");
			if ($(this).hasClass("voice-msg-self")) {
				$(this).addClass("voice-playing-self");
			}
			$(this).addClass("playing");
			if (player.length == 0) {
				$("body").append(
					"<div id='player_voice' style='width:0;height:0'></div>");
				player = $("#player_voice");
				player.jPlayer({
					swfPath: "js",
					supplied: "wav",
					solution: "html,flash",
					ready: function() {
						$(this).jPlayer("setMedia", {
							wav: url
						}).jPlayer("volume", 1).jPlayer("play");
					},
					error: function() {
						$(".playing").removeClass("voice-playing").removeClass(
							"voice-playing-self");
						util.alert("提示", "语音消息播放失败，您可以稍后重试");
					},
					playing: function() {
						$(".playing").addClass("voice-playing");
					},
					ended: function() {
						$(".playing").removeClass("voice-playing").removeClass(
							"voice-playing-self");
						$(".playing").parent().next().find(".voice-status .unread").addClass(
							"read");
					}
				});
			} else {
				player.jPlayer("setMedia", {
					wav: url
				}).jPlayer("volume", 1).jPlayer("play");
			}
		});
	}

	function msgCounter() {
		var msgCounter = 0;
		$("#jd-recent-contacts .rc-item").each(function() {
			var t = $(this).find(".l .i");
			if (!t.hasClass("ui-hide")) {
				var num = parseInt(t.text(), 10);
				if (num > 0) {
					msgCounter += num;
				}
			}
		});
		if (msgCounter > 0) {
			$("#msgcounter").text(msgCounter).show();
		} else {
			$("#msgcounter").text("").hide();
		}
	}
	return {
		poll: poll,
		readMsg: readMsg,
		showMsg: showMsg,
		getFileMsgHtml: getFileMsgHtml,
		showVoiceMsg: showVoiceMsg,
		bindMsgEvent: bindMsgEvent,
		msgCounter: msgCounter,
		stopPoll: stopPoll
	};

});
