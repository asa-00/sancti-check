# Generate a secure JWT secret
openssl rand -base64 32

# Generate a secure OAuth client ID
openssl rand -base64 32

# Generate a secure OAuth client secret
openssl rand -base64 32

# Generate a secure access token secret
openssl rand -base64 32

# Generate a secure refresh token secret
openssl rand -base64 32

# Generate a secure session secret
openssl rand -base64 32

openssl genpkey -algorithm RSA -out ./config/private.key

openssl req -new -x509 -key ./config/private.key -out ./config/certificate.crt -days 365