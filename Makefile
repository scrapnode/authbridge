template:
	node scripts/template-build.js

deploy-backend: template
	$(MAKE) -f backend/Makefile deploy

destroy-backend:
	$(MAKE) -f backend/Makefile destroy 