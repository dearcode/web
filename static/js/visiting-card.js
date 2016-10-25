/**
 * 个人名片
 */
define(function(require, exports, modules){
    var util = require("util"),
        aid = util.cookie("aid"),
        contactList = [],
        channelId = util.cookie("channelId"),
        chatwin = require("chat_window"),
        uid = util.cookie("uid");

    /**
     * 显示个人名片
     * @param id
     */
    function show(id){
        if(!id){
            return;
        }
        getUserInfo(id, _show);
    }

    function _show(userinfo){
        var info = $("#idcard").clone();
        if(userinfo.avatar){
            info.find(".idcard-img").attr("src", userinfo.avatar);
        }
        if(userinfo.tel){
            info.find(".idcard-tel").text("座机："+userinfo.tel);
        }
        info.find(".idcard-name").text(userinfo.realname);
        info.find(".idcard-phone").text("手机："+(userinfo.phone || ""));
        info.find(".idcard-email").text("邮箱："+(userinfo.email ||""));
        info.find(".idcard-pos").text("岗位："+(userinfo.position || ""));
        if(userinfo.signature) {
            var signatureDomHtml = "<li class='idcard-signature wto' title='"+userinfo.signature +"'>签名："+userinfo.signature+"</li>";
            $(signatureDomHtml).insertAfter(info.find(".idcard-pos"));
        }
        info.find(".idcard-orgname").html("部门：<span>"+(userinfo.orgFullName||"")+"</span>");
        info.find(".btn-wrap").attr("data", userinfo.uid);
        info.find(".idcard-img").bind("error", function() {
            $(this).attr("src", "http://static.360buyimg.com/timline/img/img-avatar.png");
        });
        //自己的名片不显示操作按钮
        if(uid == userinfo.uid){
            info.find(".btn-wrap a").remove();
            jQuery.facebox(info.show());
            return;
        }
        info.find(".idcard-orgname").append("<img class='search-dept' style='float:none;width:44px;height:22px;vertical-align: middle;' title='搜索同部门联系人' src='http://static.360buyimg.com/timline/img/search.png'>");

        var dom = info.find(".btn-wrap a[rel='del']").hide();
        inContact(userinfo.uid, function(id){
            dom.show();
            dom.click(function(){
                removeContact(userinfo.uid);
            });
        }, function(id, list){
            dom.text("添加到联系人").show();
            dom.click(function(){
                add2Contact(userinfo.uid, list, info, userinfo);
            });
        });

        info.find(".btn-wrap a[rel='senmsg']").click(function(){
            jQuery(document).trigger('close.facebox');
            chatwin.create(userinfo.uid, "customer");
        });
        jQuery.facebox(info.show());
        $(".search-dept").unbind("click").bind("click", function(){
            var dept = $(this).siblings("span").text();
            jQuery(document).trigger('close.facebox');
            $("#panel-search").val(dept).keydown();
        });
    }

    /**
     * 判断是否在自己的联系人列表之中，在联系人列表中执行函数func1,否则执行func2
     * @param id
     * @param func1
     * @param func2
     */
    function inContact(id, func1, func2){
        var req = {};
        req.aid = aid;
        req.from = uid;
        req.type = "iq_roster_get";
        req.version = "1.0";
        req.body = {};
        req.body.ver = "1";
        $.ajax({
            url:"/dispatch.action",
            data:{
                webJson:JSON.stringify(req)
            },
            type:"GET",
            dataType:"json",
            success:function(json){
                  var find = false,
                      i= 0 ,
                      item = {},
                      list = [];
                if(json && json.body &&json.body.labels){
                    for(i=0; i<json.body.labels.length; i++){
                        item = {};
                        item.name = json.body.labels[i].name;
                        item.id = json.body.labels[i].id;
                        list[i] = item;
                    }
                    for(i=0; i<json.body.items.length; i++){
                        if(json.body.items[i].user.uid == id){
                            find = true;
                            break;
                        }
                    }
                }
                if(find){
                    func1(id);
                }else{
                    func2(id, list);
                }

            }
        });
    }

    /**
     *获取用户资料
     * @param id
     * @param callback
     */
    function getUserInfo(id, callback){
       var userInfo =  DDstorage.get(id);
       if(userInfo && userInfo.uid){
           if(userInfo.type == "system") {
               return;
           }
           callback(userInfo);
       }else{
           get_user_info(id, function(json){
              if(json.code == 1){
                  DDstorage.set(id, json.body);
                  callback(json.body);
              }else{
                  util.alert("提示","获取用户资料失败，请稍后重试！");
              }
           },function(){
               util.alert("提示","获取用户资料失败，请稍后重试！");
           });
       }
    }

    function add2Contact(id, list, dom, userinfo){
        var addContact = $("#addContact").clone(), str="", i= 0, group;
        addContact.find(".pop-title").text("添加联系人");
        addContact.find(".btn-wrap").attr("data", id);
        for(i=0; i<list.length; i++){
            group = list[i];
            str += '<li rel="g" class="exist-item ' + (i == 0 ? "selected" : "") + '" labelId="'
                + group.id + '"><span class="i"></span>' + util.filterMsg(group.name) + '</li>';
        }
        addContact.find(".exist-wrap").html(str);
        jQuery.facebox(addContact.show());
        addContact.find("a[rel='close']").click(function(){
            jQuery(document).trigger('close.facebox');
        });
        addContact.find(".exist-item").click(function(){
            $(this).siblings().removeClass("selected");
            $(this).addClass("selected");
        });
        addContact.find("a[rel='ok']").click(function(){
            var req = {
                aid:aid,
                from:uid,
                to:id,
                type:"presence_subscribe",
                version:"1.0",
                body:{
                    labelId:addContact.find(".exist-wrap .selected").attr("labelid")
                }
            };
            $.ajax({
                url:"/dispatch.action",
                data:{
                    webJson:JSON.stringify(req)
                },
                type:"GET",
                dataType:"json",
                success:function(json){
                     if(json && json.body){
                         var target = $("#contactmod-"+req.body.labelId);
                         if(target.length > 0){
                              getStatus(id, function(resp){
                                  var status = "", online = false;
                                  if(resp){
                                     status = resp[0].status.presence
                                  }
                                  online = status && status != "off";
                                  var img = "http://static.360buyimg.com/timline/img/img-avatar.png";
                                  if(userinfo.avatar){
                                      img = userinfo.avatar;
                                  }
                                  var name = userinfo.realname || id;
                                  var html = '<li class="item" conver="'+id+'" id="contact-'+id+'" kind="customer">';
                                  html += '<div class="l">';
                                  if(online){
                                      html += '<img src="'+img+'" status="chat">';
                                  }else{
                                      html += '<img src="'+img+'" status="off">';
                                  }
                                  if(!online){
                                      html += '<span class="gs-mask" title="离线" style="width: 40px; height: 40px; top: 2px; left: 2px; "></span>';
                                  }
                                  html +='</div><div class="m"><div class="nickname">';
                                  html +='<span title="'+name+'">'+name+'</span>';
                                  html +='<i class="offline-text"></i><span class=""></span></div><div class="rc-msg wto"></div></div>';
                                  html +='<div class="r"><span class="i i-ctt" data="'+id+'" labelid="'+req.body.labelId+'"></span></div></li>';
                                  target.append(html);
                                  var tnum = target.parent().prev();
                                  tnum.find(".allcontacts").text(target.children().length);
                                  tnum.find(".online").text(target.find("img[status='chat']").length);
                              });
                         }
                     }
                    jQuery(document).trigger('close.facebox');
                },
                error:function(){
                    jQuery(document).trigger('close.facebox');
                    util.alert("提示", "添加联系人失败，请稍后重试");
                }
            });
        });
    }

    /**
     * 获取用户状态
     * @param id
     * @param callback
     */
    function getStatus(id, callback){
        var arr = [];
        if(typeof id == "string"){
            arr.push(id);
        }
        if($.isArray(id)){
            arr = id;
        }
        if(arr.length == 0){
            return;
        }
        $.ajax({
            url : "/api.action",
            data : {
                ptype : "iep_get_presence",
                uid : util.cookie("uid"),
                aid : util.cookie("aid"),
                pnames : JSON.stringify(arr),
                operate : "subscribe"
            },
            type:"GET",
            dataType:"json",
            success:function(json){
               if(json && json.code == 1){
                   callback(json.body.presences);
               }
            },error:function(){
                callback();
            }
        });
    }

    function removeContact(id){
        util.confirm("提示", "确实要删除该联系人？", function(){
            var req = {};
            req.from = uid;
            req.aid = aid;
            req.to = id;
            req.type = "presence_unsubscribe";
            req.version = "1.0";
            req.body = {};
            req.body.both = false;
            $.ajax({
                url:"/dispatch.action",
                data:{
                    webJson:JSON.stringify(req)
                },
                type:"GET",
                dataType:"json",
                success:function(resp){
                      if(resp){
                          var target = util.contactDom(id).parent();
                          var tnum = target.parent().prev();
                          util.contactDom(id).remove();
                          tnum.find(".allcontacts").text(target.children().length);
                          tnum.find(".online").text(target.find("img[status='chat']").length);
                      }
                    jQuery(document).trigger('close.facebox');
                } ,
                error:function(){
                    jQuery(document).trigger('close.facebox');
                }
            });
        });
    }


    return {
        show:show
    }
});
