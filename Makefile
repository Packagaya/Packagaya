.PHONY: install build release run test

install:
	yarn install

build: install
	yarn workspace @packagaya/definitions run build
	yarn workspace @packagaya/config run build
	yarn workspace @packagaya/adapter run build
	yarn workspace @packagaya/template run build
	yarn workspace @packagaya/command run build
	yarn workspace @packagaya/ioc run build
	yarn workspace @packagaya/package run build
	yarn workspace @packagaya/cli run build
	yarn workspace @packagaya/ts-adapter run build
	yarn workspace @packagaya/process run build

release: build
	yarn workspace @packagaya/definitions run semantic-release
	yarn workspace @packagaya/config run semantic-release
	yarn workspace @packagaya/adapter run semantic-release
	yarn workspace @packagaya/template run semantic-release
	yarn workspace @packagaya/command run semantic-release
	yarn workspace @packagaya/ioc run semantic-release
	yarn workspace @packagaya/package run semantic-release
	yarn workspace @packagaya/cli run semantic-release
	yarn workspace @packagaya/ts-adapter run semantic-release
	yarn workspace @packagaya/process run semantic-release

run:
	yarn run cli:dev

test: build
	yarn workspace @packagaya/config run test
