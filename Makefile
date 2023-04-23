template:
	node scripts/template-build.js

all-deploy: backend-deploy openapi-deploy

all-destroy: backend-destroy openapi-destroy

backend-deploy: template
	$(MAKE) -f backend/Makefile deploy

backend-destroy:
	$(MAKE) -f backend/Makefile destroy 
	
openapi-deploy: template
	$(MAKE) -f openapi/Makefile deploy
	
openapi-destroy:
	$(MAKE) -f openapi/Makefile destroy 
