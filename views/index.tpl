{{template "base/base.html" .}}
{{define "head"}}
<title>{{"Candy"}} - {{"一个伟大的开始"}}</title>
{{end}}
{{define "body"}}
<script>
  var COOKIE_NAME = 'sessionid';
  if( $.cookie(COOKIE_NAME) == "" || $.cookie(COOKIE_NAME) == -1){
      window.location.href="login";
  }
</script>
{{end}}
