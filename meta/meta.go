package meta

import (
	"encoding/json"
	"fmt"

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
	ID string `protobuf:"varint,1,opt,name=ID,json=iD,proto3" json:"ID,omitempty"`
	// Before 前一第消息的ID，用来确定是否有消息丢失
	Before string `protobuf:"varint,2,opt,name=Before,json=before,proto3" json:"Before,omitempty"`
	// Group 如果当前为群聊，设置为群组ID, 否则为0
	Group string `protobuf:"varint,3,opt,name=Group,json=group,proto3" json:"Group,omitempty"`
	// From 发消息的人的ID
	From string `protobuf:"varint,4,opt,name=From,json=from,proto3" json:"From,omitempty"`
	// To 如果当前为私聊，这个设置为收消息用户的ID, 否则为0
	To   string `protobuf:"varint,5,opt,name=To,json=to,proto3" json:"To,omitempty"`
	Body string `protobuf:"bytes,6,opt,name=Body,json=body,proto3" json:"Body,omitempty"`
}

// Event 事件（消息类型）
type Event int32

// 关系
type Relation int32

// 下推的消息，有系统消息(加群，加好友，上线通知啥的)，正常聊天消息
type PushMessage struct {
	// 消息类型，如好友，群，通知， 上线，下线之类的操作
	Event Event `protobuf:"varint,1,opt,name=Event,json=event,proto3,enum=candy.meta.Event" json:"Event,omitempty"`
	// 关系操作，加好友，删除好友，T出群，加入群
	Operate Relation `protobuf:"varint,2,opt,name=Operate,json=operate,proto3,enum=candy.meta.Relation" json:"Operate,omitempty"`
	// 具体消息
	Msg Message `protobuf:"bytes,3,opt,name=Msg,json=msg" json:"Msg"`
	// 这消息到底是发给用户的，还是发给群的
	ToUser bool `protobuf:"varint,4,opt,name=ToUser,json=toUser,proto3" json:"ToUser,omitempty"`
}

// NewMessage - create an new Message
func NewMessage() *Message {
	return &Message{}
}

// ParseMessage - parse Message data
func ParseMessage(m meta.Message) Message {
	return Message{
		ID:     fmt.Sprintf("%v", m.ID),
		Before: fmt.Sprintf("%v", m.Before),
		Group:  fmt.Sprintf("%v", m.Group),
		From:   fmt.Sprintf("%v", m.From),
		To:     fmt.Sprintf("%v", m.To),
		Body:   fmt.Sprintf("%v", m.Body),
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
