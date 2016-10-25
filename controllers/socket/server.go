package socket

import (
	"fmt"
	"sync"

	"github.com/astaxie/beego"
	"github.com/davygeek/log"
	candy "github.com/dearcode/candy/client"
	"github.com/dearcode/candy/meta"
	gosocket "github.com/googollee/go-socket.io"
)

// Server - socketio server
type Server struct {
	sync.Mutex
	beego.Controller
	IOServer *gosocket.Server
	Clients  map[int64]*candy.CandyClient
}

type cmdClient struct{}

// OnRecv 这函数理论上是多线程调用，客户端需要注意下
func (c *cmdClient) OnRecv(event int32, operate int32, id int64, group int64, from int64, to int64, body string) {
	log.Debugf("recv msg id:%d event:%v, operate:%v, group:%d, from:%d, to:%d, body:%s\n", id, meta.Event(event), meta.Relation(operate), group, from, to, body)

}

// OnError 连接被服务器断开，或其它错误
func (c *cmdClient) OnError(msg string) {
	log.Errorf("rpc error:%s\n", msg)
}

// OnHealth 连接恢复
func (c *cmdClient) OnHealth() {
	log.Debugf("connection recovery\n")
}

// OnUnHealth 连接异常
func (c *cmdClient) OnUnHealth(msg string) {
	log.Errorf("connection UnHealth, msg:%v\n", msg)
}

func NewServer() *Server {
	s := &Server{Clients: make(map[int64]*candy.CandyClient)}

	server, err := gosocket.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}

	server.On("connection", s.onConnection)
	server.On("error", s.onError)

	s.IOServer = server
	return s
}

func (s *Server) onConnection(so gosocket.Socket) {
	log.Info("on connection")
	so.Join("init")

	so.On("init type", func(msg string) {
		log.Debugf("init type:%v", msg)
		switch msg {
		case "login":
			so.Join("login")
		case "register":
			so.Join("register")
		case "chat":
			so.Join("chat")
		default:
			log.Errorf("unknow type")
		}
	})

	// register register
	s.onRegister(so)

	// register login
	s.onLogin(so)

	// register chat
	s.onChat(so)

	so.On("disconnection", s.onDisConnection)
}

func (s *Server) onDisConnection() {
	log.Info("on disconnect")
}

func (s *Server) onError(so gosocket.Socket, err error) {
	log.Infof("error:", err)
}

func (s *Server) addClient(id int64, c *candy.CandyClient) {
	s.Lock()
	defer s.Unlock()
	if client, ok := s.Clients[id]; ok {
		client.Stop()
		delete(s.Clients, id)
	}

	s.Clients[id] = c
	log.Debugf("Clients:%v Server:%v", s.Clients, &s)
}

func (s *Server) removeClient(id int64) {
	s.Lock()
	defer s.Unlock()
	if client, ok := s.Clients[id]; ok {
		client.Stop()
	}
	delete(s.Clients, id)
}

func (s *Server) getClient(id int64) (*candy.CandyClient, error) {
	s.Lock()
	defer s.Unlock()
	client, ok := s.Clients[id]
	if ok {
		return client, nil
	}

	log.Debugf("Clients:%v Server:%v", s.Clients, &s)
	return nil, fmt.Errorf("%v not exist", id)
}
