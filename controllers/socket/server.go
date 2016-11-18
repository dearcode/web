package socket

import (
	"encoding/json"
	"fmt"
	"strconv"
	"sync"
	"time"

	"github.com/astaxie/beego"
	"github.com/davygeek/log"
	candy "github.com/dearcode/candy/client"
	"github.com/dearcode/web/meta"
	gosocket "github.com/googollee/go-socket.io"
)

var Clients map[int64]*candy.CandyClient = make(map[int64]*candy.CandyClient)
var WebClients map[int64]gosocket.Socket = make(map[int64]gosocket.Socket)
var l sync.Mutex

// Server - socketio server
type Server struct {
	beego.Controller
	IOServer *gosocket.Server
}

// OnRecv 这函数理论上是多线程调用，客户端需要注意下
func (s *Server) OnRecv(event int32, operate int32, id int64, group int64, from int64, to int64, body string) {
	log.Debugf("recv msg id:%d event:%v, operate:%v, group:%d, from:%d, to:%d, body:%s\n", id, meta.Event(event), meta.Relation(operate), group, from, to, body)

	//TODO 需要重新处理session获取
	so := WebClients[to]

	//发送消息
	msg := meta.PushMessage{
		Event:   meta.Event(event),
		Operate: meta.Relation(operate),
		Msg: meta.Message{
			ID:         fmt.Sprintf("%v", id),
			Group:      fmt.Sprintf("%v", group),
			From:       fmt.Sprintf("%v", from),
			To:         fmt.Sprintf("%v", to),
			Body:       body,
			CreateTime: fmt.Sprintf("%v", time.Unix(id>>32, 0)),
		},
	}

	data, err := json.Marshal(&msg)
	if err != nil {
		log.Errorf("%v", err)
		return
	}

	so.Emit("chat:message", string(data), func(so gosocket.Socket, data string) {
		log.Debugf("Client ACK with data:%v", data)
	})
}

// OnError 连接被服务器断开，或其它错误
func (s *Server) OnError(msg string) {
	log.Errorf("rpc error:%s\n", msg)
}

// OnHealth 连接恢复
func (s *Server) OnHealth() {
	log.Debugf("connection recovery\n")
}

// OnUnHealth 连接异常
func (s *Server) OnUnHealth(msg string) {
	log.Errorf("connection UnHealth, msg:%v\n", msg)
}

func NewServer() *Server {
	s := &Server{}

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
	log.Infof("on connection so:%v so:%v", so, &so)
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

	so.On("main session", func(sessionid string) {
		log.Debugf("main session sessionid:%v", sessionid)
		id, err := strconv.ParseInt(sessionid, 10, 64)
		if err != nil {
			log.Errorf("%v", err)
			return
		}

		WebClients[id] = so
		log.Debugf("so:%v", so)
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
	log.Error("on disconnect")
}

func (s *Server) onError(so gosocket.Socket, err error) {
	log.Infof("error:", err)
}

func addClient(id int64, c *candy.CandyClient) {
	l.Lock()
	defer l.Unlock()
	if client, ok := Clients[id]; ok {
		//client.Stop()
		log.Debugf("%v", client)
		delete(Clients, id)
	}

	Clients[id] = c
	log.Debugf("Clients:%v", Clients)
}

func removeClient(id int64) {
	l.Lock()
	defer l.Unlock()
	if client, ok := Clients[id]; ok {
		//client.Stop()
		log.Debugf("%v", client)
	}
	delete(Clients, id)
}

func getClient(id int64) (*candy.CandyClient, error) {
	l.Lock()
	defer l.Unlock()
	client, ok := Clients[id]
	if ok {
		return client, nil
	}
	log.Debugf("Clients:%v", Clients)
	return nil, fmt.Errorf("%v not exist", id)
}
