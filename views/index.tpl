{{template "base/base.html" .}}
{{define "head"}}
<title>{{"Candy"}} - {{"一个伟大的开始"}}</title>

<link rel="stylesheet" href="/static/css/candy.css"/>
<link rel="stylesheet" href="/static/css/msgbox.css"/>
<link rel="stylesheet" href="/static/css/expression.css"/>
<link rel="stylesheet" href="/static/css/jquery.Jcrop.css"/>
<link rel="stylesheet" href="/static/css/jquery.lightbox-0.5.css"/>
<link rel="stylesheet" href="/static/css/jquery.treetable.css"/>
<link rel="stylesheet" href="/static/css/jquery.treetable.theme.default.css" />
{{end}}
{{define "body"}}
<script>
  var COOKIE_NAME = 'sessionid';
  if( $.cookie(COOKIE_NAME) == undefined || $.cookie(COOKIE_NAME) == "" || $.cookie(COOKIE_NAME) == -1){
      window.location.href="login";
  }
</script>

<div class="main clearfix">
    <div class="panel panel-main">
        <div class="hd">
            <ul class="user-info" id="panel-user-info">
    <li class="avatar" id="user-avatar">
        <a href="#editAvatar"><img src="/static/img/team-avatar.png" alt="avatar" data-grayscale="true" title="点击修改头像"/></a>
    </li>
    <li class="user-nick">
        <strong></strong>
        <span id="user_state" class="i i-on" title="点击切换状态"></span>
        <ul id="user_state_select" class="drop-menu <!--show-->">
            <li stateValue="chat"><span class="i i-on"></span>在线</li>
            <li stateValue="busy"><span class="i i-busy"></span>忙碌</li>
            <li stateValue="away"><span class="i i-left"></span>离开</li>
            <li stateValue="dnd"><span class="i i-nodisturb"></span>勿扰</li>
        </ul>
    </li>
    <li class="trigger setting">
        <span id="user_set" class="i i-setting"></span>
        <ul id="user_set_select" class="drop-menu <!--show-->">
            <li id="user_sound_set"><span class="i i-sd-sound"></span><span id="user_sound_text">关闭声音</span></li>
            <!--<li><span class="i i-sd-sound tgl"></span>打开声音</li>-->
            <li id="user_dest_set"><span class="i i-desk-remind"></span><span id="user_desk_text">关闭通知</span></li>
            <!--<li><span class="i i-desk-remind tgl"></span>关闭通知</li>-->
            <li id="user_info"><span class="i i-user-info"></span><span>个人资料</span></li>
            <li id="user_suggest_set"><span class="i i-suggest"></span>意见反馈</li>
            <li id="user_login_out"><span class="i i-quite"></span>退出</li>
        </ul>
    </li>
</ul>
<div class="signature clearfix">
    <div id="panel-user-signature-div" class="sign-txt wto">
      <span id="panel-user-signature"></span>
      <input type="text" id="panel-user-signature-input" />
    </div>
</div>
<div class="panel-tab" id="j-tabPanelMainHd">
    <ul class="clearfix">
        <li class="selected" rel="recent-contacts" id="recent-contacts"><span class="i i-rc" title="最近会话"></span><span id="msgcounter" class="i i-rmsg-num" style="display:none;"></span></li>
        <li rel="contact" id="tabPanelMainHd-contacts"><span class="i i-contact" title="联系人"></span></li>
        <li rel="group" id="tabPanelMainHd-group"><span class="i i-group" title="群"></span></li>
        <li rel="org-tree" id="tabPanelMainHd-org"><span class="i i-org" title="组织架构"></span></li>
    </ul>
</div>
<div class="search">
    <input type="text" placeholder="搜索：联系人" id="panel-search"/>
    <span class="i i-search"></span>
    <span class="i i-erase" title="关闭"></span>
</div>        </div>
        <div class="bd">
            <div class="panel-cont-tab" id="j-tabPanelMainBd">
    <!--最近会话-->
    <div class="recent-chat" id="jd-recent-contacts">
        <ul class="rc-wrap"></ul>
        <div class="load-more ui-hide">
            <span class="i"></span>
        </div>
    </div>

    <!--联系人-->
    <div class="contact" id="jd-contact">
        <div class="mod-wrap">
        </div>
		<div class="add-group" id="jd-add-group" title="添加分组"><span class="i"></span></div>
	    <div class="modify-group" id="jd-modify-group" title="管理分组"><span class="i"></span></div>
    </div>

    <!--群-->
    <div class="group" id="jd-group">
         <div class="create-group">
             <span class="trigger" id="team-create"><span class="i"></span>创建</span>

         </div>
        <ul class="g-wrap" id="jd-group-items"></ul>
    </div>

    <!-- 组织架构 -->
     <div class="org-tree" id="jd-org-tree">
    </div>

</div>

