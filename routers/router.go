package routers

import (
	"github.com/astaxie/beego"
	"github.com/dearcode/web/controllers"
	"github.com/dearcode/web/controllers/socket"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/index", &controllers.MainController{})
	beego.Router("/login", &controllers.LoginController{})
	beego.Router("/register", &controllers.RegisterController{})

	s := socket.NewServer()
	s.Run()

	beego.Handler("/socket.io/", s.IOServer)
}
