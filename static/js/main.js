require.config({
	paths: {
		facebox: "./widget/facebox",
		expression: "./expression",
		jcrop: "./jquery.Jcrop.min",
		avatar: "./avatar",
		notification: "./notification",
		team_msg: "./team-msg",
		poll: "./push",
		visiting_card: "./visiting-card"
	},
	waitSeconds: 15
});

//初始化全局socket
/*var socket = io();
var COOKIE_NAME = 'sessionid';
socket.emit('main session', $.cookie(COOKIE_NAME), function(data) {
	result = checkResult(data);
	if (result != "成功") {
		window.location.href="/login";
		return;
	}
	alert(data);
});
*/
var contactStatusWorker = setInterval(function() {
	if (offline) {
		clearInterval(contactStatusWorker);
		return;
	}
	var params = [];
	$("#jd-recent-contacts").find(".rc-item[kind=customer]").each(function() {
		params.push($(this).attr("conver"));
	})
	$("#jd-contact").find(".item").each(function() {
		params.push($(this).attr("conver"));
	})

	var util = require("util");
	batch_contact_status(JSON.stringify(params), function(data) {
		if (!data || !data.body) {
			return;
		}
		var arr = data.body.presences;
		if (!arr || arr.length == 0) {
			return;
		}
		for (var i in arr) {
			var obj = arr[i];
			var recent = util.recentContactDom(obj.uid),
				presence = obj.status.presence;
			if (recent.length > 0) {
				var img = recent.find(".l img");
				var spresence = img.attr("status");
				if (spresence == presence) {
					if (presence == "off") {
						recent.find(".offline-text").html(get_offline_str(obj.status.datetime));
					} else if (presence == "away") {
						recent.find(".offline-text").html(get_away_str(obj.status.datetime));
					}
				} else {
					img.attr("status", presence);
					recent.find(".offline-text").text("");
					recent.find(".nickname span:eq(1)").attr("class", get_status_class(
						presence));
					if (spresence != "off" && presence == "off") {
						$.grayscale(img);
						recent.find(".offline-text").html(get_offline_str(obj.status.datetime));
					} else if (spresence == "off" && presence != "off") {
						$.graynormal(img);
					}
				}
			}
			var contact = util.contactDom(obj.uid);
			if (contact.length > 0) {
				var img = contact.find(".l img");
				var spresence = img.attr("status");
				if (spresence == presence) {
					if (presence == "off") {
						contact.find(".offline-text").html(get_offline_str(obj.status.datetime));
					} else if (presence == "away") {
						contact.find(".offline-text").html(get_away_str(obj.status.datetime));
					}
				} else { // 状态切换了
					img.attr("status", presence);
					presence == "off" ? $.grayscale(img) : $.graynormal(img);
					contact.find(".nickname span:eq(1)").attr("class", get_status_class(
						presence));
					var allcon = contact.parents(".mod:eq(0)").find(".hd").find(".online");
					contact.find(".offline-text").text("");
					if (spresence == "off" && presence != "off") { // 上线
						allcon.text(Number(allcon.text()) + 1);
						contact.parent().prepend(contact);
					} else if (spresence != "off" && presence == "off") { // 下线
						var num = Number(allcon.text()) - 1;
						allcon.text(num >= 0 ? num : 0);
						contact.parent().append(contact);
					}
				}
			}
		}
	});
}, 30000);

//定时获取用户信息并保存到本地
var userInfoWorker = setInterval(function() {
	if (offline) {
		clearInterval(userInfoWorker);
		return;
	}
	var uncachedUids = Timline.getUncachedUids();
	if (uncachedUids && uncachedUids.length > 0) {
		get_batch_user_info(uncachedUids, function(json) {
			for (var i in json) {
				try {
					var user = JSON.parse(json[i]);
					if (user.body.uid) {
						DDstorage.set(user.body.uid, user.body);
					}
				} catch (e) {
					//console.log(e);
				}
			}
		});
	}
}, 30000);

// 根据uid全局扫描，更新联系人状态函数 arr:要更新的{uid/presence}集合
var update_status = function(obj) {
	if (!obj) {
		return;
	}

	var util = require("util");
	var recent = util.recentContactDom(obj.from);
	if (recent.length > 0) {
		var img = recent.find(".l img").attr("status", obj.body.presence);
		obj.body.presence == "off" ? $.grayscale(img) : $.graynormal(img);
		recent.find(".nickname span:eq(1)").attr("class", get_status_class(obj.body.presence));
		recent.find(".offline-text").text("");
	}
	var contact = util.contactDom(obj.from);
	if (contact.length > 0) {
		var spresence = contact.find(".l img").attr("status");
		var img = contact.find(".l img").attr("status", obj.body.presence);
		obj.body.presence == "off" ? $.grayscale(img) : $.graynormal(img);
		contact.find(".nickname span:eq(1)").attr("class", get_status_class(obj.body
			.presence));
		var allcon = contact.parents(".mod:eq(0)").find(".hd").find(".online");
		contact.find(".offline-text").text("");
		if (obj.body.presence != "off" && spresence == "off") { // 上线
			allcon.text(contact.parent().find("img[status!='off']").length);
			contact.parent().prepend(contact);
		} else if (obj.body.presence == "off" && spresence != "off") { // 下线
			allcon.text(contact.parent().find("img[status!='off']").length);
			contact.parent().append(contact);
		}
	}
}

