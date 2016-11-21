require(["util"], function(util) {
    $(function() {
        var version = "1.0";
        //进入页面默认开启声音，桌面提醒
        require(["util", "notification"], function(util, notification) {
            $("#user_desk_text").text("桌面通知")
            $(document).click(function() {
                notification.requestPermission(
                    function() {
                        util.cookie("isOpenDesk", "1", {
                            expires: 30
                        });
                    });
            });
            if (!notification.isSupported()) {
                $("#user_dest_set").hide();
            }
            c = util.cookie("isOpenSound");
            if (c == "1") {
                $("#user_sound_text").text("关闭声音").removeClass("tgl");
            } else if (c == "0") {
                $("#user_sound_text").text("开启声音").addClass("tgl");
            } else {
                util.cookie("isOpenSound", "1", {
                    expires: 30
                });
                $("#user_sound_text").text("关闭声音").removeClass("tgl");
            }

            //查询自己的状态
            var uid = util.cookie("uid");
            get_contact_status(uid, function(data) {
                if (data.Status != "off") {
                    $("#user_state").attr("class",
                        data.Status == "chat" ? "i i-on" : get_status_class(data.Status));
                } else {
                    //重新登录
                    userlogout(loginOutSuccess, loginOutFail);
                }
            });
        });

        /***修改签名开始**/
        //点击修改签名按钮
        $("#panel-user-signature-edit").bind("click", function() {
            var signature = $("#panel-user-signature").text();
            $("#panel-user-signature-input").val(signature);
            $("#panel-user-signature-input").addClass("show").select();
        });

        $("#panel-user-signature-div").bind("click", function() {
            var signature = $("#panel-user-signature").text();
            $("#panel-user-signature-input").val(signature);
            $("#panel-user-signature-input").addClass("show").select();
        });

        $("#panel-user-signature-div").bind("mouseover", function() {
            $(this).attr("title", $("#panel-user-signature").text());
        });

        //Enter键保存签名
        $("#panel-user-signature-input").keypress(function(event) {
            if (event.keyCode == 13) {
                $("#panel-user-signature-input").blur();
            }
        });

        //签名输入
        $("#panel-user-signature-input").bind("blur", function(event) {
            var newSignature = $(this).val();
            require(["util"], function(util) {
                //验证不超过50个字符
                if (!!newSignature &&
                    newSignature.length > 50) {
                    util.alert("签名修改",
                        "亲，签名长度不能超过50个字符哦！",
                        signatureConfirm,
                        signatureCancel);
                    return;
                }
                var uid = util.cookie("uid");
                var aid = util.cookie("aid");

                $.ajax({
                    type: 'post',
                    dataType: "json",
                    data: {
                        "uid": uid,
                        "aid": aid,
                        "signature": newSignature,
                        "ptype": "setSignature"
                    },
                    url: '/api.action',
                    success: function(data) {
                        if (data.Code == 0) {
                            if (!!newSignature) {
                                $("#panel-user-signature").text(newSignature);
                            } else {
                                $("#panel-user-signature").text("编辑个性签名！");
                            }
                            $("#panel-user-signature-input").removeClass("show");
                        }
                    }
                });
            }); //require(["util"])
        });
        /***修改签名结束**/

        /**设置开始  登录，关闭声音等*/
        $("#user_set").bind("click", function() {
            if ($("#user_set_select").hasClass("show")) {
                $("#user_set_select").removeClass("show");
                $("#timline-setting").hide();
            } else {
                $("#user_set_select").addClass("show");
            }
        });

        //退出登录
        $("#user_login_out").bind("click", function() {
            var util = require("util");
            util.confirm("确定", "您确定要退出Candy网页版吗？", function() {
                userlogout(loginOutSuccess, loginOutFail);
            });
        });

        //声音通知
        $("#user_sound_set").bind("click", function() {
            var ele = $(this).find("span");
            var flag = ele.hasClass("tgl");
            require(["util"], function(util) {
                if (flag) {
                    ele.removeClass("tgl");
                    $.publish('soundOpen');
                    $("#user_sound_text").html("关闭声音");
                    util.cookie("isOpenSound", 1);
                } else {
                    ele.addClass("tgl");
                    $.publish('soundClose');
                    $("#user_sound_text").html("开启声音");
                    util.cookie("isOpenSound", 0);
                }
            });
        });

        //桌面通知
        $("#user_dest_set").bind("click", function() {}).bind("mouseover", function(event) {
            var ele = $(this).find("span");
            var flag = ele.hasClass("tgl");
            var util = require("util");

            if ($("#timline-setting").length == 0) {
                var html =
                    "<div id='timline-setting'><ul class='notice-ttl'>" +
                    "<li><span class='chkbox'></span>5秒后消失</li>" +
                    "<li><span class='chkbox'></span>10秒后消失</li>" +
                    "<li><span class='chkbox'></span>不自动消失</li>" +
                    "<li><span class='chkbox'></span>关闭通知</li></ul></div>";
                $("body").append(html);
            } else {
                $("#timline-setting").show();
            }

            $("#timline-setting").css({
                position: "absolute",
                top: $(this).offset().top,
                left: $(this).offset().left + $(this).width(),
                zIndex: 50
            });
            $("#timline-setting").find("li").mouseout(
                function(event) {
                    var to = $(event.toElement);
                    if (!to.parent().hasClass("notice-ttl")) {
                        $("#timline-setting").hide();
                    }
                }).click(function() {
                var index = $(this).index();
                var ttl = 0;
                if (index == 0) {
                    ttl = 5000;
                    util.cookie("isOpenDesk", 1);
                    util.cookie("cttl", ttl);
                } else if (index == 1) {
                    ttl = 10000;
                    util.cookie("isOpenDesk", 1);
                    util.cookie("cttl", ttl);
                } else if (index == 2) {
                    ttl = new Date().getTime();
                    util.cookie("isOpenDesk", 1);
                    util.cookie("cttl", ttl);
                } else if (index == 3) {
                    util.cookie("isOpenDesk", 0);
                }
                $("#timline-setting").hide();
                $("#user_desk_text").click();
                $(this).siblings().removeClass("on");
                $(this).addClass("on");
            });

            var open = util.cookie("isOpenDesk");
            var ttl = util.cookie("cttl");
            var index = 0;
            if (open == "0") {
                index = 3;
            } else if (ttl == "5000") {
                index = 0;
            } else if (ttl == "10000") {
                index = 1;
            } else {
                index = 2;
            }
            if (open == null && ttl == null) {
                index = 1;
            }
            $("#timline-setting").find("li").removeClass("on").eq(index).addClass("on");
        }).bind("mouseout", function(event) {
            var to = $(event.toElement);
            var hide = !to.hasClass("notice-ttl") && !to.parents().hasClass("notice-ttl");
            if (hide) {
                $("#timline-setting").hide();
            }
        });

        //个人资料
        $("#user_info").bind("click", function() {
            var dom = $("#idcard").clone(),
                uid = util.cookie("uid"),
                info = DDstorage.get(uid),
                phone, tel;

            //本地存储有数据
            if (info) {
                dom.find(".idcard-name").text(info.Name);
                nickname = dom.find(".idcard-nickname").html(
                    "昵称：<input type='text' style='cursor:pointer;' title='点击修改' value='" + info.NickName + "'>"
                );
                dom.find(".idcard-signature").html(
                    "签名：<input type='text' style='cursor:pointer;' readonly='readonly' value='" + info.Signature +
                    "'>").show();

                if (info.Avatar) {
                    dom.find(".idcard-img").attr("src", info.Avatar);
                }
                dom.find(".green-btn").hide();
                dom.find(".blue-btn").text("确定").css("marginLeft", "165px").css("marginTop", "0").click(function() {
                    jQuery(document).trigger('close.facebox');
                });
                $.facebox(dom.show());
                var h = dom.find(".pop-title").outerHeight() +
                    dom.find(".pop-content").outerHeight() +
                    dom.find(".green-btn").outerHeight() +
                    20;
                dom.parent().height(h);

                //输入事件绑定
                nickname.children("input").bind("blur", function() {
                    var n = $.trim($(this).val());
                    if (n != info.NickName) {
                        updateInfo(uid, util.cookie("aid"), n);
                    }
                    if ($.trim($(this).val()) == "") {
                        $(this).val(info.NickName || "点击添加");
                    }
                    $(this).attr("readonly", "readonly").css(
                        "border", "none").css("cursor", "pointer");
                });
            } else {
                //不太可能走到这里
                util.alert("提示", "获取个人资料失败");
            }
        }); //end $("#user_info").bind

        function updateInfo(uid, aid, nickname) {
            if (!nickname) {
                return;
            }

            $.ajax({
                url: "/api.action",
                type: "POST",
                dataType: "json",
                data: {
                    "uid": uid,
                    "aid": aid,
                    "nickname": nickname,
                    "ptype": "setNickName"
                },
                success: function(json) {
                    if (json.Code == 0) {
                        var info = DDstorage.get(uid);
                        if (info) {
                            if (nickname) {
                                info.NickName = nickname;
                            }
                            DDstorage.set(uid, info);
                        }
                    } else {
                        util.alert("提示", "保存个人信息失败");
                    }
                }
            });
        } // end updateInfo
        /**设置结束  登录，关闭声音等*/
    });
});

function signatureConfirm() {
    $("#panel-user-signature-input").removeClass("show");
}

function signatureCancel() {
    $("#panel-user-signature-input").removeClass("show");
}

function suggestionConfirm() {
    jQuery(document).trigger('close.facebox');
}

function suggestionCanle() {
    jQuery(document).trigger('close.facebox');
}

/**退出登录成功*/
function loginOutSuccess(data) {
    require(["util"], function(util) {
        util.cookie("uid", "", {
            expires: -1
        });
        util.cookie("aid", "", {
            expires: -1
        });

        window.location.href = "/login";
    });
}

/**退出登录失败*/
function loginOutFail(data) {
    require(["util"], function(util) {
        util.cookie("uid", "", {
            expires: -1
        });
        util.cookie("aid", "", {
            expires: -1
        });

        window.location.href = "/login";
    });
}
