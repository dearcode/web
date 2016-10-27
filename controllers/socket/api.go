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

	log.Infof("ptype:%v aid:%v uid:%v", ptype, aid, uid)

	switch ptype {
	case "getSelfInfo":
		s.getSelfInfo(aid, uid)
	case "getContactStatus":
		s.getContactStatus(aid, uid)
	case "getRecentContact":
		s.getRecentContact(aid, uid)
	case "batchContactStatus":
		s.batchContactStatus(aid, uid)
	case "setSignature":
		s.setSignature(aid, uid)
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

func (s *Server) getSelfInfo(aid string, uid int64) {
	c, err := getClient(uid)
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
	log.Debugf("data:%v", data)

	s.handleOK(data)
}

// getContactStatus 查询联系人状态
func (s *Server) getContactStatus(aid string, uid int64) {
	from, err := s.GetInt64("from")
	if err != nil {
		log.Errorf("err:%v", err)
		s.handleOK(util.Error(util.ErrFrom, err.Error()))
		return
	}

	to, err := s.GetInt64("to")
	if err != nil {
		log.Errorf("err:%v", err)
		s.handleOK(util.Error(util.ErrTo, err.Error()))
		return
	}

	log.Debugf("from:%v to:%v", from, to)

	s.handleOK("{\"Status\":\"busy\"}")
}

// getRecentContact 查询最近联系人列表
func (s *Server) getRecentContact(aid string, uid int64) {

}

// batchContactStatus 查询联系人状态
func (s *Server) batchContactStatus(aid string, uid int64) {
	pnames := s.GetString("pnames")
	log.Debugf("pnames:%v", pnames)
}

// setSignature 设置签名
func (s *Server) setSignature(aid string, uid int64) {
	signature := s.GetString("signature")
	log.Debugf("signature:%v", signature)
	s.handleOK("{\"Code\":0}")
}
