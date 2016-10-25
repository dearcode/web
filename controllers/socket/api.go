package socket

import (
	"net/http"

	"github.com/davygeek/log"
	"github.com/dearcode/web/util"
)

func (s *Server) Post() {
	log.Infof("ApiAction POST")
	aid := s.GetString("aid")
	uid, err := s.GetInt64("uid")
	if err != nil {
		log.Errorf("err:%v", err)
		s.handleOK(util.Error(util.ErrUid, err.Error()))
		return
	}

	ptype := s.GetString("ptype")
	pname := s.GetString("pname")

	log.Infof("ptype:%v pname:%v aid:%v uid:%v", ptype, pname, aid, uid)

	switch ptype {
	case "getSelfInfo":
		s.getSelfInfo(uid)
	default:
		log.Errorf("unknow type:%v", ptype)
	}
}

func (s *Server) handleOK(data string) {
	http.Error(s.Ctx.ResponseWriter, data, http.StatusOK)
}

func (s *Server) handleError(data string) {
	http.Error(s.Ctx.ResponseWriter, data, http.StatusBadRequest)
}

func (s *Server) getSelfInfo(uid int64) {
	c, err := s.getClient(uid)
	if err != nil {
		log.Errorf("%v", err)
		s.handleOK(util.Error(util.ErrSessionTimeout, "session timeout"))
		return
	}

	data, err := c.GetUserInfoByID(uid)
	if err != nil {
		log.Errorf("%v", err)
		s.handleOK(util.Error(util.ErrGetUserInfoByID, "getSelfInfo by id error"))
		return
	}

	s.handleOK(data)
}
