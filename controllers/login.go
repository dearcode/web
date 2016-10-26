package controllers

import (
	"github.com/astaxie/beego"
	"github.com/davygeek/log"
)

type LoginController struct {
	beego.Controller
}

func (c *LoginController) Get() {
	c.TplName = "login.tpl"
	log.Debugf("LoginController:%v", &c)
}