DDstorage.remove("groupdidload");
DDstorage.remove("contactlistload");
// 默认最先查询群列表（以便支持最近联系人群信息显示）
/*var get_group_re = function() {
	get_group_list(function(data) {
		var arr = data.body.groups;
		if (!arr || arr.length == 0) {
			DDstorage.set("groupdidload", true);
			$("#jd-group-items")
					.html('<div class="sret-null"><br/><br/><br/><p style="text-align:center;">您还未创建群</p>'
							+ '<a style="text-align:center;margin-left:91px;color:black" href="javascript:void(0)">+创建群</a></div>');
			$("#jd-group-items").find("a").on("click", function() {
						$("#create-team1").click();

					});
			return;
		}
        var util = require("util");
		arr.sort(function(a, b) {
					var inputDatea = util.parseDate(a.lastActiveTime || a.created);
					var inputDateb = util.parseDate(b.lastActiveTime || b.created);
					return inputDateb.getTime() - inputDatea.getTime();
				});
		var str = "", disnum = 0;
		for (var i in arr) {
			var obj = arr[i];
			if (obj.kind == "discussion_group") {
				disnum += 1;
                var gname = util.filterMsg(obj.name);
				str += '<div class="g-item" kind="' + obj.kind + '" conver="' + obj.gid
						+ '"><div class="l" id="msg-num' + obj.gid + '"><img src="./img/team-avatar.png"/>'
						+ '<span class="i ui-hide"></span></div>' + '<div class="m"><div class="g-name" title="'
						+ gname + '">' + gname + '</div></div>' + '<div class="r" id="group-num' + obj.gid
						+ '">0人</div></div>';
			}
			DDstorage.set(obj.gid + "info", obj);
		}
		DDstorage.set("groupdidload", true);
		$("#jd-group-items").html(str);
		if (disnum == 0) {
			$("#jd-group-items")
					.html('<div class="sret-null"><br/><br/><br/><p style="text-align:center;">您还未创建群</p>'
							+ '<a style="text-align:center;margin-left:91px;color:black" href="javascript:void(0)">+创建群</a></div>');
			$("#jd-group-items").find("a").on("click", function() {
						$("#create-team1").click();
					});
			return;
		}
		for (var i in arr) {
			get_group_user_list(arr[i].gid, function(data) {
                if(!data || !data.body  || !data.body.gid) {
                    return;
                }
				var gid = data.body.gid;
				$("#group-num" + gid).text(data.body.items.length + "人");
				});
		}
	});
}
*/

