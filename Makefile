start:
	docker compose build
	docker compose run runner
	cp output/attestation.pdf ~/Desktop/attestation.pdf
	docker compose down --remove-orphans