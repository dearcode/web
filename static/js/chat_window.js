/**
 *
 */

define("chat_window", ["util"], function(util) {
	var textInVal = []; //保存输入框中的内容

	var _getHistoryMessages = function(conver, type) {
		get_chat_history_all(conver, function(data) {
			if (data.Code == 0 && data.Body) {
				msgWindow.showHistoryMsg(data.Body, conver, type);
			}
		})
	};

	var msgWindow = {
		create: function(conver, kind) {
			if (conver == util.cookie("uid")) {
				$(".triangle-flag").hide();
				util.alert("提示", "不能和自己聊天");
				return;
			}
			var text = $("#text_in").val();
			var f = false;
			for (var i = 0; i < textInVal.length; i++) {
				if (textInVal[i].key == this.conver) {
					textInVal[i].value = text;
					f = true;
					break;
				}
			}
			if (!f) {
				var kv = {};
				kv.key = this.conver;
				kv.value = text;
				textInVal.push(kv);
			}

			$("#text_in").val('');
			this.conver = conver;
			this.kind = kind;

			this.aid = util.cookie('aid');
			this.uid = util.cookie('uid');
			this.dom = $(".panel-view");

			if (util.isNumber(conver)) {
				this.checkSingleData();
			} else {
				this.checkGroupData();
			}


			// 恢复切换窗口之前的输入数据
			for (var i = 0; i < textInVal.length; i++) {
				if (textInVal[i].key == this.conver) {
					$("#text_in").val(textInVal[i].value);
					break;
				}
			}

			if (this.kind == "system") {
				$("#text_in").attr("disabled", "disabled"); + $("#text_in").removeAttr(
					"disabled");
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

			//滚动条滚动到底部
			setTimeout(function() {
				$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(
					".panel-msg .bd").height());
			}, 800);

			//窗口展开，关闭消息提醒
			var notice = Timline.getNotification(conver);
			if (notice) {
				notice.close();
			}
		},
		//单人消息
		showSingleMsg: function() {
			var userinfo = DDstorage.get(this.conver) || {};
			msgWindow.dom.attr("conver", msgWindow.conver);
			msgWindow.dom.attr("kind", msgWindow.kind);
			$(".panel-msg").find(".hd").removeClass("group-chat");
			//修改聊天窗口上显示undefined的问题
			var realname = userinfo.NickName || userinfo.Name,
				position = userinfo.Position;
			if (!realname) {
				realname = util.recentContactDom(this.conver).find(".title").text();
			}
			if (!realname) {
				realname = util.searchResDom(this.conver).find(".title").text();
				position = util.searchResDom(this.conver).find(".r").attr("pos");
			}
			if (!realname) {
				realname = this.conver;
			}
			if (!position) {
				position = "";
			}
			if (!userinfo.NickName) {
				userinfo.ID = this.conver;
				userinfo.NickName = this.conver;
				get_user_info(this.conver, function(json) {
					if (json || json.ID) {
						DDstorage.set(json.ID, json);
					}
				});
			}

			msgWindow.dom.find(".title").html(
				'<span class="i" title="名片"></span><b>' + realname + '</b><sub>' +
				position + '</sub>');
			msgWindow.dom.find(".msg-wrap").empty();
			msgWindow.dom.find(".msg-wrap").html(
				'<div class="load-more"  id="chat_load_more" count="1"><span class="i"></span></div>'
			);
			var unreadmsg = DDstorage.get("chat_unreadmsg_" + msgWindow.uid + "_" +
				this.conver);
			if (unreadmsg != null) {
				msgWindow.showUnreadMsg(userinfo, unreadmsg);
				DDstorage.remove("chat_unreadmsg_" + msgWindow.uid + "_" + this.conver);
			}

			msgWindow.getHistoryMsg("init");
			$(".panels-wrap").css("left", "0px");
			$("#clearmonitor").addClass("ui-hide");
			msgWindow.dom.show();
			if (this.kind == "system") {
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
		//群组消息
		showGroupMsg: function() {
			$("#send-mail").show();
			$("#team-share").show();
			$("#team-temp").show();

			msgWindow.dom.attr("conver", msgWindow.conver);
			msgWindow.dom.attr("kind", msgWindow.kind);
			if (msgWindow.kind == "discussion_group") {
				$(".panel-msg").find(".hd").addClass("group-chat");
			} else {
				$(".panel-msg").find(".hd").removeClass("group-chat");
			}

			var gname = util.filterMsg(DDstorage.get(this.conver + "info").name);
			msgWindow.dom.find(".title").html(gname);
			msgWindow.dom.find(".msg-wrap").empty();
			msgWindow.dom.find(".msg-wrap").html(
				'<div class="load-more"  id="chat_load_more" count="1"><span class="i"></span></div>'
			);
			var userinfo = DDstorage.get(this.conver);
			var unreadmsg = DDstorage.get("chat_unreadmsg_" + msgWindow.uid + "_" +
				this.conver);
			if (unreadmsg != null) {
				msgWindow.showUnreadMsg(userinfo, unreadmsg);
				DDstorage.remove("chat_unreadmsg_" + msgWindow.uid + "_" + this.conver);
			}

			msgWindow.getHistoryMsg("init");
			$(".panels-wrap").css("left", "0px");
			$("#clearmonitor").addClass("ui-hide");
			msgWindow.dom.show();
		},
		checkSingleData: function() {
			var userinfo = DDstorage.get(this.conver);
			if (!userinfo || !userinfo.ID) {
				get_user_info(msgWindow.conver, function(result) {
					if (result && result.ID) {
						DDstorage.set(msgWindow.conver, result);
					}
					msgWindow.showSingleMsg();
				});
			} else {
				msgWindow.showSingleMsg();
			}
		},
		checkGroupData: function() {
			var userinfo = DDstorage.get(msgWindow.conver);
			if (!userinfo) {
				get_group_user_list(msgWindow.conver, function(result) {
					var pnames = [];
					for (var i = 0; i < result.body.items.length; i++) {
						var uid = result.body.items[i].user.uid;
						pnames.push(uid);
						Timline.pushUids(uid);
					}
					get_batch_user_info(pnames, function(r) {
						DDstorage.set(msgWindow.conver, r);
						for (var i in r) {
							try {
								var user = JSON.parse(r[i]);
								if (user.body.uid) {
									DDstorage.set(user.body.uid, user.body);
								}
							} catch (e) {

							}
						}
					});
				});
				get_group_info(msgWindow.conver, function(result) {
					for (var i = 0; i < result.body.groups.length; i++) {
						if (msgWindow.conver == result.body.groups[i].gid) {
							DDstorage.set(msgWindow.conver + "info", result.body.groups[i]);
						}
					}
					msgWindow.showGroupMsg();
				});
			} else {
				msgWindow.showGroupMsg();
			}
		},
		showUnreadMsg: function(userinfo, unreadmsgs) {
			var poll = require(["poll"]);
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
					var msg = "",
						kind = "chat";
					var user = DDstorage.get(unreadmsg[j].from || unreadmsg[j].body.from);
					if (unreadmsg[j].body.mode == 1001) {
						msg = msgWindow.buildCardMsg(unreadmsg[j]);
					} else if (unreadmsg[j].body.content) {
						msg = util.filterMsg(unreadmsg[j].body.content, true, true).replace(
							/\n/g, "<br />");
					}
					poll.readMsg(msgWindow.conver, kind, this.kind, unreadmsg[j].body.mid);
					if (msg) {
						$text1s.find(".msg-cont").html(msg).addClass("mode" + unreadmsg[j].body
							.mode);
					}

					if (user) {
						$text1s.find(".msg-avatar").find("p").html(user.realname);
						$text1s.find(".msg-avatar").find("img").attr("src", user.avatar).attr(
							"data-uid", user.uid);
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
							$text1s.find(".msg-avatar").find("img").attr("data-uid", unreadmsg[j]
								.from).end().find("p").html(unreadmsg[j].from);
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
					var user = DDstorage.get(unreadmsg[j].from) || {
						"uid": unreadmsg[j].from
					};
					$text1s = this.buildMsgHtml(unreadmsg[j], true);

					var msg = "",
						kind = "chat";
					if (unreadmsg[j].body.mode == 1001) {
						msg = msgWindow.buildCardMsg(unreadmsg[j], $text1s, userinfo);
					} else if (unreadmsg[j].body.content) {
						msg = util.filterMsg(unreadmsg[j].body.content, true, true).replace(
							/\n/g, "<br />");
					}
					if (unreadmsg[j].type && unreadmsg[j].type == "message_notice") {
						kind = "notice";
						poll.readMsg(unreadmsg[j].from, kind, "", unreadmsg[j].body.mid);
					} else {
						poll.readMsg(msgWindow.conver, kind, "", unreadmsg[j].body.mid);
					}

					if (msg == "#A_振动") {
						if (user.uid == util.cookie("uid")) {
							msg = "您发送了一个震屏消息";
						} else {
							msg = (user.realname || user.uid) + "向您发送了一个震屏消息";
						}

					}
					if (unreadmsg[j].body.url && unreadmsg[j].type == "message_notice") {
						msg += "&nbsp;&nbsp;&gt;&gt;<a href='" + unreadmsg[j].body.url +
							"' target='_blank'>点击这里查看详情</a>"
					}
					if (unreadmsg[j].body.pic && unreadmsg[j].type == "message_notice") {
						msg += "<div><a rel='gallery' href='" + unreadmsg[j].body.pic +
							"'><img src='" + unreadmsg[j].body.pic +
							"' style='max-width: 320px;' class='message-img'></a></div>"
					}
					if (msg) {
						$text1s.find(".msg-cont").html(msg).addClass("mode" + unreadmsg[j].body
							.mode);
					}
					$text1s.find(".msg-avatar").find("p").html(user.realname);
					if (user.avatar) {
						$text1s.find(".msg-avatar").find("img").attr("src", user.avatar);
					}
					$text1s.find(".msg-avatar").find("img").attr("data-uid", user.uid);
					$text1s.attr("time", unreadmsg[j].body.datetime);
					$text1s.attr("mid", unreadmsg[j].body.mid);
					$text1s.appendTo(".msg-wrap");
					$text1s.find(".msg-avatar").find("img").attr("data-uid", userinfo.uid)
						.unbind("click").bind("click", function() {
							var _this = this;
							require(["visiting_card"], function(card) {
								card.show($(_this).attr("data-uid"));
							});
						});
				}
			}
			poll.bindMsgEvent();

		},
		getHistoryMsg: function(type) {
			var conver = $(".panel-view").attr("conver");
			$("#chat_load_more").addClass("load-more-ing");
			if (type == "init") {
				_getHistoryMessages(conver, type);
				return;
			}
			var mid = $(".msg-wrap").find(".msg:first").attr("mid");
			var end = $(".msg-wrap .msg:eq(0)").attr("time");
			if (!end) {
				//获取服务器最新的历史记录
				end = "";
			}
			if ($.isNumeric(end)) {
				end = util.formatDate(new Date(parseInt(end)), "yyyy-MM-dd HH:mm:ss");
			}
			end = encodeURI(end);
			var start = "";
			get_history_message(conver, start, end, function(data) {
				if (data.code == 1) {
					msgWindow.showHistoryMsg(data.body.logs, conver, type);
				} else {
					$("#chat_load_more").remove();
				}
			}, function() {
				$("#chat_load_more").hide().remove();
			});
		},
		filterHistoryMsg: function(msgarr) {
			var result = [];
			for (var i = 0; i < msgarr.length; i++) {
				if (msgarr[i].type == "message_chat" || msgarr[i].type ==
					"message_file") {
					result.push(msgarr[i]);
				}
			}
			return result;
		},
		showHistoryMsg: function(msgs, conver, type) {
			//当前conver不一致时不显示信息
			if (conver != $(".panel-view").attr("conver")) {
				return;
			}

			var userinfo = DDstorage.get(conver);
			/*var poll = require("poll");*/
			var selfinfo = DDstorage.get(util.cookie("uid"));
			var max = msgs.length;
			if (type == "initload") {
				if (msgs.length == 0) {
					$("#chat_load_more").remove();
					return;
				}
				max = 3;
			}
			if (type == "init") {
				max = 20;
			} else {
				max = msgs.length;
			}

			var msgHeightOld = $(".msg-wrap").outerHeight();
			if (max != 0) {
				//对消息进行排序
				var mids = [];
				for (var i = 0; i < msgs.length; i++) {
					var mid;
					if (msgs[i].Event != 0 || msgs[i].Msg.From != userinfo.ID) {
						continue;
					}

					mid = i;
					mids.push(mid);
				}

				mids.sort(function(f, l) {
					return f < l ? 1 : -1;
				});

				for (var j = 0; j < max; j++) {
					var i = mids[j];

					var msg = msgs[i].Msg;
					if (msg.From == selfinfo.ID) {
						var $textc = msgWindow.buildMsgHtml(msg, false)
						var c = "";

						if (!msg.Body) {
							console.log(msg);
						} else {
							c = util.filterMsg(msg.Body, true, true).replace(/\n/g,
								"<br />");
						}


						if (c) {
							$textc.find(".msg-cont").addClass("mode" + 0).html(
								c);
						}

						$textc.attr("time", msg.CreateTime);
						$textc.attr("mid", msg.ID);
						$textc.find(".msg-avatar").find("p").text(selfinfo.NickName ||
							selfinfo.Name);
						if (selfinfo.Avatar) {
							$textc.find(".msg-avatar").find("img").attr("src", selfinfo.Avatar);
						}
						$textc.find(".msg-avatar").find("img").attr("data-uid", selfinfo.uid)
						$("#chat_load_more").after($textc);
					} else {
						var user = DDstorage.get(msg.From);
						if (!user) {
							get_user_info(msg.From, function(data) {
								if (data) {
									DDstorage.set(data.ID, data);
									user = data;
								}
							}, function() {

							}, false);
						}

						var $texts = this.buildMsgHtml(msg, false);
						var c = "";
						if (!userinfo) {
							userinfo = {};
						}

						if (msg && msg.Body) {
							c = util.filterMsg(msg.Body, true, true).replace(
								/\n/g, "<br />");
						}


						if (c) {
							$texts.find(".msg-cont").html(c).addClass("mode" + 0);
						}

						$texts.attr("time", msg.CreateTime);
						$texts.attr("mid", msg.ID);
						$texts.find(".msg-avatar").find("p").text(user.NickName || user.Name);
						if (user.Avatar) {
							$texts.find(".msg-avatar").find("img").attr("src", user.Avatar);
						}
						$texts.find(".msg-avatar").find("img").attr("data-uid", user.ID);
						$texts.find(".msg-avatar").find("img").attr("data-uid", user.ID).unbind(
							"click").click(function() {
							var _this = this;
							require(["visiting_card"], function(card) {
								card.show($(_this).attr("data-uid"));
							});
						});
						$("#chat_load_more").after($texts);
					}
				}

				if (type == "init" && j == 0) {
					var con = msg.Body;
					util.recentContactDom(conver).find(".rc-msg").text(con);
				}
			} else {
				$("#chat_load_more").remove();
			}

			if (type == "loadmore") {
				if (max < 10) {
					$("#chat_load_more").remove();
				}
			}
			$("#chat_load_more").removeClass("load-more-ing");
			var msgHeightNew = $(".msg-wrap").outerHeight();
			/*poll.bindMsgEvent();*/
			if (type == "init" || type == "initload") {
				$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(
					".panel-msg .bd").height());
			} else {
				//点击加载更多，滚动条保持在原来位置
				$(".panel-msg .bd").scrollTop(msgHeightNew - msgHeightOld);
			}
		},
		buildClientContent: function(msg) {
			var time = "",
				timestamp = "";
			if ($(".msg").length == 0) {
				time = msg.CreateTime;
				if ($.isNumeric(time)) {
					time = new Date(parseInt(time, 10));
				} else {
					time = util.parseDate(time, "yyyy-MM-dd HH:mm:ss");
				}
				time = util.formatDate(time, "yyyy-MM-dd HH:mm");
				timestamp = '<div class="time-stamp"><span>' + time + '</span></div>';
			}
			var cContent = [timestamp,
				'<div class="msg msg-self" time="" mid=""><div class="msg-avatar"> <img alt="" src="/static/img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>'
			];
			return $(cContent.join(""));
		},
		buildServiceContent: function(msg) {
			var sContent = [
				'<div class="msg msg-other" time="" mid=""><div class="msg-avatar"><img alt="" src="/static/img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>'
			];
			return $(sContent.join(""));
		},

		buildMsgHtml: function(msg, append) {
			var time, lasttime, timestamp = "",
				html, userInfo = util.cookie("uid"),
				date, pattern, diff;
			if (msg.From == userInfo) {
				html =
					'<div class="msg msg-self" time="" mid=""><div class="msg-avatar"> <img alt="" src="/static/img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>';
			} else {
				html =
					'<div class="msg msg-other" time="" mid=""><div class="msg-avatar"> <img alt="" src="/static/img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>';
			}

			time = msg.CreateTime;
			if (append) {
				lasttime = $(".msg").last().attr("time");
			} else {
				lasttime = $(".msg").eq(0).attr("time");
			}
			if (!lasttime) {
				if ($.isNumeric(time)) {
					date = new Date(parseInt(time, 10));
					if (Math.abs(date.getDate() - new Date().getDate()) > 0) {
						pattern = "yyyy-MM-dd HH:mm";
					} else {
						pattern = "HH:mm";
					}
				} else {
					date = util.parseDate(time, "yyyy-MM-dd HH:mm:ss");
					if (Math.abs(date.getDate() - new Date().getDate()) > 0) {
						pattern = "yyyy-MM-dd HH:mm";
					} else {
						pattern = "HH:mm";
					}
				}
				time = util.formatDate(date, pattern);
				timestamp = '<div class="time-stamp"><span>' + time + '</span></div>';
			} else {
				if ($.isNumeric(time)) {
					time = new Date(parseInt(time, 10));
				} else {
					time = util.parseDate(time, "yyyy-MM-dd HH:mm:ss");
				}
				if ($.isNumeric(lasttime)) {
					lasttime = new Date(parseInt(lasttime, 10));
				} else {
					lasttime = util.parseDate(lasttime, "yyyy-MM-dd HH:mm:ss");
				}
				diff = Math.abs(time.getTime() - lasttime.getTime());
				if (diff > 1000 * 60 * 2) {
					if (Math.abs(time.getDate() - new Date().getDate()) > 0) {
						pattern = "yyyy-MM-dd HH:mm";
					} else {
						pattern = "HH:mm"
					}
					time = util.formatDate(time, pattern);
					timestamp = '<div class="time-stamp"><span>' + time + '</span></div>';
				}
			}

			html = timestamp + html;
			return $(html);
		},
		buildCardMsg: function(msg, jdom, userinfo) {
			var erp = msg.content;
			if (!erp && msg.body && msg.body.content) {
				erp = msg.body.content;
			}
			if (!erp && msg.message && msg.message.content) {
				erp = msg.message.content;
			}
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
				if (info.tel) {
					card.find(".idcard-tel").text("座机：" + info.tel);
				}
				card.find(".idcard-img").attr("uid", info.uid).css("cursor", "pointer");
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
						if (!userinfo || !userinfo.realname) {
							userinfo = {
								realname: msg.sender
							}
						}
						var card = $("#idcard").clone();
						card.find(".pop-title").remove();
						card.find(".pop-bottom").remove();
						card.find(".idcard-name").text(data.body.realname);
						if (data.body.avatar) {
							card.find(".idcard-img").attr("src", data.body.avatar);
						}
						if (data.body.tel) {
							card.find(".idcard-tel").text("座机：" + data.body.tel);
						}
						card.find(".idcard-name").text(data.body.realname);
						card.find(".idcard-phone").text("手机：" + (data.body.phone || ""));
						card.find(".idcard-email").text("邮箱：" + (data.body.email || ""));
						card.find(".idcard-pos").text("岗位：" + (data.body.position || ""));
						card.find(".idcard-orgname").html("部门：<span>" + (data.body.orgFullName) +
							"</span>");
						var c = card.html();
						jdom.find(".msg-cont").html(c).addClass("mode" + msg.message.mode);
						jdom.attr("time", msg.message.datetime || msg.created);
						jdom.attr("mid", msg.message.mid);
						jdom.attr("muid", msg.mongoId);

						jdom.find(".msg-avatar").find("p").text(userinfo.realname);
						if (userinfo.avatar) {
							jdom.find(".msg-avatar").find("img").attr("src", userinfo.avatar);
						}
						jdom.find(".msg-avatar").find("img").attr("data-uid", userinfo.uid);
						$("#chat_load_more").after(jdom);
					}
				}, function() {
					util.alert("获取用户资料失败！");
				}, false);
			}
		}
	};
	return msgWindow;
});