/*最近联系人
var get_recent_contact_re = function() {
	get_recent_contact(function(data) {
        var arr = data.body.contacts;
        preGetRecentContactSuccCallback(arr);
		$(".loading").removeClass("show");
		var arr = data.body.contacts, list = DDstorage.get("system_user_list");
		if (!((arr && arr.length > 0 )|| (list && list.length > 0))) {
            require(["poll"], function(pollReq) {
                pollReq.poll();
            });
			$(".loading").removeClass("show");
			return;
		}
		arr.sort(function(a, b) {
					var inputDatea = new Date(a.datetime.replace(/-/g, "/"));
					var inputDateb = new Date(b.datetime.replace(/-/g, "/"));
					return inputDateb.getTime() - inputDatea.getTime();
				});
		var str = "";
        if(list && list.length > 0) {
            for(var j=0; j<list.length; j++) {
                var key = list[j];
                var info = DDstorage.get(key);
                str += '<li class="rc-item" conver="'
                    + info.uid
                    + '" kind="system" id="recent-contact-'
                    + info.uid
                    + '"><div class="l"><img src="'+info.avatar+'" alt=""/>'
                    + '<span class="i ui-hide"></span></div><div class="m"><div class="nickname"><span>'
                    + info.realname
                    + '</span><i class="offline-text"></i><span class=""></span></div><div class="rc-msg wto"></div></div>'
                    + '<div class="r"></div></li>';
            }
        }
		if(arr) {
            for (var i in arr) {
                var obj = arr[i], time = null, now = new Date();
                var inputDate = new Date(obj.datetime.replace(/-/g, "/"));
                if (new Date(now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate()).getTime()
                    - inputDate.getTime() > 0) {
                    time = obj.datetime.substring(5, 10);
                } else {
                    time = obj.datetime.substring(10, 19);
                }
                if(time.indexOf("NaN") >= 0) {
                    time = "";
                }
                str += '<li class="rc-item" conver="'
                    + obj.id
                    + '" kind="'
                    + (obj.kind == "group" ? obj.groupKind : obj.kind)
                    + '" id="recent-contact-'
                    + obj.id
                    + '"><div class="l"><img src="./img/img-avatar.png" alt=""/>'
                    + '<span class="i ui-hide"></span></div><div class="m"><div class="nickname"><span>'
                    + obj.id
                    + '</span><i class="offline-text"></i><span class=""></span></div><div class="rc-msg wto"></div></div>'
                    + '<div class="r">' + time + '</div></li>';
            }
        }
		$("#jd-recent-contacts").find(".rc-wrap").html(str);
        if(!arr) {
            require(["poll"], function(pollReq) {
                pollReq.poll();
            });
            return;
        }
        var util = require("util");
		for (var i in arr) {
			var user = arr[i];
			if (user.kind == "customer") {
				// 用户状态
				var uid = user.id;
				get_contact_status(user.id, function(data) {
							var dom = util.recentContactDom(data.from);
							dom.find(".nickname span").eq(1).addClass(get_status_class(data.body.presence));
							var img = dom.find(".l img").attr("status", data.body.presence);
							if (data.body.presence == "off") {
								$.grayscale(img);
								dom.find(".offline-text").html(get_offline_str(data.body.datetime))
							}
							if (data.body.presence == "away") {
								dom.find(".offline-text").html(get_away_str(data.body.datetime))
							}
						}, function(data) {

						})
				// 用户信息
				get_user_info(user.id, function(data) {
							var userinfo = data.body;
							if (!userinfo || !userinfo.uid)
								return;
							var dom = util.recentContactDom(userinfo.uid);
							dom.find(".nickname span:eq(0)").attr("title", userinfo.realname).text(userinfo.realname);
							if (userinfo.avatar) {// 如果有头像
								dom.find(".l img").attr("src", userinfo.avatar).on("error", function(){
									$(this).attr("src", "./img/default-avatar.png");
								});
							}
							DDstorage.set(userinfo.uid, userinfo);
						});
			} else if (user.kind == "group") {
				var group = DDstorage.get(user.id + "info");
				if (group) {
					var dom = util.recentContactDom(user.id);
                    var gname = util.filterMsg(group.name);
					dom.find(".nickname").attr("title", gname).text(group.name);
					dom.find(".l img").attr(
							"src",
							(user.groupKind == "discussion_group"
									? "./img/team-avatar.png"
									: "./img/mainchat-avatar.png"));
				}
			}
			var unreadmsg = DDstorage.get("chat_unreadmsg_" + cookie("uid") + "_" + user.id);
			if (unreadmsg != null) {
				var dom = util.recentContactDom(user.id);
				dom.find(".l").find(".i").text(unreadmsg.length).removeClass("ui-hide");
			}
		}
		require(["poll"], function(pollReq) {
					pollReq.poll();
		});
	}, function(data) {
		$(".loading").removeClass("show");
	});
}
*/

