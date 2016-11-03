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
