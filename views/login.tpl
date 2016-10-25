{{template "base/base.html" .}}
{{define "head"}}
<title>{{"用户登陆"}}</title>
{{end}}
{{define "body"}}
<!-- Top content -->
<div class="top-content">
    <div class="inner-bg">
        <div class="container">
            <div class="row">
                <div class="col-sm-6 col-sm-offset-3 form-box">
                    <div class="form-top">
                        <div class="form-top-left">
                            <h3>用户登陆</h3>
                            <div id="result" class="result"></div>
                        </div>
                        <div class="form-top-right">
                            <i class="fa fa-key"></i>
                        </div>
                    </div>
                    <div class="form-bottom">
                        <form role="form" action="" method="post" class="login-form">
                            <div class="form-group">
                                <label class="sr-only" for="username">用户名</label>
                                <input type="text" name="username" placeholder="用户名..." class="form-username form-control" id="username">
                            </div>
                            <div class="form-group">
                                <label class="sr-only" for="password">密码</label>
                                <input type="password" name="password" placeholder="密码..." class="form-password form-control" id="password">
                            </div>
                            <button type="submit" class="btn">登陆</button>
                        </form>
                        <div class="link">
                            <a href="register">注册</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
$('form').submit(function(){
   var socket = io();
   var username = $('#username').val();
   if (username == "") {
       $('#result').html("用户名不能为空")
       return;
   }
   var password = $('#password').val();
   if (password == "") {
       $('#result').html("密码不能为空")
       return;
   }

  socket.emit('init type', "login");
  socket.emit('login auth', username, password, function(data) {
     code = checkCode(data);
      if (code != 0) {
          $('#result').html(checkResult(data));
          return;
      }

      id = checkData(data);
      $.cookie("sessionid", id, { expires: 7 }); // 存储一个带7天期限的 cookie
      $.cookie("uid", id, { expires: 7});//用户ID
      $.cookie("aid", username, { expires: 7});//用户名

      window.location.href="/index";
  });

  return false;
});
</script>
{{end}}
