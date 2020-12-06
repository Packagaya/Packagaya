.PHONY: install build run test

install:
	yarn install

build:
	yarn workspace @packagaya/config run build
	yarn workspace @packagaya/ioc run build
	yarn workspace @packagaya/package run build
	yarn workspace @packagaya/cli run build

run:
	yarn run cli:dev

test:
	yarn workspace @packagaya/config run test
