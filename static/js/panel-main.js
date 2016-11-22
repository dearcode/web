/**
 *
 **/
(function() {
	// 个人信息
	get_self_info(function(data) {
		require(["util"], function(util) {
			if (data.Code && data.Code != 0) {
				util.alert("提示", data.Msg);
				util.cookie("aid", "");
				util.cookie("uid", "");
				util.cookie("sessionid", "");
				location.href = "/login";
			}
			var userele = $("#panel-user-info");
			userele.find(".user-nick strong").text(data.NickName || data.Name);
			if (!!data.Signature) {
				if (data.Signature == undefined || data.Signature == "") {
					$("#panel-user-signature").text("这家伙很懒，什么都没有留下");
				} else {
					$("#panel-user-signature").text(data.Signature);
				}
			} else {
				$("#panel-user-signature").text("编辑个性签名！");
			}

			uid = util.cookie("uid"),
				DDstorage.set(uid, data);
			util.cookie("avatar", data.Avatar, {
				expires: 30,
				path: "/"
			});
		});
	}, function(data) {
		//console.log(data);
	});

	// 联系人
	$("#jd-contact").on("click", ".hd", function() {
		$(this).toggleClass("selected");
		$(this).next().toggleClass("ui-hide");
		var me = $("#jd-contact").find("li.selected");
		if (me.length > 0) {
			if (me.is(":hidden")) {
				$(".triangle-flag").hide();
			} else if (!$(".panel-view").is(":hidden")) {
				var offset = me.offset();
				offset.left = offset.left + me.width() + 30;
				offset.top = offset.top + 22;
				$(".triangle-flag").show().css(offset);
			}
		}
	});

	// 各tab栏行点击事件
	$("#j-tabPanelMainBd").on("click", ".item,.rc-item,.g-item", function(e) {
		var is_selected = $(this).hasClass("selected");
		if (!is_selected) {
			$("#jd-recent-contacts,#jd-contact,#panel-search-re").find("li.selected")
				.removeClass("selected");
			$("#jd-group-items").find("div.selected").removeClass("selected");
			$(this).addClass("selected");
		}
		if (e.target.className == "i i-ctt") {
			return;
		}
		is_selected && $("#team-cancel-btn").click();
		var me = $(this);
		var offset = me.offset();
		var searchOffset = $("#panel-search").offset();
		if (searchOffset.top < offset.top) {
			offset.left = offset.left + me.width() + 30;
			offset.top = offset.top + 22;
			if ($(".triangle-flag").is(":hidden")) {
				$(".triangle-flag").show().css(offset);
			} else {
				$(".triangle-flag").animate(offset);
			}
		} else {
			$(".triangle-flag").hide();
		}

		require(["chat_window"], function(msgWindow) {
			me.find(".l").find(".i").text("").addClass("ui-hide");
			var conver = me.attr("conver");
			if (conver != $(".panel-view").attr("conver")) {
				msgWindow.create(conver, me.attr('kind'));
			}
		});
	});

	// 搜索结果
	$("#panel-search-re").on("click", ".rc-item", function(e) {
		var is_selected = $(this).hasClass("selected");
		if (!is_selected) {
			$("#jd-recent-contacts,#jd-contact,#panel-search-re").find("li.selected")
				.removeClass("selected");
			$("#jd-group-items").find("div.selected").removeClass("selected");
			$(this).addClass("selected");
		}
		if (e.target.className == "i opr") {
			return;
		}
		is_selected && $("#team-cancel-btn").click();
		var me = $(this);

		var offset = me.offset();
		offset.left = offset.left + me.width() + 38;
		offset.top = offset.top + 23;
		if ($(".triangle-flag").is(":hidden")) {
			$(".triangle-flag").show().css(offset);
		} else {
			$(".triangle-flag").animate(offset);
		}
		require(["chat_window"], function(msgWindow) {
			me.find(".l").find(".i").text("").addClass("ui-hide");
			if (me.attr("conver") != $(".panel-view").attr("conver")) {
				msgWindow.create(me.attr('conver'), me.attr('kind'));
			}
		})
	});

	// 搜索框事件
	var search_request = null;
	var erase = $("#panel-search ~ .i-erase");
	erase.on("click", function() {
		$("#panel-search").val("");
		$("#j-tabPanelMainHd").find("li.selected").click();
		search_request.abort();
	});

	$("#panel-search").on("keydown", function(e) {
		if (e.keyCode == "8" && (this.value.length == 1 || this.value == "")) {
			erase.trigger("click");
			return;
		}
		var that = this;
		$(that).one("keyup", function() {
			http_search(that);
		});
	});

	var http_search = function(that) {
		$(".triangle-flag").hide();
		var searchText = $(that).val();
		if (!searchText) {
			return;
		}
		erase.addClass("show")
		if (search_request) {
			search_request.abort();
		}

		search_contact_list(searchText, doSearchResult, function(data) {
			//console.log(data);
		});
	}


	function doSearchResult(data) {
		var util = require("util");
		var searchele = $("#panel-search-re");
		searchele.removeClass("ui-hide");
		var rel = $("#j-tabPanelMainHd").find("li.selected").attr("rel");
		$("#jd-" + rel).addClass("ui-hide");
		var arr = []
		if (data && data.Count > 0) {
			arr = data.Users;
		}

		if (arr.length == 0) {
			searchele.html('<div class="sret-null"><span>搜索结果：</span><p>抱歉，没有找到相关搜索结果</p></div>');
			return;
		}

		var str = "";
		for (var i in arr) {
			var obj = arr[i];
			var status = "";
			var realname = obj.NickName || obj.Name;
			var position = "web";

			str += ' <ul class="rc-wrap"><li class="rc-item" id="search-re-' + obj.ID +
				'" conver="' + obj.ID + '" kind="customer"><div class="l">' +
				'<img src="/static/img/img-avatar.png" alt=""/>' + '</div><div class="m">' +
				'<div class="nickname"><span title="' + realname + '">' + realname +
				'</span><i class="offline-text">' + status +
				'</i><span class=""></span></div><div class="rc-msg wto"><span></span></div>' +
				'</div><div class="r" uid="' + obj.ID + '" realname="' + realname +
				'"><div><span class="i opr" rel="view" title="名片"></span></div>' +
				'<div><span class="i opr" rel="add" title="添加联系人"></span></div></div></li></ul>';
		}

		searchele.html(str);

		// 用户状态
		for (var i in arr) {
			var user = arr[i];
			var present = "chat";
			var dom = util.searchResDom(user.ID);
			dom.find(".nickname span:eq(1)").addClass(get_status_class(present));
			var img = dom.find(".l img").attr("status", present);
			if (user.Avatar) { // 如果有头像
				img.attr("src", user.Avatar);
			}
		}
	} // end doSearchResult

	// 搜索结果页添加好友、名片等
	$("#panel-search-re").on("click", ".opr", function() {
		var util = require("util");
		var datadom = $(this).parent().parent();
		var kind = datadom.parent("li").attr("kind");
		var fid = datadom.attr("uid");
		if ($(this).attr("rel") == "add") {
			if (util.contactDom(fid).length == 1) {
				util.alert("提示", datadom.attr("realname") + "已经在您的联系人列表中");
				return;
			}

			if (fid == cookie("uid")) {
				util.alert("提示", "不能添加自己到联系人列表");
				return;
			}
			var addContact = $("#addContact").clone();
			addContact.find(".pop-title").text("添加联系人");
			addContact.find(".btn-wrap").attr("data", fid);
			var str = "",
				mods = $("#jd-contact").find(".mod");
			if (mods.length == 0) {
				get_contact_list(function(data) {
					var users = data.Users;
					for (var i in users) {
						var u = users[i];
						if (fid == u.ID) {
							util.alert("提示", datadom.attr("realname") + "已经在您的联系人列表中");
							return;
						}
					}

					var gname = "常用联系人";
					str += '<li rel="g" class="exist-item ' + "selected" +
						'" labelId="' + 0 + '"><span class="i"></span>' + gname + '</li>';

					addContact.find(".exist-wrap").html(str);
					jQuery.facebox(addContact.show());
					addContact.find("li,a").on("click", function() {
						search_addcontact(this);
					});
				}, function(data) {
					//console.log(data)
				});
				return;
			}

			for (var i = 0; i < mods.length; i++) {
				str += '<li rel="g" class="exist-item ' + (i == 0 ? "selected" : "") +
					'" labelId="' + mods.eq(i).attr("labelId") +
					'"><span class="i"></span>' + mods.eq(i).attr("name") + '</li>';
			}
			addContact.find(".exist-wrap").html(str);
			jQuery.facebox(addContact.show());
			addContact.find("li,a").on("click", function() {
				search_addcontact(this);
			});
		} else {
			require(["visiting_card"], function(card) {
				card.show(datadom.attr("uid"));
			});
		}
	})

	function addGroup(gid, kind, code, name) {
		//判断是不是已经加入该群
		var param = {
			aid: cookie("aid"),
			from: cookie("uid"),
			type: "iq_group_get",
			version: "1.0",
			body: {
				gid: gid
			}
		};
		$.ajax({
			url: "/api.action",
			data: {
				webJson: JSON.stringify(param)
			},
			dataType: "json",
			type: "GET",
			success: function(json) {
				if (json.body.code == 126) {
					joinGroup(gid, code, kind, name);
				} else {
					require(["chat_window"], function(chatwin) {
						chatwin.create(gid, kind);
					});
				}
			},
			error: function() {
				require(["util"], function(util) {
					util.alert("提示", "网络连接失败，请稍后重试！");
				})
			}
		});

		function joinGroup(gid, code, kind, name) {
			if (code) {
				var util = require("util");
				var html =
					'<div><div>请输入加群验证码</div><div><input style="border: 1px solid #A3A1A1;width:240px;height:24px;" type="text" name="scode"></div></div>';
				util.confirm("加群", html, function(dom) {
					var input = dom.parent().parent().find("input").val();
					if (input == code) {
						sendRequest(gid, code, kind, name);
					} else {
						util.alert("提示", "您输入的验证码不正确！");
					}
				});
			} else {
				sendRequest(gid, "", kind, name);
			}
		}

		function sendRequest(gid, scode, kind, name) {
			var param = {
				type: "presence_group_in",
				aid: cookie("aid"),
				from: cookie("uid"),
				version: "1.0",
				body: {
					gid: gid,
					groupKind: kind,
					sCode: scode
				}
			};

			$.ajax({
				url: "api.action",
				type: "GET",
				dataType: "json",
				data: {
					webJson: JSON.stringify(param)
				},
				success: function(json) {
					if (json.body.code == 1) {
						require(["chat_window", "team"], function(chatwin, team) {
							chatwin.create(gid, kind);
							team.addRecentView(gid, kind, name);
							param.type = "iq_group_roster_get";
							param.body.ver = 1;
							$.ajax({
								url: "api.action",
								data: {
									webJson: JSON.stringify(param)
								},
								type: "GET",
								dataType: "json",
								success: function(json) {
									team.addGroupView(gid, name, json.body.items.length)
								}
							});
						});

					} else if (json.body.code == 121) {
						require(["util"], function(util) {
							util.alert("提示", "群组不存在！");
						});
					} else if (json.body.code == 136) {
						require(["util"], function(util) {
							util.alert("提示", "群验证码错误！");
						});
					}
				},
				error: function() {
					require(["util"], function(util) {
						util.alert("提示", "网络连接异常，请稍后重试！");
					});
				}
			});
		}
	}

	// 添加联系人弹层
	var search_addcontact = function(that) {
		var pa = $(that).parents(".addContact");
		var labelId = pa.find(".exist-wrap li.selected").attr("labelId"),
			rel = $(that).attr("rel"),
			pin = $(that).parent().attr("data"),
			slabelId = $(that).parent().attr("labelId");
		if (labelId == slabelId) {
			jQuery(document).trigger('close.facebox');
			return;
		}
		var util = require("util");
		if (rel == "ok") {
			add_friend(pin, labelId, function(data) {
				if (data.type == "message_ack") {
					var userdom = util.searchResDom(pin);
					var detaildom = userdom.find(".r");
					var userinfo = {
						email: detaildom.attr("email"),
						orgFullName: userdom.find(".wto span:eq(0)").text(),
						phone: detaildom.attr("phone"),
						position: detaildom.attr("pos"),
						realname: userdom.find(".nickname span:eq(0)").text(),
						uid: pin
					};
					DDstorage.set(pin, userinfo);
					var offline = userdom.find(".l img").attr("status");
					var str = ' <li class="item" conver="' + pin + '" id="contact-' + pin +
						'" kind="customer">' + '<div class="l">' + '<img src="' + userdom.find(
							".l img").attr("src") + '" status="' + offline + '"/>' + '</div>' +
						'<div class="m">' + '<div class="nickname"><span title="' + userinfo.realname +
						'">' + userinfo.realname + '</span><span class="' + userdom.find(
							".nickname span:eq(1)").attr("class") + '"></span></div>' +
						'<div class="rc-msg wto"></div>' + '</div><div class="r">' +
						'<span class="i i-ctt" data="' + pin + '" labelId="' + labelId +
						'"></span>' + '</div></li>'
					var mod = $("#contactmod-" + labelId);
					var hd = mod.parent().parent().find(".hd");
					hd.find(".allcontacts").text(Number(hd.find(".allcontacts").text()) +
						1);
					if (offline == "off") {
						mod.append(str);
						$.grayscale(util.contactDom(pin).find(".l img"));
						get_contact_status(pin, function(data) {
							var dom = util.contactDom(data.from);
							dom.find(".wto").text(get_offline_str(data.body.datetime));
						}, function(data) {
							//console.log(data)
						})
					} else {
						hd.find(".online").text(Number(hd.find(".online").text()) + 1);
						mod.prepend(str);
						get_user_info(pin, function(data) {
							var dom = util.contactDom(data.body.uid);
							dom.find(".wto").attr("title", data.body.signature).text(data.body
								.signature);
						});
					}
					$("#j-tabPanelMainHd").find("li.selected").click();
				} else {
					util.alert("提示", data.body.msg);
				}
			}, function(data) {
				//console.log(data);
			});
			jQuery(document).trigger('close.facebox');
		} else if (rel == "g") {
			$(that).parent().find("li.selected").removeClass("selected");
			$(that).addClass("selected");
		} else {
			jQuery(document).trigger('close.facebox');
		}
	};

	// 新建组
	$("#jd-add-group").on("click", function() {
		var addNewContactGroup = $("#addNewContactGroup").clone();
		addNewContactGroup.find(".btn-wrap").attr("seq", $(this).attr("seq")).attr(
			"ver", $(this).attr("ver"));
		jQuery.facebox(addNewContactGroup.show());
		addNewContactGroup.find("a").on("click", function() {
			if ($(this).attr("rel") == "save" && !$(this).attr("disabled")) {
				var name = $(this).parents(".add-contact-group").find(".group-name").val();
				if (!name) {
					var tip = $(this).parents("div[id='addNewContactGroup']").find(
						".acg-tip");
					var text = $("#addNewContactGroup").find(".acg-tip").text();
					var html = "<span style='color:red;'>分组名不能为空</span>";
					tip.html(html);
					$(this).parents(".add-contact-group").find(".group-name").focus(
						function() {
							tip.html(text);
						});
					return;
				}
				if (name.length > 20) {
					require("util").alert("出错了", "分组名不能超过20个字符");
					return;
				}
				$(this).attr("disabled", "disabled");
				addorModify_friend_label(0, name, 0, function(data) {
					$(".loading").addClass("show");
					var timer = setTimeout(function() {
						$(".loading").removeClass("show");
						clearTimeout(timer);
					}, 1000);
					get_contact_list_re();
					jQuery(document).trigger('close.facebox');
				}, function(data) {
					//console.log(data);
					jQuery(document).trigger('close.facebox');
				});
			} else {
				jQuery(document).trigger('close.facebox');
			}
		});
	});

	// 修改组
	$("#jd-modify-group").on("click", function() {
		var groupMgr = $("#groupMgr").clone();
		var str = "",
			mods = $("#jd-contact").find(".mod");
		if (mods.length == 0) {
			require("util").alert("出错了", "你还没有分组")
			return;
		}

		for (var i = 0; i < mods.length; i++) {
			var name = mods.eq(i).attr("name");
			if (mods.eq(i).attr("type") == "SYSTEM") {
				str += '<label class="gm-item"><span>分组名：</span>' +
					'<input type="text" disabled="disabled" value="' + name + '"></label>';
			} else {
				str += '<label class="gm-item"><span>分组名：</span>' + '<input data="' +
					mods.eq(i).attr("labelId") + '" type="text" rel="' + name + '" value="' +
					name + '"><span class="i i-del-group" labelId="' + mods.eq(i).attr(
						"labelId") + '"></span></label>';
			}
		}
		groupMgr.find(".pop-content").html(str);
		jQuery.facebox(groupMgr.show());

		groupMgr.find(".i-del-group").on("click", function() {
			var util = require("util"),
				labelId = $(this).attr("labelId"),
				that = this;
			if (!labelId) {
				return;
			}
			util.confirm("提示", '<div class="pop-content">' +
				'<div class="i i-del-gpcm"></div>' +
				'<div class="del-gpcm-tip">选定分组将被删除，组内联系人将被移至默认分组' +
				'“常用联系人”里，您确定要删除该分组吗？</div></div>',
				function() {
					delete_friend_label(labelId, function(data) {
						if (data.type == "message_ack") {
							$(that).parent().remove();
							get_contact_list_re();
						} else {
							util.alert("出错了", data.body.msg)
						}
					}, function() {
						util.alert("出错了", "删除失败，请稍后重试")
					})
				})
		});

		groupMgr.find("a").on("click", function() {
			if ($(this).attr("rel") == "save") {
				var inputs = $(this).parents(".group-mgr:eq(0)").find(".gm-item input");
				for (var i = 0; i < inputs.length; i++) {
					var name = inputs.eq(i).val(),
						labelId = inputs.eq(i).attr("data");
					if (name && labelId && name != inputs.eq(i).attr("rel")) {
						addorModify_friend_label(labelId, name, 0, function(data) {
							$("#jd-contact").find("div[labelid=" + data.body.id + "]").attr(
								"name", data.body.name).find(".l span:eq(1)").text(data.body.name);
						}, function(data) {
							//console.log(data);
						});
					}
				}
				jQuery(document).trigger('close.facebox');
			} else {
				jQuery(document).trigger('close.facebox');
			}
		});
	});

	$("#j-tabPanelMainBd").on({
		"DOMMouseScroll": function() {
			$(".triangle-flag").hide();
		},
		"mousewheel": function() {
			$(".triangle-flag").hide();
		}
	})
})();