//好友列表
var get_contact_list_re = function() {
	get_contact_list(function(data) {
		var count = data.Count;
		if (!count || count == 0) {
			DDstorage.set("contactlistload", true);
			$("#jd-contact").html('<div class="sret-null"><span>没有任何联系人</span>' +
				'<p>你可以搜索添加联系人</p></div>');
			return;
		}

		var gstr = "",
			users = data.Users;
		var gname = "好友列表";
		var gid = 1;
		var gname = require("util").filterMsg(gname);
		gstr += '<div class="mod" name="' + gname + '" type="' + gid +
			'" labelId="' + gid +
			'"><div class="hd"><div class="l"><span class="i"></span><span>' + gname +
			'</span></div>' + '<div class="r"><span class="online">0</span>/' +
			'<span class="allcontacts">0</span></div>' + '</div>' +
			'<div class="bd ui-hide"><ul class="wrap" id="contactmod-' + gid + '">' +
			'</ul>' + '</div>' + '</div>';

		var wrap = $("#jd-contact .mod-wrap").html(gstr);
		var cy = wrap.find(".mod[labelId=" + gid + "]").eq(0);
		cy.find(".hd").addClass("selected").next(".bd").removeClass("ui-hide");
		wrap.prepend(cy);

		if (!users || users.length == 0) {
			DDstorage.set("contactlistload", true);
			return;
		}

		for (var i in users) {
			var user = users[i];
			var str = ' <li class="item" conver="' + user.ID + '" id="contact-' +
				user.ID + '" kind="customer">' + '<div class="l">' +
				'<img src="/static/img/img-avatar.png" alt=""/>' + '</div>' +
				'<div class="m">' + '<div class="nickname"><span>' + user.Name +
				'</span><i class="offline-text"></i><span class=""></span></div>' +
				'<div class="rc-msg wto"></div>' + '</div><div class="r">' +
				'<span class="i i-ctt" data="' + user.ID + '" labelId="' + user.ID +
				'"></span>' + '</div></li>'
			var mod = $("#contactmod-" + gid);
			mod.append(str);
		}
		$(".l img").on("error", function() {
			$(this).attr("src", "/static/img/default-avatar.png");
		})
		$("#jd-contact").find(".mod").each(function() {
			var items = $(this).find(".item");
			$(this).find(".hd .allcontacts").text(items.length);
		});

		var util = require("util");
		for (var i in users) {
			var user = users[i],
				uid = user.ID;
			// 用户状态
			get_contact_status(user.ID, function(data) {
				var contact = util.contactDom(user.ID);
				contact.find(".nickname span:eq(1)").addClass(get_status_class(data.Status));
				if (data.Status != "off") {
					var allcon = contact.parents(".mod:eq(0)").find(".hd").find(".online");
					allcon.text(Number(allcon.text()) + 1);
					if (data.Status == "away") {
						contact.find(".offline-text").html(get_away_str(data.Datetime))
					}
				} else {
					contact.parent().append(contact);
					var img = contact.find(".l img").attr("status", data.Status);
					if (data.Status == "off") {
						contact.find(".offline-text").text(get_offline_str(data.Datetime))
					}
					$.grayscale(img);
				}
			}, function(data) {
				//console.log(data)
			})
			get_user_info(user.ID, function(data) {
				var userinfo = data;
				if (!userinfo || !userinfo.ID) {
					return;
				}
				var dom = util.contactDom(userinfo.ID);
				dom.find(".nickname span:eq(0)").attr("title", userinfo.Name).text(
					userinfo.NickName || userinfo.Name);
				dom.find(".wto").attr("title", userinfo.Signature).text(userinfo.Signature);
				if (userinfo.Avatar && userinfo.Avatar != "") { // 如果有头像
					dom.find(".l img").attr("src", userinfo.Avatar);
				}
				DDstorage.set(userinfo.ID, userinfo);
			});
		}
		DDstorage.set("contactlistload", true);
	}, function(data) {
		$(".loading").removeClass("show");
	});
};

var preGetRecentContactSuccCallback = function(arr) {
	var list = DDstorage.get("system_user_list");
	if (!((arr && arr.length > 0) || (list && list.length > 0))) {
		require(["poll"], function(pollReq) {
			pollReq.poll();
		});
		$(".loading").removeClass("show");
		return;
	}
	arr.sort(function(a, b) {
		var inputDatea = new Date(a.datetime.replace(/-/g, "/"));
		var inputDateb = new Date(b.datetime.replace(/-/g, "/"));
		return inputDateb.getTime() - inputDatea.getTime();
	});

	var str = "";
	if (list && list.length > 0) {
		for (var j = 0; j < list.length; j++) {
			var key = list[j];
			var info = DDstorage.get(key);
			str += '<li class="rc-item" conver="' + info.uid +
				'" kind="system" id="recent-contact-' + info.uid +
				'"><div class="l"><img src="' + info.avatar + '" alt=""/>' +
				'<span class="i ui-hide"></span></div><div class="m"><div class="nickname"><span>' +
				info.realname +
				'</span><i class="offline-text"></i><span class=""></span></div><div class="rc-msg wto"></div></div>' +
				'<div class="r"></div></li>';
		}
	}

	if (arr) {
		for (var i in arr) {
			var obj = arr[i],
				time = null,
				now = new Date();
			var inputDate = new Date(obj.datetime.replace(/-/g, "/"));
			if (new Date(now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate())
				.getTime() - inputDate.getTime() > 0) {
				time = obj.datetime.substring(5, 10);
			} else {
				time = obj.datetime.substring(10, 19);
			}
			if (time.indexOf("NaN") >= 0) {
				time = "";
			}
			var _kind = obj.kind;
			var _avatar = Timline.defaultAvatars.customer;
			if (_kind == "group") {
				_kind = obj.groupKind;
				_avatar = Timline.defaultAvatars[_kind];
			} else {
				Timline.pushUids(obj.id);
			}
			str += '<li class="rc-item" conver="' + obj.id + '" kind="' + _kind +
				'" id="recent-contact-' + obj.id + '"><div class="l"><img src="' + _avatar +
				'" alt=""/>' +
				'<span class="i ui-hide"></span></div><div class="m"><div class="nickname"><span>' +
				obj.id +
				'</span><i class="offline-text"></i><span class=""></span></div><div class="rc-msg wto"></div></div>' +
				'<div class="r">' + time + '</div></li>';
		}
	}
	$("#jd-recent-contacts").find(".rc-wrap").html(str);
	$(".loading").removeClass("show");
};

