.PHONY: clean install build release run test

clean:
	rm -rf packages/**/tsconfig.tsbuildinfo
	rm -rf packages/**/dist/

install:
	yarn install

build:
	yarn workspace @packagaya/cli run build
	yarn workspace @packagaya/process run build
	yarn workspace @packagaya/ts-adapter run build

release: build
	yarn workspace @packagaya/cache run semantic-release && echo "Executed release for the 'cache' package!" || echo "Could not release the 'cache' package!"
	yarn workspace @packagaya/definitions run semantic-release && echo "Executed release for the 'definitions' package!" || echo "Could not release the 'definitions' package!"
	yarn workspace @packagaya/config run semantic-release && echo "Executed release for the 'config' package!" || echo "Could not release the 'config' package!"
	yarn workspace @packagaya/adapter run semantic-release && echo "Executed release for the 'adapter' package!" || echo "Could not release the 'adapter' package!"
	yarn workspace @packagaya/template run semantic-release && echo "Executed release for the 'template' package!" || echo "Could not release the 'template' package!"
	yarn workspace @packagaya/command run semantic-release && echo "Executed release for the 'command' package!" || echo "Could not release the 'command' package!"
	yarn workspace @packagaya/ioc run semantic-release && echo "Executed release for the 'ioc' package!" || echo "Could not release the 'ioc' package!"
	yarn workspace @packagaya/package run semantic-release && echo "Executed release for the 'package' package!" || echo "Could not release the 'package' package!"
	yarn workspace @packagaya/cli run semantic-release && echo "Executed release for the 'cli' package!" || echo "Could not release the 'cli' package!"
	yarn workspace @packagaya/ts-adapter run semantic-release && echo "Executed release for the 'ts-adapter' package!" || echo "Could not release the 'ts-adapter' package!"
	yarn workspace @packagaya/process run semantic-release && echo "Executed release for the 'process' package!" || echo "Could not release the 'process' package!"

run:
	yarn run cli:dev

test: build
	yarn workspace @packagaya/config run test
