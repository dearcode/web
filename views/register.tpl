{{template "base/base.html" .}}
{{define "head"}}
<title>{{"用户注册"}}</title>
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
                            <h3>用户注册</h3>
                            <div id="result" class="result"></div>
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
                            <button type="submit" class="btn">注册</button>
                        </form>
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

  socket.emit('init type', "register");
  socket.emit('register detail', username, password, function(data) {
      result = checkResult(data);
      if (result != "成功") {
          $('#result').html(checkResult(data));
          return;
      }

      $('#result').html("注册成功");
      $.cookie("sessionid", -1, { expires: 7 }); // 存储一个带7天期限的 cookie
      setTimeout(function() {
          window.location.href="/index";
      }, 3000);
  });

  return false;
});
</script>
{{end}}
