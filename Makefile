start:
	sudo rm output/attestation.pdf
	docker compose build
	docker compose run runner
	cp output/attestation.pdf ~/Desktop/attestation.pdf
	docker compose run php-cli
	docker compose down --remove-orphans