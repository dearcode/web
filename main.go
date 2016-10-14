package main

import (
	"fmt"
	"net/http"

	"github.com/davygeek/log"
	"github.com/googollee/go-socket.io"
)

func main() {
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}
	server.On("connection", func(so socketio.Socket) {
		log.Info("on connection")
		so.Join("chat")
		so.On("chat message", func(msg string) {
			m := make(map[string]interface{})
			m["a"] = "你好"
			e := so.Emit("cn1111", m)
			//这个没有问题
			fmt.Printf("\n\n")

			b := make(map[string]string)
			b["u-a"] = "中文内容" //这个不能是中文
			m["b-c"] = b
			e = so.Emit("cn2222", m)
			log.Info(e)

			log.Infof("emit:", so.Emit("chat message", msg))
			so.BroadcastTo("chat", "chat message", msg)
		})

		// User Author
		// username#userpasswd
		so.On("chat auth", func(username, password string) string {
			log.Infof("username:%v, password:%v", username, password)
			return "login success"
		})

		// For this example it is "string" type
		so.On("chat message with ack", func(msg string) string {
			return msg
		})

		so.On("disconnection", func() {
			log.Info("on disconnect")
		})
	})

	server.On("error", func(so socketio.Socket, err error) {
		log.Infof("error:", err)
	})

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./asset")))
	log.Info("Serving at localhost:5000...")
	log.Fatal(http.ListenAndServe(":5000", nil))
}
