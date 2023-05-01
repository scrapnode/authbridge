ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
RESOURCES_STACK_NAME:=$(shell jq -r '.project.id' $(ROOT_DIR)/.template.json)-resources-$(shell jq -r '.project.stage' $(ROOT_DIR)/.template.json)

template:
	node $(ROOT_DIR)/scripts/template-build.js

prepare: template
ifneq ("$(wildcard  $(ROOT_DIR)/.resources.output.json)","")
		jq -s '.[0] * .[1]' $(ROOT_DIR)/.template.json $(ROOT_DIR)/.resources.output.json > $(ROOT_DIR)/.template.output.json
else
		cat $(ROOT_DIR)/.template.json > $(ROOT_DIR)/.template.output.json
endif

resources-cleanup: 
	rm -rf $(ROOT_DIR)/.resources.json
	rm -rf $(ROOT_DIR)/.resources.output.json
	$(MAKE) -f Makefile prepare

resources-deploy: template, resources-cleanup
	node $(ROOT_DIR)/scripts/resources-build.js
	# Certificate for CloudFront Distribution must be at us-east-1
	aws cloudformation deploy --region us-east-1 --stack-name $(RESOURCES_STACK_NAME) --template-file $(ROOT_DIR)/.resources.json
	aws cloudformation wait stack-exists --region us-east-1 --stack-name $(RESOURCES_STACK_NAME)
	node $(ROOT_DIR)/scripts/resources-output-gen.js

resources-destroy: resources-cleanup
	aws cloudformation delete-stack --region us-east-1 --stack-name $(RESOURCES_STACK_NAME)
	aws cloudformation wait stack-delete-complete --region us-east-1 --stack-name $(RESOURCES_STACK_NAME)

all-deploy:  resources-deploy backend-deploy openapi-deploy frontend-deploy

all-destroy: openapi-destroy frontend-destroy backend-destroy resources-destroy

backend-deploy: prepare
	$(MAKE) -f backend/Makefile deploy

backend-destroy:
	$(MAKE) -f backend/Makefile destroy 
	
openapi-deploy: prepare
	$(MAKE) -f openapi/Makefile deploy
	
openapi-destroy:
	$(MAKE) -f openapi/Makefile destroy 

frontend-deploy: prepare
	$(MAKE) -f frontend/Makefile deploy
	
frontend-destroy:
	$(MAKE) -f frontend/Makefile destroy 
