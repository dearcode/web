package socket

import (
	"github.com/davygeek/log"
	candy "github.com/dearcode/candy/client"
	"github.com/googollee/go-socket.io"
)

func (s *Server) onRegister(so socketio.Socket) {
	so.On("register detail", func(username, password string) string {
		log.Infof("username:%v, password:%v", username, password)

		c := candy.NewCandyClient("WEB", "127.0.0.1:9000", s)
		if err := c.Start(); err != nil {
			log.Errorf("start client error:%s", err.Error())
			return err.Error()
		}

		id, err := c.Register(username, password)
		if err != nil {
			e := candy.ErrorParse(err.Error())
			log.Errorf("Register code:%v error:%v", e.Code, e.Msg)
			return e.Error()
		}

		log.Infof("userID:%v", id)

		return candy.NewError(0, "register success").Error()
	})
}
