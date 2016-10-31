package meta

import (
	"github.com/dearcode/candy/meta"
)

// FriendList - 好友列表
type FriendList struct {
	meta.FriendList
}

// UserList - 用户列表
type UserList struct {
	meta.UserList
	Count int
}

func NewUserList(c int) *UserList {
	return &UserList{
		Count:    c,
		UserList: meta.UserList{Users: make([]*meta.UserInfo, 0)},
	}
}

func NewUserInfo() *meta.UserInfo {
	return &meta.UserInfo{}
}
