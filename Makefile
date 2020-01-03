NAME := input-shortcutkey

.PHONY: build clean

build:
	@cd ./dist && \
	zip -r ../$(NAME).xpi icons js options.html manifest.json

clean:
	rm -rf ./dist ./node_modules $(NAME).xpi
