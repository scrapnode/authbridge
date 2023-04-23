CURRENT_DIR=$(PWD)
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
STACK_NAME:=$(shell jq -r '.project.id' $(ROOT_DIR)/src/configs.json)-openapi-$(shell jq -r '.project.stage' $(ROOT_DIR)/src/configs.json)
AWS_REGION:=$(shell jq -r '.aws.region' $(ROOT_DIR)/src/configs.json)
BUCKET_NAME:=$(shell jq -r '.openapi.s3.bucket.name' $(ROOT_DIR)/src/configs.json)

cleanup:
	rm -rf $(ROOT_DIR)/src/configs.json;

prepare: cleanup
ifeq (,$(wildcard $(ROOT_DIR)/../backend/.output.json))
		$(MAKE) -f $(ROOT_DIR)/../backend/Makefile output;
endif
	jq 'del(.frontend, .backend)' $(ROOT_DIR)/../.template.output.json > /tmp/authbridge-openapi.configs.json;
	jq -s '.[0] * .[1]' $(ROOT_DIR)/../backend/.output.json /tmp/authbridge-openapi.configs.json > $(ROOT_DIR)/src/configs.json
	cd $(ROOT_DIR) && npm install && npm run build && cd $(CURRENT_DIR);

deploy: prepare
	aws cloudformation deploy --region $(AWS_REGION) --stack-name $(STACK_NAME) --template-file $(ROOT_DIR)/.cloudformation.json
	aws cloudformation wait stack-exists --region $(AWS_REGION) --stack-name $(STACK_NAME)
	aws s3 sync $(ROOT_DIR)/build s3://$(BUCKET_NAME) --delete --exclude "*" --include "*.html" --include "*.json"

destroy:
	aws s3 rm --recursive s3://$(BUCKET_NAME)
	aws cloudformation delete-stack --region $(AWS_REGION) --stack-name $(STACK_NAME)
	aws cloudformation wait stack-delete-complete --region $(AWS_REGION) --stack-name $(STACK_NAME)
	rm -rf $(ROOT_DIR)/.cloudformation.jsonn