require(['widget/Tab'], function(Tab) {
	// 主面板选择切换
	window.$$Tab = new Tab({
		tabHdSelectCLS: 'selected',
		hideBdCLS: 'ui-hide',
		tabHds: $('#j-tabPanelMainHd li'),
		tabBds: $('#j-tabPanelMainBd > div'),
		initDefault: true,
		selectedFunc: function(index) {
			$("#panel-search-re").addClass("ui-hide").empty();
			$(".triangle-flag").hide();
			$("#panel-search").val("").parent().find(".i-erase").removeClass("show");
			$("#jd-contact,#jd-recent-contacts").find("li.selected").removeClass(
				"selected");
			$("#jd-group div.selected").removeClass("selected");
			this.timer && clearTimeout(this.timer);
			//最近会话
			if (index == 0) {
				if (this.loadRecent) {
					$(".loading").removeClass("show");
					return;
				}
				get_recent_contact(function(data) {
					var arr = data.body.contacts;
					preGetRecentContactSuccCallback(arr);
				});
				//get_group_re();
				$(".loading").addClass("show");
				$("#jd-recent-contacts").find(".sret-null").remove();
				// 检测分组信息是否加载完成
				var that = this,
					time = 0;
				clearInterval(that.timer);
				that.timer = setInterval(function() {
					time += 200;
					if (DDstorage.get("groupdidload")) {
						// 最近联系人列表
						get_recent_contact_re();
						clearTimeout(that.timer);
						that.loadRecent = true;
					} else if (time > 3000) {
						clearTimeout(that.timer);
						$(".loading").removeClass("show");
						$("#jd-recent-contacts").html(
							'<div class="sret-null"><span>没有数据</span>' + '<p>没有查询到数据哦，' +
							'<span class="refresh" style="color:blue;text-decoration:underline;cursor:pointer">' +
							'刷新一下</span></p></div>');
						$("#jd-recent-contacts").find(".refresh").on("click", function() {
							$('#recent-contacts').click();
						})
					}
				}, 200);
				// 好友列表
			} else if (index == 1) {
				if (this.loadContact) {
					$(".loading").removeClass("show");
					return;
				}
				var that = this;
				$(".loading").addClass("show");
				if ($("#jd-contact").find(".mod").length == 0) {
					var time = 0;
					get_contact_list_re();
					clearInterval(that.timer);
					that.timer = setInterval(function() {
						time += 200;
						if (DDstorage.get("contactlistload")) {
							$(".loading").removeClass("show");
							that.loadContact = true;
							clearTimeout(that.timer);
						} else if (time > 3000) {
							clearTimeout(that.timer);
							$(".loading").removeClass("show");
							$("#jd-contact").find(".mod-wrap").empty().html(
								'<div class="sret-null"><span>没有数据</span>' + '<p>没有查询到数据哦，' +
								'<span class="refresh" style="color:blue;text-decoration:underline;cursor:pointer">' +
								'刷新一下</span></p></div>');
							$("#jd-contact").find(".refresh").on("click", function() {
								$('#tabPanelMainHd-contacts').click();
							})
						}
					}, 200);
				} else {
					$(".loading").removeClass("show");
					this.loadContact = true;
				}
				//群组列表
			} else if (index == 2) {
				$(".loading").addClass("show");
				$(".loading").removeClass("show");
				if (this.loadGroup) {
					$(".loading").removeClass("show");
					return;
				}
				this.loadGroup = true;
				$(".loading").addClass("show");
				var that = this;
				$(".loading").removeClass("show");
			} else {
				console.log("...");
			}
		}
	});
});

$(".send").click(function() {
	require(["chat"], function(chat) {
		chat.send();
	});
});

$("#clearmonitor").click(function() {
	$(".msg-wrap").empty();
});

$("#text_in").keydown(function(e) {
	if (e.keyCode == 13 && !e.shiftKey) {
		require(["chat"], function(chat) {
			chat.send();
		});
		return false;
	}
});

$("#recent-contacts").click(function() {
	$(".i-rmsg-num").hide();
});

$(document.body).delegate('.msg-wrap .load-more', 'click', function() {
	var morecount = $("#chat_load_more").attr("count");
	if (morecount > 2) {
		$("#clearmonitor").removeClass("ui-hide");
	} else {
		$("#chat_load_more").attr("count", parseInt(morecount) + 1);
	}
	msgFixed.getScrollTop();
	require(["chat_window"], function(chat_window) {
		var t = $('.panel-msg .bd');
		chat_window.getHistoryMsg("loadmore");
		t.data('hasScrollToTopCounter', 0);
	});
});

