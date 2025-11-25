dev:
	npm run dev

install:
	npm run build
	mkdir -p ~/.config/astralis
	rsync -r --delete dist/ ~/.config/astralis/

.PHONY: install dev
