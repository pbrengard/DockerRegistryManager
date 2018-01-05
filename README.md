# DockerRegistryManager
A web interface to control Docker Registries

## About
This project was started to propose a simple interface to manage Docker Repositories, and in particular allow deletion of images declared in the registries.

### Contributors
* [Pierre Brengard](@pbrengard)

## Architecture
* Server-side: [Node.js](http://nodejs.org), [Express](http://expressjs.com/)
* Client-side: [Material-ui](https://material-ui-next.com), [React](https://reactjs.org)

## Build and run

    npm run build
    npm run start

## Delete images
Don't be afraid to delete images which contains layers used by other images. The docker registry backend will automatically detect that and keep those layers.
But first of all, the possibility to delete images in the registry has to be enabled, with one of the following:
* env variable REGISTRY_STORAGE_DELETE_ENABLED=true
* storage.delete.enabled=true in config.yml
See https://docs.docker.com/registry/configuration/#delete
For example, when running the Registry as a Docker container:
    docker run -d -p 5000:5000 --name registry -e "REGISTRY_STORAGE_DELETE_ENABLED=true" registry:2

### Garbage Collect
