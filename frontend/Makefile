CURRENT_DIR=$(PWD)
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
STACK_NAME:=$(shell jq -r '.project.id' $(ROOT_DIR)/src/configs.json)-frontend-$(shell jq -r '.project.stage' $(ROOT_DIR)/src/configs.json)

cleanup:
	rm -rf $(ROOT_DIR)/src/configs.json;

prepare: cleanup
ifeq (,$(wildcard $(ROOT_DIR)/../backend/.output.json))
		$(MAKE) -f $(ROOT_DIR)/../backend/Makefile output;
endif
	jq 'del(.openapi, .backend)' $(ROOT_DIR)/../.template.output.json > /tmp/authbridge-frontend.configs.json;
	jq -s '.[0] * .[1]' $(ROOT_DIR)/../backend/.output.json /tmp/authbridge-frontend.configs.json > $(ROOT_DIR)/src/configs.json
	cd $(ROOT_DIR) && npm install && cd $(CURRENT_DIR);

deploy: prepare
	cd $(ROOT_DIR) && npm run build && sls deploy && cd $(CURRENT_DIR);

destroy:
	cd $(ROOT_DIR) && sls remove || true && cd $(CURRENT_DIR);
	rm -rf $(ROOT_DIR)/.serverless