<!--搜索结果-->
<div class="search-ret ui-hide" id="panel-search-re">
	<!--搜索结果为空：-->
	<!--<div class="sret-null">
        <span>搜索结果：</span>
        <p>抱歉，没有找到相关搜索结果</p>
    </div> -->
</div>
<!--loading-->
<div class="loading show"></div>        </div>
    </div>
	<div class="triangle-flag" style="top:218px;left:439.5px;"></div>
	<div class="oper-menu" style="top:194px;left:50px;">
            <ul class="drop-menu">
            <li id="oper-sendmsg"><span class="i"></span>发送消息</li>
            <li id="oper-sendemail"><span class="i"></span>发送邮件</li>
            <li id="oper-viewinfo" ><span class="i"></span>查看名片</li>
            <li id="oper-move"><span class="i" ></span>移动联系人</li>
            <li id="oper-del"><span class="i"></span>删除联系人</li>
            </ul>
        </div>
    <div class="panel-view" conver="" kind="" style="display:none;">
        <div class="panels-wrap" style="left:0px;">
            <!--聊天-->
            <div class="panel panel-msg">
                <div class="hd">
                    <div class="reback"><!--<span class="i" title="返回"></span>--></div>
<ul class="triggers">
    <li id="send-mail"><span class="i"></span></li>
    <li id="team-share"><span class="i"></span></li>
    <li id="team-temp" class="team-chatwin"><span class="i"></span></li>
</ul>
<div class="title">

</div>
                </div>
                <div class="bd">
                    <div class="msg-wrap">

</div>
<!--
<div class="cls-msg">清屏</div>-->
                </div>
                <div class="bar-wrap">
                    <div class="cls-msg ui-hide" id="clearmonitor">清屏</div>
<div class="l">
    <ul class="clearfix">
        <li id="expressionBtn"><span class="i" title="表情"></span></li>
        <li id="sendFile"><span class="i" title="发送图片或文件"></span><input type="file" name="" title="发送图片或文件"/></li>
        <li id="screenshot"><span class="i" title="截屏"></span></li>
    </ul>
    <div class="iss-tip ui-hide">请先下载安装截图插件（已经安装请忽略），<a href="#" target="_blank">立即下载</a></div>
</div>
<div id="expression"></div>
<div class="m">
    <textarea name="" id="text_in"></textarea>
</div>
<div class="r">
    <div class="send">发送</div>
</div>
                </div>
            </div>

            <!--创建小队-->
            <div class="panel panel-group">
                <div class="hd">
    <div class="reback"><span class="i  team-back"></span></div>
    <div class="title">群成员管理</div>
</div>
<div class="bd">
    <div class="g-member-mgr">
        <ul class="clearfix">
            <li class="member add-member team-add-member" id="team-add-member"><a href="#memberMag"><span class="i"></span></a></li>
        </ul>
    </div>
    <div class="g-name">
        <label for="gName">群名称</label>
        <input type="text" id="gName"/>
    </div>
    <div class="save-temp show" id="team-save-temp">
        <!--临时多人会话时出现-->
        <span class="i selected"></span>
        <p><b>固定成群</b>( 固定成群后就能在群列表中展示，并保存固定关系)</p>
    </div>
    <div class="btn-wrap mt20">
        <div class="btn" id="team-save-btn">保 存</div>
        <div class="btn" id="team-cancel-btn" style="background-color: #D1CDCD;border-bottom: 2px solid #808081;">取消</div>
    </div>
</div>            </div>

            <!--小队共享-->
            <div class="panel panel-g-share">
                 <div class="hd">
    <div class="reback" id="share-back"><span class="i"></span></div>
    <div class="title">群共享</div>
</div>
<div class="bd">
    <div class="btn-wrap">
        <div class="btn" id="share-upload">上传文件<input type="file" name="" title=""/></div>
    </div>
    <div class="g-share">
        <ul id="share-list">
        </ul>
    </div>
</div>            </div>
        </div>
    </div>
</div>
<div id="DdPlayer"></div>



<!--交互所需预加载的dom-->
<div class="oper-menu" style="top:194px;left:50px;">
            <ul class="drop-menu">
            <li id="oper-sendmsg"><span class="i"></span>发送消息</li>
            <li id="oper-sendemail"><span class="i"></span>发送邮件</li>
            <li id="oper-viewinfo" ><span class="i"></span>查看名片</li>
            <li id="oper-move"><span class="i" ></span>移动联系人</li>
            <li id="oper-del"><span class="i"></span>删除联系人</li>
            </ul>
        </div>
<div class="c-opts-menu" style="display:none;" id="create-team-menu">
    <ul class="drop-menu show">
        <li id="create-team1"><span class="i i-c-g"></span>群</li>
        <li id="create-team2"><span class="i i-c-tg" ></span>临时多人会话</li>
    </ul>
</div>