var timerId;
$(window).bind('mousewheel', function(event) {
	if (timerId) {
		clearTimeout(timerId);
		timerId = null;
		return;
	}

	var target = $(event.target);
	var me = $('.panel-msg .bd');
	var key = 'hasScrollToTopCounter';
	timerId = setTimeout((function(me) {
		return function() {
			var scrollTop = me.scrollTop();
			me.data(key) === undefined && me.data(key, 0);
			if (scrollTop < 50) {
				me.data(key, me.data(key) + 1);
			}
			if (scrollTop > 150) {
				me.data(key) === 1 && me.data(key, me.data(key) - 1);
			}
			if (me.data(key) > 1) {
				if (target.hasClass("msg")) {
					$('.msg-wrap .load-more').click();
				}
			}
		}
	})(me), 20);
});

$(document.body).delegate('.panel-msg .title .i', 'click', function() {
	var uid = $(".panel-view").attr("conver");
	require(["visiting_card"], function(card) {
		card.show(uid);
	});
});

// 聊天页面随屏幕分辨率自适应
({
	initHeight: function() {
		var h = this.getPanelMainHeight();
		var MIN_HEIGHT = 550;
		// 如果计算得到的panelMain高度少于600，按最小高度600进行高度初始化，否则按计算值进行初始化
		h <= MIN_HEIGHT ? this.setHeights(MIN_HEIGHT) : this.setHeights(h);
	},
	getPanelMainHeight: function() {
		return $(window).height() - 80;
	},
	setHeights: function(pmainH) {
		/**
		 * panelMain 左边面板 panelMainBd 左边面板主体 panelView 右边面板 bdList
		 * 右边面板所包含的聊天窗口，群窗口，群共享窗口 panels-wrap 左边面板，其作为聊天窗口，群窗口，群共享窗口的父元素
		 *
		 * 左边面板高度可以当成聊天面板基数高度，其它面板高度值都是根据此高度计算得来，计算公式如下：
		 *
		 * @pmainH {number} 聊天面板的最小高度基数; panelMain高度 =
		 * @pmainH ; panelMainBd高度 =
		 * @pmainH - 167 panelView高度 =
		 * @pmainH - 20 bdList高度 =
		 * @pmainH - 94 panels-wrap 高度
		 * @pmainH - 20 contactModWrap 高度
		 * @pmainH - 210
		 */

		var panelMain = $('.panel-main'),
			panelMainBd = $('.panel-main > .bd'),
			panelView = $('.panel-view'),
			panelsWrap = $('.panels-wrap'),
			contactModWrap = $('#jd-contact .mod-wrap'),
			bdList = $('.panel-msg .bd,.panel-group .bd, .panel-g-share .bd');
		panelMain.height(pmainH);
		panelMainBd.height(pmainH - 167);
		panelView.height(pmainH - 20);
		contactModWrap.height(pmainH - 210);
		panelsWrap.height(pmainH - 20);
		bdList.each(function() {
			$(this).height(pmainH - 94);
		});
	},
	init: function() {
		this.bindEvt();
	},
	bindEvt: function() {
		var me = this;
		$(window).resize(function() {
			me.initHeight();
		}).trigger('resize');
	}
}).init();

