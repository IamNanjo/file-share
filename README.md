# File share

![Image of the UI](https://student.labranet.jamk.fi/~AB6262/images/file-share.webp)

Simple web app for uploading files on a server.
Creates links to those files after a succesful upload.

## Config

The configuration is done using environment variables

- NODE_ENV (set to "production" to use a secure connection and port specified by FILE_SHARE_PORT)
- SSL_KEY_PATH (path to SSL key e.g. /etc/letsencrypt/live/nanjo.tech/privkey.pem)
- SSL_CERT_PATH (path to SSL certificate e.g. /etc/letsencrypt/live/nanjo.tech/fullchain.pem)
- FILE_SHARE_PORT (port for the server)
- FILE_SHARE_HASH (bcrypt hash for the password. Without this the app will not require a password)
