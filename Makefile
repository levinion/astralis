dev:
	npm run dev

install:
	npm run build
	mkdir -p ~/.config/astralis
	rsync -r --delete dist/ ~/.config/astralis/

build:
	npm run build
	docker build -t levinion/astralis .

deploy:
	docker push levinion/astralis:latest

.PHONY: install dev deploy build
