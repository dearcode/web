package socket

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/davygeek/log"
	"github.com/dearcode/web/meta"
	"github.com/dearcode/web/util"
)

func (s *Server) Get() {
	log.Infof("ApiAction GET")
	aid := s.GetString("aid")
	ptype := s.GetString("ptype")
	uid, err := s.GetInt64("uid")
	if err != nil {
		log.Errorf("aid:%v ptype:%v err:%v", aid, ptype, err)
		log.Errorf("maybe has type:%v", s.GetString("type"))
		s.Response(util.Error(util.ErrUid, err.Error()))
		return
	}

	log.Infof("ptype:%v aid:%v uid:%v", ptype, aid, uid)

	switch ptype {
	case "offLineMessageGet":
		s.offlineMessageGet(aid, uid)
	default:
		log.Errorf("unknow get type:%v", ptype)
	}

}

func (s *Server) Post() {
	s.TplName = "post.tpl"
	log.Infof("ApiAction POST")
	aid := s.GetString("aid")
	ptype := s.GetString("ptype")
	uid, err := s.GetInt64("uid")
	if err != nil {
		log.Errorf("aid:%v ptype:%v err:%v", aid, ptype, err)
		log.Errorf("maybe has type:%v", s.GetString("type"))
		s.Response(util.Error(util.ErrUid, err.Error()))
		return
	}

	log.Infof("ptype:%v aid:%v uid:%v", ptype, aid, uid)

	switch ptype {
	case "getSelfInfo":
		s.getSelfInfo(aid, uid)
	case "getUserInfo":
		s.getUserInfo(aid, uid)
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
	case "messageChat":
		s.messageChat(aid, uid)
	case "offLineMessageGet":
		s.offlineMessageGet(aid, uid)
	default:
		log.Errorf("unknow post type:%v", ptype)
	}
}

func (s *Server) Response(data string) {
	http.Error(s.Ctx.ResponseWriter, data, http.StatusOK)
}

func (s *Server) getSelfInfo(aid string, uid int64) {
	userInfo, msg := s._getUserInfo(uid, uid)
	if msg != "" {
		log.Errorf("%v", msg)
		s.Response(msg)
		return
	}

	data, err := json.Marshal(userInfo)
	if err != nil {
		log.Errorf("%v", err)
		s.Response(util.Error(util.ErrMarshalData, err.Error()))
		return
	}

	s.Response(string(data))
}

func (s *Server) getUserInfo(aid string, uid int64) {
	from, err := s.GetInt64("from")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrFrom, err.Error()))
		return
	}

	to, err := s.GetInt64("to")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrTo, err.Error()))
		return
	}

	userInfo, msg := s._getUserInfo(from, to)
	if msg != "" {
		log.Errorf("%v", msg)
		s.Response(msg)
		return
	}

	data, err := json.Marshal(userInfo)
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrMarshalData, err.Error()))
		return
	}

	s.Response(string(data))
}

func (s *Server) _getUserInfo(from, to int64) (*meta.UserInfo, string) {
	c, err := getClient(from)
	if err != nil {
		return nil, util.Error(util.ErrSessionTimeout, "session timeout")
	}

	data, err := c.GetUserInfoByID(to)
	if err != nil {
		return nil, util.Error(util.ErrGetUserInfoByID, "getSelfInfo by id error")
	}
	log.Debugf("data:%v", data)

	userInfo, err := meta.ParseUserInfo([]byte(data))
	if err != nil {
		return nil, util.Error(util.ErrUnmarshalData, "unmarshal UserInfo error")
	}

	return userInfo, ""
}

// getContactStatus 查询联系人状态
func (s *Server) getContactStatus(aid string, uid int64) {
	from, err := s.GetInt64("from")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrFrom, err.Error()))
		return
	}

	to, err := s.GetInt64("to")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrTo, err.Error()))
		return
	}

	log.Debugf("from:%v to:%v", from, to)

	s.Response("{\"Status\":\"chat\", \"Datetime\": \"2016-10-31 17:14:00\"}")
}

