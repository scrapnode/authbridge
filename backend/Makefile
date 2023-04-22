CURRENT_DIR=$(PWD)
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

cleanup:
	rm -rf $(ROOT_DIR)/custom;
	rm -rf $(ROOT_DIR)/src/configs/template.json;

prepare: cleanup
	cp -r $(ROOT_DIR)/../custom $(ROOT_DIR)/custom;
	cp -r $(ROOT_DIR)/../template.json $(ROOT_DIR)/src/configs/template.json;

deploy: prepare
	cd $(ROOT_DIR) && sls deploy && cd $(CURRENT_DIR)

destroy:
	cd $(ROOT_DIR) && sls remove && cd $(CURRENT_DIR)
