package routers

import (
	"github.com/astaxie/beego"
	"github.com/dearcode/web/controllers"
	"github.com/dearcode/web/controllers/socket"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/login", &controllers.LoginController{})
	beego.Router("/register", &controllers.RegisterController{})
	beego.Router("/socket.io/", &socket.SocketController{})
}
