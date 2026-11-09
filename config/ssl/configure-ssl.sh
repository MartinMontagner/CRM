which mkcert
ERROR_CODE=$?
if [ $ERROR_CODE -gt 0 ]; then
    echo "Please install mkcert"
    { exit 1; }
fi

mkcert -install

CONFIG_DIR="$HOME"/.cocreadores
SSL_DIR="${CONFIG_DIR}/ssl"
mkdir "$CONFIG_DIR"
mkdir "$SSL_DIR"

cd "$SSL_DIR" || exit
mkcert localhost
openssl pkcs12 -export -out localhost.p12 -passout pass:password -in localhost.pem -inkey localhost-key.pem -name localhost