package util

const (
	// ErrOK 成功
	ErrOK int32 = 0
	// ErrFailure 未知错误
	ErrFailure = 1

	// ErrNotAuthor
	ErrNotAuthor = 5000
	// ErrUid
	ErrUid = 5001
	// ErrSessionTimeout
	ErrSessionTimeout = 5002
	// ErrGetUserInfoByID
	ErrGetUserInfoByID = 5003
	// ErrFrom
	ErrFrom = 5004
	// ErrTo
	ErrTo = 5005
	// ErrType
	ErrType = 5006
	// ErrUnmarshalData
	ErrUnmarshalData = 5007
	// ErrMarshalData
	ErrMarshalData = 5008
	// ErrParseData
	ErrParseData = 5009
	// ErrMsgNull
	ErrMsgNull = 5010
	// ErrSendMsg
	ErrSendMsg = 5011
	// ErrPushMessage
	ErrPushMessage = 5012
)