/*
require(['facebox', 'team', 'screenshot', 'jcrop', 'avatar', 'notification']);
// 表情
require(["expression"], function() {
			$("#expression").jdExpression({
						imgClick : function(event) {
							$("#expression").hide();
							var text_in = $("#text_in").get(0);
							if (document.selection) {
								text_in.focus();
								document.selection.createRange().text = $("#text_in").val()
										+ this.getName(event.target.id);
							} else {
								if (typeof text_in.selectionStart == "number") {
									var c = text_in.selectionStart, d = text_in.value, a = this
											.getName(event.target.id);
									text_in.value = d.substr(0, text_in.selectionStart) + a
											+ d.substr(text_in.selectionEnd);
									text_in.selectionStart = text_in.selectionEnd = c + a.length;
									text_in.focus();
								} else {
									text_in.value += this.getName(event.target.id);
								}
							}
						}
					});
			$("body").click(function(e) {
						var target = $(e.target);
						if (target.attr("id") == "expressionBtn" || target.parent().attr("id") == "expressionBtn") {
							return;
						}
						$("#expression").hide();
					});
			$("#expressionBtn").click(function() {
						$("#expression").toggle();
					});
		});
// 上传文件
require(["chat", "util", "chat_window", "share", "upload"], function(chat, util, chatwin, share) {
	$("#text_in").upload({
				onload : onload,
				beforeUpload : beforeUpload,
                onerror:uploadError
			});
	$("#sendFile").upload({
				onload : onload,
				beforeUpload : beforeUpload,
                onerror:uploadError
			});

	$(".panel-msg").upload({
		onload:onload,
		beforeUpload : beforeUpload,
        onerror:uploadError
	});

	// 记录文件接收者，接收者类型
	var to, kind;
	function beforeUpload(file, xhr) {
		var msg = "<img src='./img/loading.gif' class='sendfile'>";
		// chat.send(msg);
		to = chatwin.conver;
		kind = chatwin.kind;
		var c = chat.buildClientContent();
		c.find(".msg-cont").html(msg);
		c.attr("time", new Date().getTime());
		c.find(".msg-avatar").find("p").html(DDstorage.get(util.cookie("uid")).realname);
		if (DDstorage.get(util.cookie("uid")).avatar) {
			c.find(".msg-avatar").children("img").attr("src", DDstorage.get(util.cookie("uid")).avatar);
		}
		c.appendTo(".msg-wrap");
		$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(".panel-msg .bd").height());
	}

    function uploadError(){
       console.log("upload error");
        if(to == chatwin.conver) {
            util.alert("提示", "文件上传失败，请稍后重试！", function(){
                $(".sendfile").eq(0).parents(".msg-self").remove();
            });
        }
    }

	function onload(file, xhr) {
		try {
			var json = "";
            if(xhr.responseText){
                json = JSON.parse(xhr.responseText);
            } else if(xhr.url){
                json = xhr;
            }

			if (json.url) {
				var msg = "";
				if (json.type == "image") {
					var img = '<img class="message-img" src="' + json.url + '" />';
					msg = '<a rel="gallery" title=""href="' + json.url + '">' + img + '</a>';
					// chat.send(msg);
					$(".rc-wrap  .sendfile").parent().html("图片消息");
				} else if (json.type == "file") {
					msg = '<a download="'+file.name+'" href="'
							+ json.url
							+ '" target="_blank" rel="send-file"><img src="./img/file2.png" style="vertical-align:middle;margin-right:10px;"/> '
							+ (file.name) + '</a>';
					$(".rc-wrap  .sendfile").parent().html("文件消息");
				}

				if (json.type == "file") {
					share.share(json.url, file.name, file.type, file.size, to, kind, function(json) {
								if (json && json.body && json.body.code == 199) {
									util.alert("提示", "共享文件失败");
								} else {
									if (to == chatwin.conver) {
										$(".msg-wrap .sendfile").eq(0).replaceWith(msg);
										chat.putRecentMsg(json.id, msg, util.cookie("uid"), to, json.body.mid,
												json.body.datetime);
									} else {
										// chat.setRecentMsg(msg);
										chat.putRecentMsg(json.id, msg, util.cookie("uid"), to, json.body.mid,
												json.body.datetime);
									}
                                    $("a[download]").unbind("click").bind("click", function(){
                                        var href = $(this).attr("href"), download = $(this).attr("download");
                                        if(href.indexOf("http://storage.dearcode.net") == 0 || href.indexOf("http://candy.dearcode.net") == 0) {
                                            download = encodeURI(encodeURI(download));
                                            href = "/file/download?url="+encodeURIComponent(href)+"&fileName="+download;
                                            $(this).attr("href",href)
                                        }
                                    });

								}
							});
				} else {
					//
					$(".msg-wrap .sendfile").parent().parent().remove();
					// 如果窗口没有发生切换
					if (chatwin.conver == to) {
						chat.send(msg);
					} else {
						// 切换了发送消息的窗口
						if (kind == "customer") {
							chat_single(util.uuid(), to, msg, function(json) {
										// TODO 将消息写入最近聊天中
										chat.putRecentMsg(json.id, msg, util.cookie("uid"), to, json.body.mid,
												json.body.datetime);
									});
						} else if (kind == "temp_group") {
							chat_temp(util.uuid(), to, msg, function(json) {
										chat.putRecentMsg(json.id, msg, util.cookie("uid"), to, json.body.mid,
												json.body.datetime);
									});
						} else if (kind == "discussion_group") {
							chat_group(util.uuid(), to, msg, function(json) {
										chat.putRecentMsg(json.id, msg, util.cookie("uid"), to, json.body.mid,
												json.body.datetime);
									});
						}
					}
					$(".panel-msg .bd").scrollTop($(".msg-wrap").outerHeight() - $(".panel-msg .bd").height());
				}

			}  else{
                this.onerror();
            }
		} catch (e) {
            console.log(e.stack || e.message || e);
            this.onerror();
		}
	}
});
*/

