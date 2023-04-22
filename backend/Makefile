CURRENT_DIR=$(PWD)
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

cleanup:
	rm -rf $(ROOT_DIR)/custom;
	rm -rf $(ROOT_DIR)/src/configs.json;

prepare: cleanup
	cp -r $(ROOT_DIR)/../custom $(ROOT_DIR)/custom;
	jq 'del(.frontend, .openapi)' $(ROOT_DIR)/../template.json > $(ROOT_DIR)/src/configs.json;

deploy: prepare
	cd $(ROOT_DIR) && npm install && sls deploy && cd $(CURRENT_DIR);

destroy:
	cd $(ROOT_DIR) && sls remove || true && cd $(CURRENT_DIR);
	rm -rf $(ROOT_DIR)/.serverless
	rm -rf $(ROOT_DIR)/.output.json

output: prepare
ifeq (,$(wildcard $(ROOT_DIR)/.serverless/serverless-state.json))
		$(MAKE) -f $(ROOT_DIR)/Makefile deploy;
endif
	node $(ROOT_DIR)/scripts/output-gen.js;
