package util

import (
	candy "github.com/dearcode/candy/client"
)

func Error(code int32, msg string) string {
	e := candy.NewError(code, msg)
	return e.Error()
}