// getRecentContact 查询最近联系人列表
func (s *Server) getRecentContact(aid string, uid int64) {
	s.Response("{\"Contacts\": []}")
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
	s.Response("{\"Code\":0}")
}

// getContactList 获取好友列表
func (s *Server) getContactList(aid string, uid int64) {
	from, err := s.GetInt64("from")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrFrom, err.Error()))
		return
	}

	log.Debugf("from:%v", from)
	c, err := getClient(from)
	if err != nil {
		log.Errorf("%v", err)
		s.Response(util.Error(util.ErrSessionTimeout, "session timeout"))
		return
	}

	data, err := c.LoadFriendList()
	if err != nil {
		log.Errorf("%v", err)
		s.Response(util.Error(util.ErrGetUserInfoByID, "LoadFriend list error"))
		return
	}
	log.Debugf("data:%v", data)

	//获取好友详细信息
	list, err := meta.ParseFriendList([]byte(data))
	if err != nil {
		log.Errorf("%v", err)
		s.Response(util.Error(util.ErrParseData, "parse friendlist error"))
		return
	}

	userList := &meta.UserList{Count: 0}
	for _, id := range list.Users {
		fid, err := strconv.ParseInt(id, 10, 64)
		if err != nil {
			log.Errorf("%v", err)
			s.Response(util.Error(util.ErrParseData, "parse friend id error"))
			return
		}

		userInfo, msg := s._getUserInfo(uid, fid)
		if msg != "" {
			log.Errorf("%v", msg)
			s.Response(msg)
			return
		}

		userList.Users = append(userList.Users, userInfo)
	}

	userList.Count = len(userList.Users)

	d, err := json.Marshal(userList)
	if err != nil {
		log.Errorf("%v", err)
		s.Response(util.Error(util.ErrUnmarshalData, "unmarshal userInfo error"))
		return
	}

	log.Debugf("data:%v", string(d))

	s.Response(string(d))
}

// messageChat 消息发送
func (s *Server) messageChat(aid string, uid int64) {
	from, err := s.GetInt64("from")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrFrom, err.Error()))
		return
	}

	log.Debugf("from:%v", from)

	to, err := s.GetInt64("to")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrTo, err.Error()))
		return
	}

	msg := s.GetString("msg")
	if msg == "" {
		log.Errorf("message need not null")
		s.Response(util.Error(util.ErrMsgNull, "message need not null"))
		return
	}

	c, err := getClient(from)
	if err != nil {
		log.Errorf("%v", err)
		s.Response(util.Error(util.ErrSessionTimeout, "session timeout"))
		return
	}

	id, err := c.SendMessage(0, to, msg)
	if err != nil {
		log.Errorf("error:%v", err)
		s.Response(util.Error(util.ErrSendMsg, err.Error()))
		return
	}

	log.Debugf("send success id:%v", id)

	s.Response(fmt.Sprintf("{\"Code\":0, \"Msg\":\"send success\", \"MID\":\"%v\"}", id))
}

func (s *Server) offlineMessageGet(aid string, uid int64) {
	from, err := s.GetInt64("from")
	if err != nil {
		log.Errorf("err:%v", err)
		s.Response(util.Error(util.ErrFrom, err.Error()))
		return
	}

	c, err := getClient(from)
	if err != nil {
		log.Errorf("%v", err)
		s.Response(util.Error(util.ErrSessionTimeout, "session timeout"))
		return
	}

	msgs, err := c.LoadMessage(uid)
	if err != nil {
		log.Errorf("error:%v", err)
		s.Response(util.Error(util.ErrSendMsg, err.Error()))
		return
	}

	log.Debugf("msgs:%v", msgs)

	mlist, err := meta.ParsePushMessageList([]byte(msgs))
	if err != nil {
		log.Errorf("error:%v", err)
		s.Response(util.Error(util.ErrUnmarshalData, err.Error()))
		return
	}

	data, err := json.Marshal(mlist)
	if err != nil {
		log.Errorf("error:%v", err)
		s.Response(util.Error(util.ErrMarshalData, err.Error()))
		return
	}

	s.Response(fmt.Sprintf("{\"Code\": 0, \"Body\":%v}", string(data)))
}
