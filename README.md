# Diving app

## To run docker app locally???:

### `docker build -t your-image-name .`
### `docker run -p 8080:8080 -e PORT=8080 your-image-name`


## Aby zrobic deploy na chmurę googla:

### `docker build -t europe-central2-docker.pkg.dev/truedivers/truedivers-repository/backend_diving1 ./backend_diving/`

### `docker push europe-central2-docker.pkg.dev/truedivers/truedivers-repository/frontend_diving1`


## `docker push europe-central2-docker.pkg.dev/truedivers/truedivers-repository/backend_diving1`
## `docker push europe-central2-docker.pkg.dev/truedivers/truedivers-repository/frontend_diving1`
_________ OLD________________