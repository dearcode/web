all: lint server

golint:
	go get github.com/golang/lint/golint  

godep:
	go get github.com/tools/godep

.PHONY: server 

lint: golint
	golint ./

clean:
	@rm -rf bin

fmt:
	gofmt -s -l -w .
	goimports -l -w .

vet:
	go tool vet . 2>&1
	go tool vet --shadow . 2>&1


server: godep
	@go tool vet ./ 2>&1
	@echo "make server"
	go build -ldflags '$(LDFLAGS)' -o bin/web main.go

test:
	@go test ./socket/

