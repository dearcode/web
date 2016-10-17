package server

import (
	"net/http"

	"github.com/davygeek/log"
	candy "github.com/dearcode/candy/client"
	"github.com/dearcode/candy/meta"
	"github.com/googollee/go-socket.io"
)

// Server - socketio server
type Server struct {
	Clients map[int64]*candy.CandyClient
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
	return &Server{Clients: make(map[int64]*candy.CandyClient)}
}

// Run - run server
func (s *Server) Run() {
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}

	server.On("connection", s.onConnection)
	server.On("error", s.onError)

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./asset")))
	log.Info("Serving at localhost:5000...")
	log.Fatal(http.ListenAndServe(":5000", nil))
}

func (s *Server) onConnection(so socketio.Socket) {
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

func (s *Server) onError(so socketio.Socket, err error) {
	log.Infof("error:", err)
}

func (s *Server) addClient(id int64, c *candy.CandyClient) {
	if client, ok := s.Clients[id]; ok {
		client.Stop()
	}

	s.Clients[id] = c
}

func (s *Server) removeClient(id int64) {
	if client, ok := s.Clients[id]; ok {
		client.Stop()
	}

	delete(s.Clients, id)
}
