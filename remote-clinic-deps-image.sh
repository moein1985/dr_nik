set -e

docker rm -f clinic_deps_builder >/dev/null 2>&1 || true

docker run --user 0:0 --name clinic_deps_builder new_invoice-web:v39-contractor-docs sh -lc '
  cd /app
  npm install --no-save --legacy-peer-deps --include=dev tailwindcss@3.4.14 autoprefixer@10.4.20 nodemailer@6.9.15 @types/nodemailer@6.4.16
  node -e "require.resolve(\"tailwindcss\"); require.resolve(\"autoprefixer\"); require.resolve(\"nodemailer\"); console.log(\"deps-ready\")"
'

docker commit clinic_deps_builder new_invoice-web:clinic-deps >/dev/null
docker rm -f clinic_deps_builder >/dev/null

docker run --rm --entrypoint sh new_invoice-web:clinic-deps -lc '
  node -e "require.resolve(\"tailwindcss\"); require.resolve(\"autoprefixer\"); require.resolve(\"nodemailer\"); console.log(\"verified\")"
'

docker image inspect new_invoice-web:clinic-deps --format "{{.Id}} {{.Size}}"
