package main

import (
	"github.com/dearcode/web/server"
)

func main() {
	s := server.NewServer()
	s.Run()
}
