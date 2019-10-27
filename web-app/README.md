# web-app

## To Do

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

## To Recreate the web-app Image 

After make the modifications in vue pages you need to run

```
npm run build
```

to generate the files to run inside the docker container

after that you need to rebuild the image running inside the web-app folder

```
docker build .
```

OR

```
docker build . -t alfa_web-app
```

If alfa_web-app container persists to don't update you need to remove the imagem

```
docker rmi alfa_web-app
```

and run 

```
docker-compose build
docker-compose up 
```

again

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
