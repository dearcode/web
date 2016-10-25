/**
 * created by cdwangrui@jd.com
 */

// 单个联系人菜单
$("#jd-contact").on("click", ".i-ctt", function(e) {
			var offset = $(this).offset();
			var top = offset.top + 44, data = $(this).attr("data"), labelId = $(this).attr("labelId");
			offset.top = top;
			offset.left = offset.left - 5;
			var menu = $(".oper-menu").eq(0).css(offset);
			if (menu.hasClass("show") && menu.attr("data") != data) {
				menu.attr("data", data).attr("labelId", labelId);
			} else {
				menu.toggleClass("show").attr("data", data).attr("labelId", labelId);
			}
		})

// 单个联系人菜单事件
$(".oper-menu").on("click", function(e) {
	var data = $(this).attr("data"), name = e.target.id, labelId = $(this).attr("labelId");
	//如果点击到icon上，则不会有反应
	if(!name){
		name = $(e.target).parent().attr("id");
	}
	var userinfo = DDstorage.get(data);
	var util = require("util");
	if (name == "oper-sendmsg") {
		if(!$("#tabPanelMainHd-org").hasClass("selected")){
			var offset = $(this).offset();
			offset.left = offset.left + $(this).width() + 52;
			offset.top = offset.top - 37;
			if ($(".triangle-flag").is(":hidden")) {
				$(".triangle-flag").show().css(offset);
			} else {
				$(".triangle-flag").animate(offset);
			}
		}
		require(["chat_window"], function(msgWindow) {
					msgWindow.create(data, "customer");
				})
	} else if (name == "oper-sendemail") {
        $("#tabPanelMainHd-org").addClass("sendingMail");
		if(!userinfo || !userinfo.email){
			get_user_info(data, function(json){
                $("#tabPanelMainHd-org").addClass("sendingMail");
				if(json.code == 1 && json.body.email){
					location.href = "mailto:" + json.body.email;
					DDstorage.set(data, json.body);
				}else{
					util.alert("提示", "获取用户资料失败！");
				}
			});
		}else{
			location.href = "mailto:" + userinfo.email;
		}

	} else if (name == "oper-viewinfo") {
        require(["visiting_card"], function(card){
            card.show(data);
        });
	} else if (name == "oper-move") {
		var addContact = $("#addContact").clone();
		addContact.find(".pop-title").text("移动联系人");
		addContact.find(".btn-wrap").attr("data", data);
		addContact.find(".btn-wrap").attr("labelId", labelId);
		var str = "", mods = $("#jd-contact").find(".mod");
		if (mods.length == 0) {
			util.alert("出错了", "你还没有分组")
			return;
		}
		for (var i = 0; i < mods.length; i++) {
			str += '<li rel="g" class="exist-item ' + (i == 0 ? "selected" : "") + '" labelId="'
					+ mods.eq(i).attr("labelId") + '"><span class="i"></span>' + mods.eq(i).attr("name") + '</li>';
		}
		addContact.find(".exist-wrap").html(str);
		jQuery.facebox(addContact.show());
		addContact.find("li,a").on("click", function() {
			var that = this;
			var pa = $(that).parents(".addContact");
			var labelId = pa.find(".exist-wrap li.selected").attr("labelId"), rel = $(that).attr("rel"), data = $(that)
					.parent().attr("data"), slabelId = $(that).parent().attr("labelId");
			if (labelId == slabelId) {
				jQuery(document).trigger('close.facebox');
				return;
			}
			if (rel == "ok") {
				move_friend(labelId, data, function(data) {
//							console.log(data)
							var mod = $("#contactmod-" + data.body.labelId);
							var contact = util.contactDom(data.body.user.uid);
							contact.find(".r .i-ctt").attr("labelid", data.body.labelId);
							var allcon = mod.parent().parent().find(".hd");
							allcon.find(".allcontacts").text(Number(allcon.find(".allcontacts").text()) + 1);

							var mod1 = $("#contactmod-" + slabelId);
							var allcon1 = mod1.parent().parent().find(".hd");
							allcon1.find(".allcontacts").text(Number(allcon1.find(".allcontacts").text()) - 1);

							if (contact.find(".l img").attr("status") != "off") {// 更正在线数
								allcon.find(".online").text(Number(allcon.find(".online").text()) + 1);

								allcon1.find(".online").text(Number(allcon1.find(".online").text()) - 1);
								mod.prepend(contact);
							} else {
								mod.append(contact);
							}
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
				jQuery(document).trigger('close.facebox');
			} else if (rel == "g") {
				$(that).parent().find("li.selected").removeClass("selected");
				$(that).addClass("selected");
			} else {
				jQuery(document).trigger('close.facebox');
			}
		});
	} else if (name == "oper-del") {
		var modid = data;
		util.confirm("提示", "确认要删除联系人？", function() {
					delete_friend(data, false, function(data) {
								if (data.type == "message_ack") {
									var conmod = util.contactDom(modid);
									var rnum = conmod.parents(".mod").find(".hd .r");
									var allcon = rnum.find(".allcontacts");
									allcon.text(Number(allcon.text()) - 1);
									if (conmod.find(".l img").attr("status") != "off") {
										var allcon1 = rnum.find(".online");
										allcon1.text(Number(allcon1.text()) - 1);
									}
									conmod.remove();
									$(".triangle-flag").hide();
								} else {
									util.alert("出错了", data.body.msg)
								}
							}, function() {
								util.alert("出错了", "删除失败，请稍后重试")
							})
				})
	}
	$(".oper-menu").removeClass("show");
});

function show_search_card(userinfo){
	var idcard = $("#idcard").clone();
	idcard.find(".idcard-name").text(userinfo.realname);
	idcard.find(".idcard-phone").text("手机："+(userinfo.phone ||""));
	idcard.find(".idcard-email").text("邮箱："+(userinfo.email ||""));
	idcard.find(".idcard-pos").text("岗位："+(userinfo.position ||""));
	idcard.find(".idcard-orgname").text("部门："+(userinfo.orgFullName ||""));
	idcard.find(".btn-wrap").attr("data", userinfo.uid);
	if(userinfo.tel && userinfo.tel != "undefined"){
		idcard.find(".idcard-tel").text("座机："+userinfo.tel).show();
	}
	if(userinfo.avatar){
		idcard.find(".idcard-img").attr("src", userinfo.avatar);
	}else{
		idcard.find(".idcard-img").attr("src", "../img/img-avatar.png");
	}
	var l = util.contactDom(userinfo.uid).find(".l");
	if(l.length > 0){
		//在联系人列表中已经存在
		 idcard.find(".btn-wrap a").eq(0).text("删除联系人").attr("rel","del");
		 _show_card_evet(idcard, userinfo);
	}else if($("#jd-contact .mod").length > 0){
		//联系人列表已经加载，但是不存在
		idcard.find(".btn-wrap a").eq(0).text("添加联系人").attr("rel","add");
		_show_card_evet(idcard, userinfo);
	}else{
		//联系人列表未加载
		var req = {};
		req.aid = util.cookie("aid");
		req.from = util.cookie("uid");
		req.type = "iq_roster_get";
		req.version = "1.0";
		req.body = {};
		req.body.ver = "1";
		$.ajax({
					url : "/dispatch.action",
					data : {
						webJson : JSON.stringify(req)
					},
					type : "GET",
					dataType : "json",
					success : function(json){
						if(!json || !json.body){
							return;
						}
						var find = false;
						for(var i=0; i<json.body.items.length; i++){
							if(json.body.items[i].user.uid == userinfo.uid){
								find = true;
								break;
							}
						}
						if(!find){
							idcard.find(".btn-wrap a").eq(0).text("添加联系人").attr("rel","add");
						}else{
							idcard.find(".btn-wrap a").eq(0).text("删除联系人").attr("rel","del");
						}
						_show_card_evet(idcard, userinfo);
				    }
			 });
	}
}

function _show_card_evet(idcard, userinfo){
	var wrap = idcard.find(".btn-wrap");
	wrap.attr("data", userinfo.uid);
	wrap.find("a").show();
	idcard.find(".btn-wrap a").eq(1).hide().end().eq(0).css("margin-left", "165px");

	jQuery.facebox(idcard.show());
	var h = idcard.find(".pop-title").outerHeight()+idcard.find(".pop-content").outerHeight()+idcard.find(".blue-btn").outerHeight() + 20;
	idcard.parent().height(h);
	idcard.find(".btn-wrap a").on("click", function() {
		var mod = $(this).parent().attr("data");
		var util = require("util");
		if ($(this).attr("rel") == "del") {
			util.confirm("删除联系人", "确认要删除联系人？", function() {
						delete_friend(mod, false, function(data) {
									if (data.type == "message_ack") {
										var conmod = util.contactDom(mod);
										var rnum = conmod.parents(".mod").find(".hd .r");
										var allcon = rnum.find(".allcontacts");
										allcon.text(Number(allcon.text()) - 1);
										if (!conmod.find(".l img").attr("status") != "off") {
											var allcon1 = rnum.find(".online");
											if(Number(allcon1.text())>0){
												allcon1.text(Number(allcon1.text()) - 1);
											}
										}
										conmod.remove();
										$(".triangle-flag").hide();
										jQuery(document).trigger('close.facebox');
									} else {
										util.alert("提示", data.body.msg);
									}
								}, function() {
									util.alert("提示", "删除失败，请稍后重试");
								});
					});
		}else if($(this).attr("rel") == "add"){
			if (util.contactDom(mod).length == 1) {
				util.alert("提示", $("#idcard").find(".idcard-name").text() + "已经在您的联系人列表中");
				return;
			}
			if (mod == cookie("uid")) {
				util.alert("提示", "不能添加自己到联系人列表");
				return;
			}
			var addContact = $("#addContact").clone();
			addContact.find(".pop-title").text("添加联系人");
			addContact.find(".btn-wrap").attr("data", mod);
			var str = "", mods = $("#jd-contact").find(".mod");
			if (mods.length == 0) {
				get_contact_list(function(data) {
							var groups = data.body.labels;
							if (!groups || groups.length == 0) {
								util.alert("提示", "你还没有分组，无法添加联系人")
								return;
							}
							var gstr = "", users = data.body.items;
							for (var i in groups) {
								var group = groups[i];
								str += '<li rel="g" class="exist-item ' + (i == 0 ? "selected" : "") + '" labelId="'
										+ group.id + '"><span class="i"></span>' + util.filterMsg(group.name) + '</li>';
							}
							addContact.find(".exist-wrap").html(str);
							jQuery.facebox(addContact.show());
							addContact.find("li,a").on("click", function() {
								chat_addcontact(this);
									});
						}, function(data) {
						});
				return;
			}
			for (var i = 0; i < mods.length; i++) {
				str += '<li rel="g" class="exist-item ' + (i == 0 ? "selected" : "") + '" labelId="'
						+ mods.eq(i).attr("labelId") + '"><span class="i"></span>' + mods.eq(i).attr("name") + '</li>';
			}
			addContact.find(".exist-wrap").html(str);
			jQuery.facebox(addContact.show());
			addContact.find("li,a").on("click", function() {
				chat_addcontact(this);
					});
			}
		})
}

//添加联系人弹层
var chat_addcontact = function(that) {
	var pa = $(that).parents(".addContact");
	var labelId = pa.find(".exist-wrap li.selected").attr("labelId"), rel = $(that).attr("rel"), pin = $(that)
			.parent().attr("data"), slabelId = $(that).parent().attr("labelId");
	if (labelId == slabelId) {
		jQuery(document).trigger('close.facebox');
		return;
	}
	if (rel == "ok") {
		add_friend(pin, labelId, function(data) {
			var util = require("util");
					if (data.type == "message_ack") {
						get_user_info(pin,function(result){
							var userinfo=result.body;
							DDstorage.set(pin, userinfo);
							get_contact_status(pin,function(r){
								var offline = r.body.presence;
								var str = ' <li class="item" conver="' + pin + '" id="contact-' + pin
										+ '" kind="customer">' + '<div class="l">' + '<img src="./img/img-avatar.png" status="' + offline + '"/>' + '</div>'
										+ '<div class="m">' + '<div class="nickname"><span title="' + userinfo.realname
										+ '">' + userinfo.realname + '</span><span class="'
										+ get_status_class(offline) + '"></span></div>'
										+ '<div class="rc-msg wto"></div>' + '</div><div class="r">'
										+ '<span class="i i-ctt" data="' + pin + '" labelId="' + labelId + '"></span>'
										+ '</div></li>';

								if (userinfo.avatar) {// 如果有头像
									/\<img src=\"(.*?)\"/.test(str);
									str=str.replace(RegExp.$1, userinfo.avatar);
								}

								var mod = $("#contactmod-" + labelId);
								var hd = mod.parent().parent().find(".hd");
								hd.find(".allcontacts").text(Number(hd.find(".allcontacts").text()) + 1);
								if (offline == "off") {
									mod.append(str);
									$.grayscale(util.contactDom(pin).find(".l img"));
									var dom = util.contactDom(r.from);
									dom.find(".wto").text(get_offline_str(r.body.datetime));
								} else {
									hd.find(".online").text(Number(hd.find(".online").text()) + 1);
									mod.prepend(str);
									var dom = util.contactDom(result.body.uid);
									dom.find(".wto").attr("title", result.body.signature).text(result.body.signature);

								}

								$("#j-tabPanelMainHd").find("li.selected").click();
							});

							});

					} else {
						util.alert("提示", data.body.msg);
					}
				}, function(data) {
				});
		jQuery(document).trigger('close.facebox');
	} else if (rel == "g") {
		$(that).parent().find("li.selected").removeClass("selected");
		$(that).addClass("selected");
	} else {
		jQuery(document).trigger('close.facebox');
	}
};


function showcard(userinfo, data) {
	var idcard = $("#idcard").clone();
	var util = require("util");
	idcard.find(".idcard-name").text(userinfo.realname);
	idcard.find(".idcard-phone").text("手机："+(userinfo.phone ||""));
	idcard.find(".idcard-email").text("邮箱："+(userinfo.email || ""));
	idcard.find(".idcard-pos").text("岗位："+(userinfo.position ||""));
	idcard.find(".idcard-tel").text("座机："+(userinfo.tel || ""));
	var l = util.contactDom(data).find(".l");
	if (!l.length && typeof userinfo.avatar != "undefined" && userinfo.avatar) {
		idcard.find(".idcard-img").attr("src", userinfo.avatar);
	} else {
		var img = l.find("img");
	    idcard.find(".idcard-img").attr("src", img.attr("src"));
	}
	idcard.find(".idcard-orgname").text("部门："+(userinfo.orgFullName ||""));
	var wrap = idcard.find(".btn-wrap");
	wrap.attr("data", data);
	wrap.find("a").show();
	jQuery.facebox(idcard.show());
	idcard.find(".btn-wrap a").on("click", function() {
				var mod = $(this).parent().attr("data");
				if ($(this).attr("rel") == "del") {
					util.confirm("删除联系人", "确认要删除联系人？", function() {
								delete_friend(mod, false, function(data) {
											if (data.type == "message_ack") {
												var conmod = util.contactDom(mod);
												var rnum = conmod.parents(".mod").find(".hd .r");
												var allcon = rnum.find(".allcontacts");
												allcon.text(Number(allcon.text()) - 1);
												if (!conmod.find(".l img").attr("status") != "off") {
													var allcon1 = rnum.find(".online");
													allcon1.text(Number(allcon1.text()) - 1);
												}
												conmod.remove();
												$(".triangle-flag").hide();
												jQuery(document).trigger('close.facebox');
											} else {
												util.alert("提示", data.body.msg)
											}
										}, function() {
											util.alert("提示", "删除失败，请稍后重试")
										})
							})
				} else {
					var me = null;
					var index = $("#j-tabPanelMainHd").find("li.selected").attr("rel");
					if (index == "recent-contacts") {
						me = $("#jd-recent-contacts").find("li.selected");
					} else if (index == "contact") {
						me = $("#jd-contact").find("li.selected");
					} else if (index == "group") {
						me = $("#jd-group").find("div.selected");
					}else if(index == "org-tree"){
						me = $("#org-"+mod);
					}

						var offset = me.offset();
						offset.left = offset.left + me.width() + 30;
						offset.top = offset.top + 22;
						if(index == "org-tree"){
							offset.left = offset.left - 20;
							offset.top = offset.top - 14;
						}
						if ($(".triangle-flag").is(":hidden")) {
							$(".triangle-flag").show().css(offset);
						} else {
							$(".triangle-flag").animate(offset);
						}
					jQuery(document).trigger('close.facebox');
					require(["chat_window"], function(msgWindow) {
								msgWindow.create(mod);
							})
				}
			})
}

// 关闭联系人列表菜单
$(document).on("click", function(e) {
			if (e.target.className != "i i-ctt") {
				$(".oper-menu").eq(0).removeClass("show");
			}
		});
