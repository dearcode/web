{{template "base/base.html" .}}
{{define "head"}}
<title>{{"Candy"}} - {{"一个伟大的开始"}}</title>
{{end}}
{{define "body"}}
<script>
  var COOKIE_NAME = 'sessionid';
  if( $.cookie(COOKIE_NAME) == undefined || $.cookie(COOKIE_NAME) == "" || $.cookie(COOKIE_NAME) == -1){
      window.location.href="login";
  }
</script>
<div class="friendlist">
    <div class="list-group">
        <a href="#" class="list-group-item"><img src="/static/img/team-avatar.png" />
            用户1
        </a>
        <a href="#" class="list-group-item"><img src="/static/img/team-avatar.png" />
            用户2
        </a>
        <a href="#" class="list-group-item"><img src="/static/img/team-avatar.png" />
            用户3
        </a>
        <a href="#" class="list-group-item"><img src="/static/img/team-avatar.png" />
            用户4
        </a>
        <a href="#" class="list-group-item"><img src="/static/img/team-avatar.png" />
            用户5
        </a>
        <a href="#" class="list-group-item"><img src="/static/img/team-avatar.png" />
            用户6
        </a>
    </div>
</div>
{{end}}
