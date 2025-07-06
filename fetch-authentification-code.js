import imaps from 'imap-simple';
import 'dotenv/config';

const { IMAP_USER, IMAP_PASS, IMAP_HOST, IMAP_PORT } = process.env;

export async function getValidationCode() {
    const config = {
        imap: {
            user: IMAP_USER,
            password: IMAP_PASS,
            host: IMAP_HOST,
            port: IMAP_PORT,
            tls: true,
            authTimeout: 3000,
            tlsOptions: {
                rejectUnauthorized: false
            },
            // uncomment to debug imap connection
            // debug: console.log,
        }
    };

    return await imaps.connect(config).then(function (connection) {
        return connection.openBox('INBOX').then(function () {

            // Fetch unread emails from today
            var searchCriteria = ['UNSEEN', ['SINCE', Date.now()]];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: true,
            };

            return connection.search(searchCriteria, fetchOptions).then(function (results) {

                var subjectOfEmailPattern = /Code de vérification/i;
                var senderOfEmailPattern = /iledefrance-mobilites\.fr/i;

                const emails = results
                    .filter(function (res) {
                        var headerPart = res.parts.find(function (part) {
                            return part.which === 'HEADER';
                        });
                        if (!headerPart) return false;
                        var subject = headerPart.body.subject && headerPart.body.subject[0];
                        var sender = headerPart.body.from && headerPart.body.from[0];
                        return (
                            subject && subjectOfEmailPattern.test(subject) &&
                            sender && senderOfEmailPattern.test(sender)
                        );
                    })
                    .map(function (res) {

                        var headerPart = res.parts.find(function (part) {
                            return part.which === 'HEADER';
                        });
                        var textPart = res.parts.find(function (part) {
                            return part.which === 'TEXT';
                        });

                        return {
                            subject: headerPart ? headerPart.body.subject[0] : null,
                            text: textPart ? textPart.body : null
                        };
                    });

                const mostRecentMatchingEmail = emails[emails.length - 1];

                if (mostRecentMatchingEmail && mostRecentMatchingEmail.text) {
                    const regex = /\b\d{5}\b/;

                    return mostRecentMatchingEmail.text.match(regex)[0];
                }

                throw Error('Email not Found...');
            });
        });
    })
}