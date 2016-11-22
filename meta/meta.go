package meta

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/dearcode/candy/meta"
)

// UserInfo - user base info
type UserInfo struct {
	ID        string `json:"ID"`
	Name      string `json:"Name"`
	NickName  string `json:"NickName"`
	Avatar    string `json:"Avatar"`
	Signature string `json:"Signature"`
}

// UserList - a list of user, contains user base info
type UserList struct {
	Users []*UserInfo `json:"Users"`
	Count int         `json:"Count"`
}

// FriendList - frined string id list
type FriendList struct {
	Users []string `json:"Users"`
}

// NewUserList - create an new UserList object
func NewUserList(c int) *UserList {
	return &UserList{
		Count: c,
		Users: make([]*UserInfo, 0),
	}
}

// NewUserInfo - create an new UserInfo object
func NewUserInfo() *UserInfo {
	return &UserInfo{}
}

// ParseUserInfo - parse meta.UserInfo json data to UserInfo object
func ParseUserInfo(data []byte) (*UserInfo, error) {
	u := &meta.UserInfo{}
	if err := json.Unmarshal(data, u); err != nil {
		return nil, err
	}

	return &UserInfo{
		ID:        fmt.Sprintf("%v", u.ID),
		Name:      u.Name,
		NickName:  u.NickName,
		Avatar:    u.Avatar,
		Signature: u.Signature,
	}, nil
}

// ParseUserList - parse meta.UserList json data to UserList object
func ParseUserList(data []byte) (*UserList, error) {
	l := &meta.UserList{}
	if err := json.Unmarshal(data, l); err != nil {
		return nil, err
	}

	list := &UserList{Users: make([]*UserInfo, 0), Count: len(l.Users)}
	for _, info := range l.Users {
		list.Users = append(list.Users, &UserInfo{
			ID:        fmt.Sprintf("%v", info.ID),
			Name:      info.Name,
			Avatar:    info.Avatar,
			Signature: info.Signature,
		})
	}

	return list, nil
}

// ParseFriendList - parse friend string id list to FriendList object
func ParseFriendList(data []byte) (*FriendList, error) {
	l := &meta.FriendList{}
	if err := json.Unmarshal(data, l); err != nil {
		return nil, err
	}

	friendList := &FriendList{Users: make([]string, 0)}
	for _, id := range l.Users {
		friendList.Users = append(friendList.Users, fmt.Sprintf("%v", id))
	}

	return friendList, nil
}

type Message struct {
	ID string `json:"ID"`
	// Before 前一第消息的ID，用来确定是否有消息丢失
	Before string `json:"Before"`
	// Group 如果当前为群聊，设置为群组ID, 否则为0
	Group string `json:"Group"`
	// From 发消息的人的ID
	From string `json:"From"`
	// To 如果当前为私聊，这个设置为收消息用户的ID, 否则为0
	To   string `json:"To"`
	Body string `json:"Body"`
	// CreateTime 创建时间
	CreateTime string `json:"CreateTime"`
}

// Event 事件（消息类型）
type Event int32

// 关系
type Relation int32

// 下推的消息，有系统消息(加群，加好友，上线通知啥的)，正常聊天消息
type PushMessage struct {
	// 消息类型，如好友，群，通知， 上线，下线之类的操作
	Event Event `json:"Event"`
	// 关系操作，加好友，删除好友，T出群，加入群
	Operate Relation `json:"Operate"`
	// 具体消息
	Msg Message `json:"Msg"`
	// 这消息到底是发给用户的，还是发给群的
	ToUser bool `json:"ToUser"`
}

// NewMessage - create an new Message
func NewMessage() *Message {
	return &Message{}
}

// ParseMessage - parse Message data
func ParseMessage(m meta.Message) Message {
	return Message{
		ID:         fmt.Sprintf("%v", m.ID),
		Before:     fmt.Sprintf("%v", m.Before),
		Group:      fmt.Sprintf("%v", m.Group),
		From:       fmt.Sprintf("%v", m.From),
		To:         fmt.Sprintf("%v", m.To),
		Body:       fmt.Sprintf("%v", m.Body),
		CreateTime: fmt.Sprintf("%v", time.Unix(m.ID>>32, 0)),
	}
}

// ParsePushMessage - parse PushMessage data
func ParsePushMessageList(data []byte) ([]*PushMessage, error) {
	pl := make([]*meta.PushMessage, 0)
	if err := json.Unmarshal(data, &pl); err != nil {
		return nil, err
	}

	rl := make([]*PushMessage, 0)
	for _, item := range pl {
		i := &PushMessage{
			Event:   Event(item.Event),
			Operate: Relation(item.Operate),
			Msg:     ParseMessage(item.Msg),
			ToUser:  item.ToUser,
		}
		rl = append(rl, i)
	}
	return rl, nil
}
