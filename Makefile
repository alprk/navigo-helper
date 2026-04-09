start:
	sudo rm -f output/attestation.pdf
	sudo rm -f output/screenshots/*
	docker compose build
	docker compose run runner
	cp output/attestation.pdf ~/Desktop/attestation.pdf
	docker compose run php-cli
	docker compose down --remove-orphans