<div id="idcard" style="display: none">
        <div class="idcard">
            <div class="pop-title">名片</div>
            <div class="pop-content clearfix">
                <img class="idcard-img" src="/static/img/img-avatar.png" class="" />
                <ul>
                    <li><strong class="idcard-name">无</strong></li>
                    <li class="idcard-phone">无</li>
                    <li class="idcard-tel"></li>
                    <li class="idcard-email">无</li>
                    <li class="idcard-pos">无</li>
                    <li class="idcard-orgname">无</li>
                </ul>
            </div>
            <div class="pop-bottom">
                <div class="btn-wrap">
                    <a href="javascript:void(0)" class="blue-btn" rel="del">删除联系人</a>
                    <a href="javascript:void(0)" class="green-btn" rel="senmsg">发送消息</a>
                </div>
            </div>
        </div>
    </div>

<div id="addContact" style="display: none">
        <div class="addContact">
            <div class="pop-title">添加联系人</div>
            <div class="pop-content">
                <ul class="exist-wrap">
                </ul>
            </div>
            <div class="pop-bottom">
                <div class="btn-wrap">
                    <a href="javascript:void(0)" class="blue-btn" rel="ok">确 定</a>
                    <a href="javascript:void(0)" class="gray-btn" rel = "close">取 消</a>
                </div>
            </div>
        </div>
    </div>

<div id="addNewContactGroup" style="display: none">
        <div class="add-contact-group">
            <div class="pop-title">新建联系人分组</div>
            <div class="pop-content">
                <label class="acg-named-group">
                    <span>分组名：</span>
                    <input type="text" class="group-name" maxLength="20"/>
                </label>
                <p class="acg-tip">分组名不能超过20个字符</p>
            </div>
            <div class="pop-bottom">
                <div class="btn-wrap">
                    <a href="javascript:void(0)" class="blue-btn" rel="save">保 存</a>
                    <a href="javascript:void(0)" class="gray-btn" rel="close">取 消</a>
                </div>
            </div>
        </div>
    </div>

<div id="groupMgr" style="display: none">
        <div class="group-mgr">
            <div class="pop-title">分组管理</div>
            <div class="pop-content"></div>
            <div class="pop-bottom">
                <div class="btn-wrap">
                    <a href="javascript:void(0)" class="blue-btn" rel="save">保 存</a>
                    <a href="javascript:void(0)" class="gray-btn" rel="close">取 消</a>
                </div>
            </div>
        </div>
    </div>

<div id="tree-org-oper" style="display:none;position:absolute">
 <ul class="drop-menu">
            <li id="org-oper-sendmsg"><span class="i"></span>发送消息</li>
            <li id="org-oper-createteam"><span class="i"></span>创建群</li>
            <li id="org-oper-sendmail" ><span class="i"></span>发送邮件</li>
            <li id="org-oper-add"><span class="i" ></span>添加联系人</li>
  </ul>
</div>
<div class="oper-menu" style="top:194px;left:50px;">
            <ul class="drop-menu">
            <li id="oper-sendmsg"><span class="i"></span>发送消息</li>
            <li id="oper-sendemail"><span class="i"></span>发送邮件</li>
            <li id="oper-viewinfo" ><span class="i"></span>查看名片</li>
            <li id="org-oper-add-erp"><span class="i" ></span>添加联系人</li>
            </ul>
</div>        <!--意见反馈-->
    <div id="suggestion_feedback" style="display: none">
        <div class="suggestion">
            <div class="pop-title">意见反馈</div>
            <div class="pop-content ">
                <textarea  class="sug-textarea suggestion_feedback_input" placeholder="请输入你要反馈的内容"></textarea>
                <p class="sug-tip">您也可以邮件反馈到<a href="mailto:edongdong@jd.com">edongdong@jd.com</a><span class="isPutText" style="color:red"></span></p>
            </div>
            <div class="pop-bottom">
                <div class="btn-wrap">
                    <a  href="javascript:" onclick= "suggestionSend(this)" class="blue-btn suggestion_send" rel="close">发 送</a>
                </div>
            </div>
        </div>
    </div><!--footer-->


<script type="text/javascript" src="/static/lib/jquery/jquery-1.11.1.min.js"></script>
<script type="text/javascript" src="/static/js/jquery.treetable.js"></script>
<script type="text/javascript" src="/static/js/json2.js" charset="utf-8"></script>
<script type="text/javascript" src="/static/js/jquery.lightbox-0.5.js" charset="utf-8"></script>
<script type="text/javascript" src="/static/js/jquery.jplayer.min.js"></script>
<script type="text/javascript" src="/static/js/grayscale.js" charset="utf-8"></script>
<script type="text/javascript" src="/static/js/storage.js" charset="utf-8"></script>
<script type="text/javascript" src="/static/js/require.min.js" data-main="/static/js/main"></script>


<script type="text/javascript" src="/static/js/data-manager.js" charset="utf-8"></script>
<script type="text/javascript" src="/static/js/userInfo.js"></script>

<script type="text/javascript" src="/static/js/contact-menu.js" charset="utf-8"></script>
<script type="text/javascript" src="/static/js/panel-main.js" charset="utf-8"></script>

{{end}}
