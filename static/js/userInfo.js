require(["util"], function(util) {
    $(function() {
        var version = "1.0";
        //进入页面默认开启声音，桌面提醒
        require(["util", "notification"], function(util,
            notification) {
            $("#user_desk_text").text("桌面通知")
            $(document).click(function() {
                notification.requestPermission(
                    function() {
                        util.cookie(
                            "isOpenDesk",
                            "1", {
                                expires: 30
                            });
                    });
            });
            if (!notification.isSupported()) {
                $("#user_dest_set").hide();
            }
            c = util.cookie("isOpenSound");
            if (c == "1") {
                $("#user_sound_text").text("关闭声音").removeClass(
                    "tgl");
            } else if (c == "0") {
                $("#user_sound_text").text("开启声音").addClass(
                    "tgl");
            } else {
                util.cookie("isOpenSound", "1", {
                    expires: 30
                });
                $("#user_sound_text").text("关闭声音").removeClass(
                    "tgl");
            }

            //查询自己的状态
            var uid = util.cookie("uid");
            get_contact_status(uid, function(data) {
                if (data.Status != "off") {
                    $("#user_state").attr(
                        "class", data.Status ==
                        "chat" ? "i i-on" :
                        get_status_class(
                            data.Status));
                } else {
                    //重新登录
                    //update_user_presence("off","off",loginOutSuccess,loginOutFail);
                }
            });
        });

        /***修改签名开始**/
        //点击修改签名按钮
        $("#panel-user-signature-edit").bind("click", function() {
            var signature = $("#panel-user-signature").text();
            $("#panel-user-signature-input").val(
                signature);
            $("#panel-user-signature-input").addClass(
                "show").select();
        });
        $("#panel-user-signature-div").bind("click", function() {
            var signature = $("#panel-user-signature").text();
            $("#panel-user-signature-input").val(
                signature);
            $("#panel-user-signature-input").addClass(
                "show").select();
        });
        $("#panel-user-signature-div").bind("mouseover",
            function() {
                $(this).attr("title", $(
                    "#panel-user-signature").text());
            });
        //Enter键保存签名
        $("#panel-user-signature-input").keypress(function(
            event) {
            if (event.keyCode == 13) {
                $("#panel-user-signature-input").blur();
            }
        });

        //签名输入
        $("#panel-user-signature-input").bind("blur", function(
            event) {
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
                encodeSignature = encodeURI(
                    newSignature);
                $.ajax({
                    type: 'post',
                    dataType: "json",
                    data: {
                        "uid": uid,
                        "aid": aid,
                        "signature": encodeSignature,
                        "ptype": "setSignature"
                    },
                    url: '/api.action',
                    success: function(
                        data) {
                        if (data.Code ==
                            0) {
                            if (!!
                                newSignature
                            ) {
                                $(
                                        "#panel-user-signature"
                                    )
                                    .text(
                                        newSignature
                                    );
                            } else {
                                $(
                                        "#panel-user-signature"
                                    )
                                    .text(
                                        "编辑个性签名！"
                                    );
                            }
                            $(
                                "#panel-user-signature-input"
                            ).removeClass(
                                "show"
                            );
                        }
                    }
                });
            }); //require(["util"])
        });
        /***修改签名结束**/

        /***修改出席状态开始**/
        //修改用户出席状态
        $("body").bind("click", function(ele) {
            //点击修改状态
            if ($(ele.target).attr("id") !=
                "user_state") {
                $("#user_state_select").removeClass(
                    "show");
            }
            //点击修改设置
            if ($(ele.target).attr("id") != "user_set") {
                $("#user_set_select").removeClass(
                    "show");
                $("#timline-setting").hide();
            }
        });
        $("#user_state").bind("click", function() {
            if ($("#user_state_select").hasClass("show")) {
                $("#user_state_select").removeClass(
                    "show");
            } else {
                $("#user_state_select").addClass("show");
            }
        });
        $("#user_state_select li").bind("click", function() {
            var dom = this;
            var classValue = $(this).find("span").attr(
                "class");
            require(["util"], function(util) {
                var uid = util.cookie("uid");
                var aid = util.cookie("aid");
                var stateValue = $(dom).attr(
                    "stateValue");
                var obj = new Object();
                obj.body = new Object();
                obj.body.presence = stateValue;
                obj.body.action = "chg";
                obj.body.clientType = "web";
                obj.version = version;
                obj.aid = aid;
                obj.type = "presence";
                obj.from = uid;
                var str = JSON.stringify(obj);
                var url =
                    "/api.action?webJson=" +
                    str;
                /*先注释掉guowei
                $.getJSON(url,function(data) {//成功返回即可
                    $("#user_state").attr("class",classValue);
                    $("#user_state_select").removeClass("show");
                });
                */
            });
        });
        /***修改出席状态结束**/

        /**设置开始  登录，关闭声音等*/
        $("#user_set").bind("click", function() {
            if ($("#user_set_select").hasClass("show")) {
                $("#user_set_select").removeClass(
                    "show");
                $("#timline-setting").hide();
            } else {
                $("#user_set_select").addClass("show");
            }
        });

        //退出登录
        $("#user_login_out").bind("click", function() {
            var util = require("util");
            util.confirm("确定", "您确定要退出Candy网页版吗？",
                function() {
                    update_user_presence("off",
                        "off", loginOutSuccess,
                        loginOutFail);
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
                    $("#user_sound_text").html(
                        "关闭声音");
                    util.cookie("isOpenSound",
                        1);
                } else {
                    ele.addClass("tgl");
                    $.publish('soundClose');
                    $("#user_sound_text").html(
                        "开启声音");
                    util.cookie("isOpenSound",
                        0);
                }
            });
        });

        //桌面通知
        $("#user_dest_set").bind("click", function() {}).bind(
            "mouseover",
            function(event) {
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
                    left: $(this).offset().left + $(
                        this).width(),
                    zIndex: 50
                });
                $("#timline-setting").find("li").mouseout(
                    function(event) {
                        var to = $(event.toElement);
                        if (!to.parent().hasClass(
                                "notice-ttl")) {
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
                    $(this).siblings().removeClass(
                        "on");
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
                $("#timline-setting").find("li").removeClass(
                    "on").eq(index).addClass("on");
            }).bind("mouseout", function(event) {
            var to = $(event.toElement);
            var hide = !to.hasClass("notice-ttl") && !
                to.parents().hasClass("notice-ttl");
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
            if (info && info.realname) {
                dom.find(".idcard-name").text(info.realname);
                phone = dom.find(".idcard-phone").html(
                    "手机：<input type='text' style='cursor:pointer;' title='点击修改' value='" +
                    info.phone + "'>");
                if (info.tel) {
                    tel = dom.find(".idcard-tel").html(
                        "座机：<input type='text' style='cursor:pointer;' title='点击修改' readonly='readonly' value='" +
                        info.tel + "'>").show();
                } else {
                    tel = dom.find(".idcard-tel").html(
                        "座机：<input type='text' style='cursor:pointer;' title='点击修改' readonly='readonly' value='点击添加'>"
                    ).show();
                }
                dom.find(".idcard-email").text("邮箱：" +
                    (info.email || ""));
                dom.find(".idcard-pos").text("岗位：" + (
                    info.position || ""));
                dom.find(".idcard-orgname").text("部门：" +
                    (info.orgFullName || ""));
                if (info.avatar) {
                    dom.find(".idcard-img").attr("src",
                        info.avatar);
                }
                dom.find(".green-btn").hide();
                dom.find(".blue-btn").text("确定").css(
                    "marginLeft", "165px").css(
                    "marginTop", "0").click(
                    function() {
                        jQuery(document).trigger(
                            'close.facebox');
                    });
                $.facebox(dom.show());
                var h = dom.find(".pop-title").outerHeight() +
                    dom.find(".pop-content").outerHeight() +
                    dom.find(".green-btn").outerHeight() +
                    20;
                dom.parent().height(h);

                //输入事件绑定
                event(phone.children("input").bind(
                    "blur",
                    function() {
                        var p = $.trim($(this).val());
                        if (p != info.phone) {
                            var valid =
                                /^1\d{10}$/.test(
                                    $(this).val()
                                );
                            if (!valid) {
                                util.alert("提示",
                                    "您输入的手机号有误",
                                    function() {
                                        phone
                                            .children(
                                                "input"
                                            )
                                            .val(
                                                info
                                                .phone
                                            );
                                    });
                            } else {
                                updateInfo(uid,
                                    util.cookie(
                                        "aid"
                                    ), p,
                                    "", "");
                            }
                        }
                        if ($.trim($(this).val()) ==
                            "") {
                            $(this).val(info.phone ||
                                "点击添加");
                        }
                        $(this).attr("readonly",
                            "readonly").css(
                            "border",
                            "none").css(
                            "cursor",
                            "pointer");
                    }));

                event(tel.children("input").bind("blur",
                    function() {
                        var t = $.trim($(this).val());
                        var valid = t && t !=
                            info.tel && t.length <
                            30;
                        valid = valid && (
                            /^(\+|\d)\d+(转|-|\s)?\d+$/
                            .test(t) ||
                            /^\(\d{2,4}\)\d+(转|-|\s)?\d+$/
                            .test(t));
                        if (valid || t == "") {
                            updateInfo(uid,
                                util.cookie(
                                    "aid"),
                                "", t, "");
                            $(this).val(t ||
                                info.tel ||
                                "点击添加");
                        } else {
                            $(this).val(info.tel ||
                                "点击添加");
                        }
                        $(this).attr("readonly",
                            "readonly").css(
                            "border",
                            "none").css(
                            "cursor",
                            "pointer");
                    }));
            } else {
                //不太可能走到这里
                util.alert("提示", "获取个人资料失败");
            }
        }); //end $("#user_info").bind

        function event(jdom) {
            jdom.bind("click", function() {
                if (!/^\d.*\d$/.test($(this).val())) {
                    $(this).val('');
                } else {
                    if (this.selectionStart) {
                        this.selectionStart = 0;
                        this.selectionEnd = this.value.length;
                    } else if (this.select && typeof this
                        .select == "function") {
                        this.select();
                    }
                }
                $(this).removeAttr("readonly").css(
                    "border", "1px solid #aaa").css(
                    "cursor", "auto");
            }).bind("keydown", function(evt) {
                var allowedKey = [8, 37, 39, 46, 107,
                    109, 189
                ]; //delete  left  right  backspace + -
                if (allowedKey.indexOf(evt.keyCode) >=
                    0) {
                    return true;
                }
                //+
                if (evt.shiftKey && evt.keyCode == 187) {
                    return true;
                }
                //enter
                if (evt.keyCode == 13) {
                    $(this).blur();
                    return;
                }
                // 数字
                if (evt.keyCode >= 48 && evt.keyCode <=
                    57 && !evt.shiftKey) {
                    return true;
                }
                if (evt.keyCode >= 96 && evt.keyCode <=
                    105) {
                    return true;
                }
                return false;
            }).bind("paste", function() {
                //console.log();
            });
        }

        function updateInfo(uid, aid, phone, tel, avatar) {
            var url = "/api.action?ptype=iep_erp_set&uid=" +
                uid + "&aid=" + aid,
                update = false;
            if (phone) {
                url = url + "&phone=" + phone;
                update = true;
            }
            if (tel) {
                url = url + "&tel=" + tel;
                update = true;
            }
            if (avatar) {
                url = url + "&avatar=" + avatar;
                update = true;
            }
            if (!update) {
                return;
            }
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function(json) {
                    if (json.code == 1) {
                        var info = DDstorage.get(
                            uid);
                        if (info && info.realname) {
                            if (avatar) {
                                info.avatar =
                                    avatar;
                            }
                            if (phone) {
                                info.phone = phone;
                            }
                            if (tel) {
                                info.tel = tel;
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

function suggestionSend(ele) {
    //var text = $("#suggestion_feedback_input").val();
    var text = $(ele).parents(".pop-bottom").siblings(".pop-content").find(
        "textarea").val();
    require(["util"], function(util) {
        if (text) {
            //长度不大于200
            text = text.trim();
            if (text.length > 200) {
                util.alert("意见反馈", "意见反馈字数不能超过200个字！",
                    suggestionConfirm, suggestionCanle);
                return;
            } else {
                var uid = util.cookie("uid");
                var token =
                    'F50DBAB515286F4C88D44CADE0819334829C15F60D859F43';
                var adviceClient = {
                    "advicePin": uid,
                    "adviceContent": text,
                    "from": 54,
                    "adviceContentText": "来自企业版网页的意见反馈"
                };
                var url =
                    "http://candy.dearcode.net/client_advice/clientAdvice.action?token=" +
                    token + "&adviceClient=" + JSON.stringify(
                        adviceClient) + "&callback=?";
                $.getJSON(url, function(data) { //保存意见,由于返回的是json,不是jsonp,默认成功
                });
                jQuery(document).trigger('close.facebox');
            }
        } else {
            $(ele).parents(".pop-bottom").siblings(".pop-content").find(
                "p").find("span").html("（请输入您的反馈信息！）");
        }
    });
}

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
        $("body").addClass("sendingMail");
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
        $("body").addClass("sendingMail");
        window.location.href = "/login";
    });
}

/**
 * get方式请求
 * @param url
 * @param callback
 */
function imGetRequest(url, callback) {
    $.getJSON(url, function(data) {
        callback(data);
    });
}

/**
 * post方式请求
 * @param url
 * @param data
 * @param callback
 */
function imPostRequest(url, data, callback) {
    $.ajax({
        type: 'post',
        dataType: 'json',
        url: url,
        data: data,
        success: function(data) {
            callback(data);
        }
    });
}

function getStyleByStatus(status) {
    if (status == "chat") {
        return "i i-on";
    } else if (status == "busy") {
        return "i i-busy";
    } else if (status == "away") {
        return "i i-left";
    } else if (status == "dnd") {
        return "i i-nodisturb";
    } else if (status == "hide") {
        return "i i-hide";
    } else if (status == "off") {
        return "";
    }
    return "";
};
