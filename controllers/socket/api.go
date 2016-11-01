package socket

import (
	"encoding/json"
	"net/http"

	"github.com/davygeek/log"
	"github.com/dearcode/web/meta"
	"github.com/dearcode/web/util"
)

func (s *Server) Get() {

}

func (s *Server) Post() {
	s.TplName = "post.tpl"
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
	case "getContactList":
		s.getContactList(aid, uid)
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
	data, msg := s.getUserInfo(uid, uid)
	if msg != "" {
		log.Errorf("%v", msg)
		s.handleOK(msg)
	}

	s.handleOK(string(data))
}

func (s *Server) getUserInfo(from, to int64) ([]byte, string) {
	c, err := getClient(from)
	if err != nil {
		return nil, util.Error(util.ErrSessionTimeout, "session timeout")
	}

	data, err := c.GetUserInfoByID(to)
	if err != nil {
		return nil, util.Error(util.ErrGetUserInfoByID, "getSelfInfo by id error")
	}
	log.Debugf("data:%v", data)

	return []byte(data), ""
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

	s.handleOK("{\"Status\":\"chat\", \"Datetime\": \"2016-10-31 17:14:00\"}")
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

// getContactList 获取好友列表
func (s *Server) getContactList(aid string, uid int64) {
	from, err := s.GetInt64("from")
	if err != nil {
		log.Errorf("err:%v", err)
		s.handleOK(util.Error(util.ErrFrom, err.Error()))
		return
	}

	log.Debugf("from:%v", from)
	c, err := getClient(from)
	if err != nil {
		log.Errorf("%v", err)
		s.handleOK(util.Error(util.ErrSessionTimeout, "session timeout"))
		return
	}

	data, err := c.LoadFriendList()
	if err != nil {
		log.Errorf("%v", err)
		s.handleOK(util.Error(util.ErrGetUserInfoByID, "LoadFriend list error"))
		return
	}
	log.Debugf("data:%v", data)

	//获取好友详细信息
	list := &meta.FriendList{}
	err = json.Unmarshal([]byte(data), list)
	if err != nil {
		log.Errorf("%v", err)
		s.handleOK(util.Error(util.ErrUnmarshalData, "Unmarshal friendList error"))
		return
	}

	userList := meta.NewUserList(len(list.Users))
	log.Debugf("list:%v", list)
	for _, userID := range list.Users {
		data, msg := s.getUserInfo(uid, userID)
		if msg != "" {
			log.Errorf("%v", msg)
			s.handleOK(msg)
			return
		}

		userInfo := meta.NewUserInfo()
		err = json.Unmarshal(data, userInfo)
		if err != nil {
			log.Errorf("%v", err)
			s.handleOK(util.Error(util.ErrUnmarshalData, "unmarshal userInfo error"))
			return
		}

		userList.Users = append(userList.Users, userInfo)
	}

	d, err := json.Marshal(userList)
	if err != nil {
		log.Errorf("%v", err)
		s.handleOK(util.Error(util.ErrUnmarshalData, "unmarshal userInfo error"))
		return
	}

	s.handleOK(string(d))
}
