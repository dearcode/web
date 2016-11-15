/**
 *
 */
define("chat", ["util"], function(util) {
	var chatAjax = {
		send: function(msg) {
			this.aid = util.cookie('aid');
			this.uid = util.cookie('uid');
			var inputText = msg || $("#text_in").val();
			this.conver = $(".panel-view").attr('conver');
			this.kind = $(".panel-view").attr("kind");
			if ((!inputText || !$.trim(inputText))) {
				$("#text_in").focus();
				return;
			};
			this.msgId = util.uuid();

			if (this.kind == "system") {
				util.alert("提示", "抱歉，暂时无法回复系统消息");
				return;
			}
			if (!msg) {
				$("#text_in").val("");
			}
			chatAjax.showClientMsg(inputText);
			if (this.kind == "customer") {
				chat_single(this.msgId, this.conver, (util.filterMsg(inputText, false,
					false)), function(data) {
					chatAjax.redirectLogin(data);
					chatAjax.afterSendMsg(inputText, data);

				}, function() {
					chatAjax.afterSendMsg(inputText);
				});
			} else if (this.kind == "discussion_group") {
				chat_group(this.msgId, this.conver, (util.filterMsg(inputText, false,
					false)), function(data) {
					chatAjax.redirectLogin(data);
					chatAjax.afterSendMsg(inputText, data);
				}, function() {
					chatAjax.afterSendMsg(inputText);
				});
			} else { //临时会话
				chat_temp(this.msgId, this.conver, (util.filterMsg(inputText, false,
					false)), function(data) {
					chatAjax.redirectLogin(data);
					chatAjax.afterSendMsg(inputText, data);
				}, function() {
					chatAjax.afterSendMsg(inputText);
				});
			};
			$("#text_in").focus();
		},

		redirectLogin: function(data) {
			if (data && data.error && data.error == 100) {
				util.alert("提示", "登录失效，请您重新登录", function() {
					util.cookie("uid", "", {
						expires: -1
					});
					util.cookie("aid", "", {
						expires: -1
					});

					$("body").addClass("sendingMail");
					window.location.href = "/login";
				});
				setTimeout(function() {
					util.cookie("uid", "", {
						expires: -1
					});
					$("body").addClass("sendingMail");
					window.location.href = "/login";
				}, 5000);
			}
		},
		setRecentMsg: function(inputText, data) {
			var clientmsg = {
				"id": this.msgId,
				"from": this.uid,
				"to": this.conver,
				"type": "message_chat",
				"version": "1.0",
				"body": {
					"content": (inputText),
					"mid": data.body.mid,
					"datetime": util.parseDate(data.body.datetime).getTime()
				}
			};
			var recentmsg = DDstorage.get("chat_recentmsg_" + this.uid + "_" + this.conver);
			if (recentmsg == null) {
				DDstorage.set("chat_recentmsg_" + this.uid + "_" + this.conver, [
					clientmsg
				]);
			} else {
				recentmsg.unshift(clientmsg);
				DDstorage.set("chat_recentmsg_" + this.uid + "_" + this.conver,
					recentmsg);
			}
		},
		putRecentMsg: function(msgId, msg, from, to, mid, datetime) {
			var clientmsg = {
					"id": msgId,
					"from": from,
					"to": to,
					"type": "message_chat",
					"version": "1.0",
					"body": {
						"content": msg,
						"mid": mid,
						"datetime": util.parseDate(datetime).getTime()
					}
				},
				recentmsg = DDstorage.get("chat_recentmsg_" + from + "_" + to);
			if (!recentmsg) {
				DDstorage.set("chat_recentmsg_" + from + "_" + to, [clientmsg]);
			} else {
				recentmsg.unshift(clientmsg);
				DDstorage.set("chat_recentmsg_" + from + "_" + to, recentmsg);
			}
		},
		showClientMsg: function(inputText, data) {
			var $textc = chatAjax.buildClientContent();
			var type = inputText;
			try {
				if ($.fn.jdExpression.replaceName((inputText)) != inputText) {
					type = "[表情]";
				}
				if ($(inputText).find(".message-img").length > 0) {
					type = "[图片]";
				} else if ($(inputText).attr("rel") == "send-file") {
					type = "[文件]";
				}

			} catch (ee) {}
			var lastdatetime = $(".msg-wrap .msg:last").attr("time");
			if (typeof lastdatetime != "undefined") {
				//TODO 可能会存在客户端时间不准的问题
				if (Math.abs(+lastdatetime - (+new Date().getTime())) - 120000 > 0) {
					$textt = chatAjax.buildTimeContent();
					$textt.find("span").text(util.formatDate(new Date(), "HH:mm"));
					$textt.appendTo(".msg-wrap");
				}
			}
			var s = util.filterMsg((inputText), true, true).replace(/\n/g, "<br />");
			if (s == "#A_振动") {
				s = "您发送了一个震屏消息";
				type = "[震屏]";
			}
			$textc.find(".msg-cont").html(s);
			$textc.attr("time", new Date().getTime());
			$textc.attr("mid", "ms");
			$textc.attr("msgid", chatAjax.msgId);
			var user = DDstorage.get(chatAjax.uid);
			if (!user) {
				user = {};
				user.uid = chatAjax.uid;
				user.realname = chatAjax.uid;
				user.avatar = "/static/img/default-avatar.png";
			}
			$textc.find(".msg-avatar").find("p").html(user.NickName || user.Name ||
				this.uid);
			$textc.find(".msg-avatar").find("img").attr("src", user.avatar ||
				"/static/img/default-avatar.png").attr("data-uid", user.uid);
			$textc.appendTo(".msg-wrap");

			var isfind = false;
			$("#jd-recent-contacts").find(".rc-wrap").find("li").each(function() {
				if ($(this).attr("conver") == chatAjax.conver) {
					isfind = true;
					$('#jd-recent-contacts .rc-wrap').prepend($(this));
					if ($("#jd-recent-contacts").is(":visible")) {
						$(this).click();
					}
					$(this).find(".rc-msg").html(util.filterMsg(type, true, false));
					$(this).find(".r").text(util.formatDate(new Date(), "HH:mm:ss"));
				}
			});
			if (!isfind) {
				$textl = chatAjax.buildLeftContent();
				var dom = $(".panel-view");
				$textl.attr("kind", dom.attr("kind"));
				$textl.attr("conver", dom.attr("conver"));
				if (dom.attr("kind") == "customer") {
					var userinfo = DDstorage.get(dom.attr("conver"));
					if (!userinfo) {
						userinfo = {};
						userinfo.uid = dom.attr("conver");
						userinfo.realname = dom.attr("conver");
						userinfo.avatar = "/static/img/default-avatar.png";
					}
					$textl.find(".nickname").text(userinfo.realname);
					$textl.find(".l").find("img").attr("src", userinfo.avatar);
					get_contact_status(this.conver, function(data) {
						$textl.find(".nickname span:eq(1)").addClass(get_status_class(data.body
							.presence));
						if (data.body.presence == "off") {
							$.grayscale($textl.find(".l img"));
						}
					}, function(data) {
						//						console.log(data);
					});
				} else {
					if (dom.attr("kind") == "temp_group") {
						$textl.find(".l").find("img").attr("src", "./img/mainchat-avatar.png");
					} else if (dom.attr("kind") == "discussion_group") {
						$textl.find(".l").find("img").attr("src", "./img/team-avatar.png");
					}

					$textl.find(".nickname").text(DDstorage.get(this.conver + "info").name);
				}
				$textl.attr("id", "recent-contact-" + this.conver);

				$textl.find(".rc-msg").html(type);
				$textl.find(".r").text(util.formatDate(new Date(), "HH:mm:ss"));
				$('#jd-recent-contacts .rc-wrap').prepend($textl);
				if ($("#jd-recent-contacts").is(":visible")) {
					util.recentContactDom(this.conver).click();
				}

			}

			/*var poll = require(["poll"]);
			poll.bindMsgEvent(1);
			*/

		},
		buildClientContent: function() {
			var cContent = [
				'<div class="msg msg-self" time="" mid=""><div class="msg-avatar"> <img alt="" src="/static/img/img-avatar.png"><p></p></div><div class="msg-cont"></div> </div>'
			];
			return $(cContent.join(""));
		},
		buildLeftContent: function() {
			var lContent = [
				'<li kind="" id="" conver="" class="rc-item"><div class="l"><img alt="" src="/static/img/img-avatar.png"><span class="i ui-hide"></span></div><div class="m">' +
				'<div class="nickname"><span class="i ui-hide"></span><i class="offline-text"></i></div><div class="rc-msg wto"></div></div><div class="r"></div></li>'
			];
			return $(lContent.join(""));
		},
		buildTimeContent: function() {
			var tContent = ['<div class="time-stamp"><span></span></div>'];
			return $(tContent.join(""));
		},

		afterSendMsg: function(inputText, data) {
			if (data && data.Code == 0) {
				$(".msg-self[mid='ms']").eq(0).attr("mid", data.body.mid);
				chatAjax.setRecentMsg(inputText, data);
			} else {
				//TODO 消息发送失败
				var ct = $(".msg-self[mid='ms']").not(".msg-failed").eq(0).addClass(
					"msg-failed");
				ct.append("<div class='msg-clear'></div>");
				ct.append(
					"<div class='msg-failed-tip'><span></span>消息发送失败，<a href='javascript:;'>点击重发</a></div>"
				);
				//调整提示信息与内容的边距
				var h = ct.find(".msg-cont").outerHeight() - ct.find(".msg-avatar").outerHeight() +
					10;
				if (h > 10) {
					h = 10;
				}
				ct.find(".msg-failed-tip a").unbind("click").bind("click", function() {
					chatAjax.resendMsg(ct.find(".msg-cont").html(), ct);
					$(this).parent().prev().remove();
					$(this).parent().remove();
					return false;
				});
			}
			$(".message-img").unbind("error").bind("error", function() {
				$(this).attr("src", $(this).attr("src"));
			});
			$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(
				".panel-msg .bd").height());
			$("#text_in").focus();
			$("a[download]").unbind("click").bind("click", function() {
				var href = $(this).attr("href"),
					download = $(this).attr("download");
				if (href.indexOf("http://storage.dearcode.net") == 0 || href.indexOf(
						"http://candy.dearcode.net") == 0) {
					download = encodeURI(encodeURI(download));
					href = "/file/download?url=" + encodeURIComponent(href) +
						"&fileName=" + download;
					$(this).attr("href", href)
				}
			});
		},

		resendMsg: function(text, target) {
			if (!text) {
				return;
			}
			text = text.replace(/<br(\s*\\?)>/gi, "\n");
			//处理图片的发送
			try {
				var jdom = $("<div></div>").html(text);
				jdom.find("img").each(function() {
					var src = $(this).attr("src");
					if (src.indexOf("http://") != 0) {
						var path = location.protocol + "//" + location.host;
						if (location.port) {
							path = path + ":" + location.port;
						}
						if (src.indexOf("/") == 0) {
							src = path + src;
						} else {
							var np = location.pathname;
							np = np.substr(0, np.lastIndexOf("/") + 1);
							if (src.indexOf("./") == 0) {
								src = src.substring(2);
							}
							src = path + np + src;
						}
					}
					var img = '<img class="message-img" src="' + src + '" />';
					$(this).replaceWith('<a rel="gallery" class="image-file" href="' +
						src + '">' + img + '</a>');
				});
				text = jdom.html();
			} catch (e) {

			}

			var oldMsgId = target.attr("msgid");
			if (this.kind == "customer") {
				chat_single(oldMsgId, this.conver, text, function(data) {
					if (data && data.body.mid) {
						target.attr("mid", data.body.mid).removeClass("msg-failed").removeAttr(
							"title");
						chatAjax.setRecentMsg(text, data);
						target.find(".msg-failed-tip").remove();
						target.find(".msg-clear").remove();
						target.unbind("click");
					}
				});
			} else if (this.kind == "discussion_group") {
				chat_group(oldMsgId, this.conver, text, function(data) {
					if (data && data.body.mid) {
						target.attr("mid", data.body.mid).removeClass("msg-failed").removeAttr(
							"title");
						target.unbind("click");
						target.find(".msg-failed-tip").remove();
						target.find(".msg-clear").remove();
						chatAjax.setRecentMsg(text, data);
					}
				});
			} else {
				chat_temp(oldMsgId, this.conver, text, function(data) {
					if (data && data.body.mid) {
						target.attr("mid", data.body.mid).removeClass("msg-failed").removeAttr(
							"title");
						target.unbind("click");
						target.find(".msg-failed-tip").remove();
						target.find(".msg-clear").remove();
						chatAjax.setRecentMsg(text, data);
					}
				});
			}
			$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(
				".panel-msg .bd").height());
		}

	};

	return chatAjax;
});
