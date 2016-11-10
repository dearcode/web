package socket

import (
	"fmt"

	"github.com/davygeek/log"
	candy "github.com/dearcode/candy/client"
	"github.com/googollee/go-socket.io"
)

func (s *Server) onLogin(so socketio.Socket) {
	// User Author
	// username#userpasswd
	so.On("login auth", func(username, password string) string {
		log.Infof("username:%v, password:%v", username, password)

		c := candy.NewCandyClient("WEB", "127.0.0.1:9000", &cmdClient{})
		if err := c.Start(); err != nil {
			log.Errorf("start client error:%s", err.Error())
			return err.Error()
		}

		id, err := c.Login(username, password)
		if err != nil {
			e := candy.ErrorParse(err.Error())
			log.Errorf("Login code:%v error:%v", e.Code, e.Msg)
			return e.Error()
		}

		addClient(id, c)

		return candy.NewData(0, "login success", fmt.Sprintf("%v", id)).Error()
	})
}
