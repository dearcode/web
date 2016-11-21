define(function(require, exports, module) {
	var util = require("util"),
		stop = false,
		errorTimes = 0,
		aid = util.cookie("aid"),
		uid = util.cookie("uid"),
		invisibleMsgTimer = null,

		//注册消息收取事件
		socket = io(),
		COOKIE_NAME = 'sessionid';

	socket.on('chat:message', function(msg, callBack) {
		console.log(msg);
		callBack("recv success" + msg);

		if ($("#net-error").length > 0) {
			$.graynormal($("#user-avatar").find("img"));
			$("#msgbox-alert-ok").click();
		}

		//初步解析消息
		msg = JSON.parse(msg);

		//消息回执
		//rebackMsg(msg);

		//TODO 判断消息是否是数组消息， 如果是数组就循环处理
		if ($.isArray(msg)) {

		} else {
			parse(msg);
		}
	});

	socket.emit('main session', $.cookie(COOKIE_NAME), function(data) {
		console.log(data);
	});


	//拉取消息
	function poll() {

		var from = util.cookie("uid");
		if (!from) {
			stop = true;
		}

		if (stop) {
			popup4Relogin();
			return;
		}


		$.ajax({
			url: "/api.action?aid=" + aid + "uid=" + uid + "&from=" + from +
				"&ptype=offlineMessageGet",
			type: "GET",
			timeout: 60000,
			complete: function(result) {
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


	//弹框提醒重新登录
	function popup4Relogin(msg) {
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
	function parse(msg) {
		if (!msg || typeof msg != 'object') {
			return;
		}


		if (msg.Event == 0) { //普通聊天消息
			if (beforeParse(msg)) {
				return;
			}
			msg.kind = "chat";
			parseChat(msg.Msg, false);
			return;
		} else if (msg.Event == 1) { //群组消息

		} else if (msg.Event == 2) { //好友关系
			update_status(msg);
		} else if (msg.Event == 3) { //好友上线
			update_status(msg);
		} else if (msg.Event == 4) { //好友下线
			update_status(msg);
		} else if (msg.Event == 5) { //通知
			msg.kind = "notice";
			var tim = util.formatDate(new Date(msg.CreateTime),
				"yyyy-MM-dd HH:mm:ss");
			msgBean.body.content = "【" + tim + "】&nbsp;&nbsp;" + msgBean.body.content;
			parseChat(msgBean);
			return;
		} else {
			console.log("未知消息类型");
		}

		return;

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

		if (msgBean.type == "message_read_notify") {
			parseRead(msgBean);
			return;
		}
	}

	function beforeParse(msg) {
		return (typeof msg.To != "undefined" && msg.To != uid && !$.isNumeric(
			msg.To)) && (typeof msg.From != "undefined" && msg.From !=
			uid);
	}

	//更新用户信息
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

	function parseChat(msg, offline) {
		var conver = $(".panel-view").attr("conver"),
			userinfo, from, content, len;
		if (msg.Body) {
			content = msg.Body;
		}
		from = msg.From;
		var f = msg.From.toLowerCase();
		var t = msg.To;
		var u = uid.toLowerCase();

		//已经存在的消息(mid唯一)不再显示
		len = $(".msg-wrap .msg[mid='" + msg.ID + "']").length;
		if (len > 0) {
			return;
		}

		if (t != conver && from != conver) {
			if (isInUnread(msg)) {
				return;
			}
		}
		//显示左侧消息
		showLeftMsg(msg);

		if (msg.Event != 0) {
			userinfo = noticeInfo(msg);
		} else {
			userinfo = getUserInfo(from);
		}

		//需要显示消息
		saveUnReadMsg(msg);

		//保存消息记录
		saveHistory(msg);

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
			} else {
				console.log(offline[i]);
			}
		}
	}

	//显示左边最近联系人列表中的消息
	function showLeftMsg(msg) {
		var from, info;
		from = msg.From;
		if (from == uid) {
			from = msg.To;
		}

		var userinfo;
		userinfo = getUserInfo(from);
		showUserLeft(msg, userinfo);
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
		var from = msg.From;
		if (msg.From == uid) {
			from = msg.To;
		}

		if (!info || !info.ID) {
			get_user_info(from, function(json) {
				if (json) {
					info = json;
					DDstorage.set(from, info);
					showUserLeft(msg, info);
				}
			});
		} else {
			//notify(msg, info);
			if (msg.From == uid) {
				from = msg.To;
			}
			buildRecentView("customer", from, info.Avatar, info.NickName || info.Name,
				msg);

			showMsg(msg, info);
		}

	}

	function showNoticeLeft(msg, info) {
		notify(msg, info);
		buildRecentView("system", info.ID, info.Avatar, info.NickName || info.Name,
			msg);
	}

	//左侧消息
	function buildRecentView(kind, conver, avatar, name, msg) {
		var target = util.recentContactDom(conver);
		var html = '<li kind="" id="" conver="" class="rc-item"><div class="l">' +
			'<img alt="" src="/static/img/team-avatar.png"><span class="i"></span></div><div class="m">' +
			'<div class="nickname"><span class="i i-on"></span></div><div class="rc-msg wto"></div></div><div class="r"></div></li>';
		if (target.length == 0) {
			target = $(html);
		}

		target.attr("kind", kind).attr("conver", conver).attr("id",
			"recent-contact-" + conver);

		if (kind == "customer") {
			if (avatar) {
				target.find("img").attr("src", avatar);
			} else {
				target.find("img").attr("src", "/static/img/img-avatar.png");
			}
		}

		target.find(".nickname").text(name);
		target.find(".r").html(util.formatDate(new Date(msg.CreateTime),
			"HH:mm:ss"));
		target.find(".wto").text(filterMsgForLeft(msg));
		if ($(".panel-view").attr("conver") != conver && msg.From != uid) {
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
		if (msg && msg.Body) {
			html = msg.Body;
			try {
				var tmp = $("<div></div>").html(util.filterMsg(html));
				if (tmp.find("img").length > 0) {
					html = "[图片]" + tmp.text();
				}

				if ($.fn.jdExpression.replaceName(html) != html) {
					tmp = $("<div></div>").html($.fn.jdExpression.replaceName(html));
					html = "[表情]" + tmp.text();
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
	function saveHistory(msg) {
		var history, key;
		if (msg.From != uid) {
			key = "chat_recentmsg_" + uid + "_" + msg.From;
		} else {
			key = "chat_recentmsg_" + uid + "_" + msg.To;
		}

		history = DDstorage.get(key);
		if ($.isArray(history)) {
			history.unshift(msg);
		} else {
			history = [msg];
		}

		if (msg.Event == 0) {
			DDstorage.set(key, history, 1);
		} else {
			DDstorage.set(key, history);
		}
	}

	//保存未读消息
	function saveUnReadMsg(msg) {
		var unread, key;
		if (msg.From != uid) {
			key = "chat_unreadmsg_" + uid + "_" + msg.From;
		} else {
			key = "chat_unreadmsg_" + uid + "_" + msg.To;
		}

		unread = DDstorage.get(key);
		if ($.isArray(unread)) {
			unread.push(msg);
		} else {
			unread = [msg];
		}
		DDstorage.set(key, unread);
	}

	function isInUnread(msg) {
		var unread, key;
		key = "chat_unreadmsg_" + uid + "_" + msg.From;

		unread = DDstorage.get(key);
		if (!unread) {
			return false;
		}

		for (var i = 0; i < unread.length; i++) {
			var m = unread[i];
			if (m.ID == msg.ID) {
				return true;
			}
		}
		return false;
	}

	//显示消息
	function showMsg(msg, userInfo, confirm) {
		if (!userInfo) {
			get_user_info(msg.From, function(json) {
				if (json) {
					DDstorage.set(msg.From, json);
					showMsg(msg, json, confirm);
				}
			});
		} else {
			if (msg.From != userInfo.ID) {
				console.log("--------------------------error\n" + msg + "\n" + userInfo +
					"\n-------------------------------------");
				var errorMsg = "get message=" + JSON.stringify(msg) + ", userInfo=" +
					JSON.stringify(userInfo);
				errorReport(errorMsg);
				userInfo.ID = msg.From;
			}

			//判断最后一条消息是否超出可视范围
			//var isMsgOutOfWrap = showMsgOutOfWrap(msg, userInfo);

			var jdom = buildContent(msg),
				lastTime, info;
			timeline(msg);
			filterMsg(msg, userInfo);

			var content = msg.Body;
			jdom.find(".msg-cont").html(content);

			if (userInfo.Avatar) {
				jdom.find(".msg-avatar").find("img").attr("src", userInfo.Avatar);
			}

			jdom.find(".msg-avatar").find("p").text(userInfo.NickName || userInfo.Name);
			jdom.attr("time", msg.CreateTime);
			jdom.attr("mid", msg.ID);
			if (msg.id) {
				jdom.attr("msgid", msg.ID);
			}

			jdom.appendTo(".msg-wrap");
			if (msg.body.mode >= 0) {
				jdom.find(".msg-cont").addClass("mode" + 1);
			}
			//其他处理
			if ( /*isMsgOutOfWrap*/ true) {
				//do nothing
			} else {
				$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(
					".panel-msg .bd").height());
			}

			if ($(".message-img").length > 0) {
				$(".msg-wrap .message-img").parent().lightBox();
			}

			//事件绑定
			jdom.find(".msg-avatar").find("img").attr("data-uid", userInfo.ID).css(
				"cursor", "pointer");
		}
	}

	function filterMsg(msg, userInfo) {
		var content;
		if (msg.Body) {
			content = util.filterMsg(msg.Body, true, true).replace(/\n/g,
				"<br />");

			msg.Body = content;
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
	function timeline(msg, history) {
		var lastTime = $(".msg-wrap .msg:last").attr("time"),
			jdom, time, diff = 0;
		if (!msg) {
			return;
		}

		if (!lastTime) {
			lastTime = new Date().getTime();
		}
		if (!$.isNumeric(lastTime)) {
			lastTime = util.parseDate(lastTime);
		}

		diff = Math.abs(lastTime - msg.CreateTime);
		if (diff > 120000 && diff < 1000 * 60 * 60 * 24) {
			if ($.isNumeric(msg.CreateTime)) {
				time = util.formatDate(new Date(msg.CreateTime), "HH:mm");
			} else {
				time = util.formatDate(util.parseDate(msg.CreateTime), "HH:mm");
			}
		} else if (diff > 1000 * 60 * 60 * 24) {
			if ($.isNumeric(msg.CreateTime)) {
				time = util.formatDate(new Date(msg.CreateTime),
					"yyyy-MM-dd HH:mm:ss");
			} else {
				time = util.formatDate(util.parseDate(msg.CreateTime),
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
			'<div class="msg msg-other" time="" mid=""><div class="msg-avatar"><img src="/static/img/img-avatar.png"><p></p></div><div class="msg-cont"></div></div>';
		if (msg.From == uid) {
			sContent =
				'<div class="msg msg-self" time="" mid=""><div class="msg-avatar"><img src="/static/img/img-avatar.png"><p></p></div><div class="msg-cont"></div></div>';
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

		$(".msg-avatar img").unbind("error").bind("error", function() {
			$(this).attr("src", "/static/img/img-avatar.png");
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
		bindMsgEvent: bindMsgEvent,
		msgCounter: msgCounter
	};

});