// 刷新页面的提示
(function() {
	window.onbeforeunload = function() {
		var sendMail = $(".sendingMail");
		var shot = $(".screenshot");
		if (sendMail.length > 0 || shot.length > 0) {
			setTimeout(function() {
				$(".screenshot").each(function() {
					$(this).removeClass("screenshot");
				});
				$(".sendingMail").each(function() {
					$(this).removeClass("sendingMail");
				});
			}, 1000);
		} else {
			return "您确定离开页面吗？离开后数据将不会保存";
		}
	};

	function unload() {
		$.ajax({
			url: "/presence.action",
			type: "post",
			dataType: "json",
			async: false,
			data: {
				action: "off"
			}
		});
	}

	if (window.addEventListener) {
		window.addEventListener("unload", unload, false);
	} else if (window.attachEvent) {
		window.attachEvent("onunload", unload);
	} else {
		window.onunload = unload
	}

	//自适应输入框高度
	var copy = $("#text_in").clone();
	copy.attr("id", "text_in_copy");
	copy.css({
		position: "absolute",
		visibility: "hidden",
		left: "-1000px",
		paddingBottom: "0px",
		paddingTop: "0px"
	});
	$("#text_in").parent().append(copy);
	copy.height($("#text_in").height());
	var h1 = $("#text_in").height();
	var h2 = $("#text_in").parent().height();
	var h3 = $("#text_in").parent().parent().height();
	var h4 = $("#text_in_copy").val("").get(0).scrollHeight;
	if (h1 == 0) {
		h1 = parseInt($("#text_in").css("lineHeight"));
	}

	$("#text_in").bind("keyup keydown change click blur focus", function(event) {
		copy.val($(this).val());
		if ($(this).val() == "") {
			h4 = $("#text_in_copy").get(0).scrollHeight;
		}
		var scroll = copy.get(0).scrollHeight - h4;
		if (scroll > 40) {
			scroll = 40;
		}
		$(this).height(h1 + scroll);
		$("#text_in").parent().height(h2 + scroll);
		$("#text_in").parent().parent().height(h3 + scroll);
	});

	//粘贴事件必须延迟一些，否则获取不到数据
	$("#text_in").bind("paste", function() {
		setTimeout(function() {
			$("#text_in").click();
		}, 50);
	});

	$(".send").click(function() {
		$("#text_in").height(h1);
		$("#text_in").parent().height(h2);
		$("#text_in").parent().parent().height(h3);
	});

	$(".msg").delegate(".message-img", "error", function() {
		$(this).attr("src", $(this).attr("src"))
	});

	//搜索框添加粘贴事件处理
	$("#panel-search").bind("paste", function() {
		var _this = this;
		setTimeout(function() {
			$(_this).keydown();
		}, 0);
	});
})();

//头像加载失败
reloadDefaultAvatar = function(that) {
	if (that && $(that).is("img")) {
		$(that).attr("src", Timline.defaultAvatars.customer);
	}
};

var Timline = (function() {
	var _uniqueUids = [],
		_uniqueGids = [],
		_notifications = {},
		_defaultAvatars = {
			customer: "/static/img/img-avatar.png",
			discussion_group: "/static/img/team-avatar.png",
			temp_group: "/static/img/mainchat-avatar.png"
		};

	var _getUids = function() {
		return _uniqueUids;
	};

	var _getGids = function() {
		return _uniqueGids;
	};

	var _pushUids = function(uid) {
		if (_isExist(uid)) {
			return -1;
		} else if (typeof uid == "string" && !$.isNumeric(uid)) {
			return _uniqueUids.push(uid);
		} else {
			return -2;
		}
	};

	var _isExist = function(uid) {
		if ($.isNumeric(uid)) {
			return false;
		}
		if (typeof uid != "string") {
			return false;
		}
		for (var i in _uniqueUids) {
			if (uid.toLowerCase() == _uniqueUids[i]) {
				return true;
			}
		}
		return false;
	};

	var _getUncachedUids = function() {
		var _uncachedUids = [];
		for (var i in _uniqueUids) {
			var uid = _uniqueUids[i];
			var uidInfo = DDstorage.get(uid);
			if (uidInfo) {
				continue;
			}
			_uncachedUids.push(uid);
		}
		return _uncachedUids;
	};

	var _getNotification = function(key) {
		if (_notifications[key]) {
			return _notifications[key];
		}
	};

	var _putNotification = function(key, value) {
		if (key) {
			_notifications[key] = value;
		} else {
			console.log("the key is undefined");
		}
	};

	var _clearAllNotifications = function() {
		_notifications = {};
	};

	return {
		defaultAvatars: _defaultAvatars,
		uidIsExist: _isExist,
		pushUids: _pushUids,
		getUids: _getUids,
		getGids: _getGids,
		getUncachedUids: _getUncachedUids,
		getNotification: _getNotification,
		putNotification: _putNotification,
		clearAllNotifications: _clearAllNotifications
	};
})();
