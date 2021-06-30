# Bookmark Chrome Extension

## Build up
1. build the project
```bash
yarn
yarn run build
```
2. Open chrome extension page and upload the build file with unpackage
![alt extension upload](./extension_upload.png)
3. If there was a mistake about sha256, copy the key show on the browser and replace the `"content_security_policy"` in `./build/manifest.json`

## Run in local
> `Warning`: Chrome api does not support in localhost, you should remove those part if you want to test in local
```bash
yarn start
```

## Using Components
* antd
* react-draggable
* react-infinite-scroller
