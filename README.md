Homework 3: Proxies, Queues, Cache Fluency
=========================

### Setup

* Clone this repo, run `npm install`.
* Install redis and run on localhost:6379
* Run sudo node main.js to start the server

###URLs
Visit the following URLs at `localhost/<url>` or `localhost:3000/<url>` or `localhost:3001/<url>`
* /set: Sets a key with the message "this message will self-destruct in 10 seconds"
* /get: Displays the key set by the /set URL
* /recent: Displays a lit of the lastest 5 URLs visited.
* /upload: Use the curl command `curl -F "image=@./img/<filename>" localhost:3000/upload` to upload an image to the image queue.
* /meow: Displays the most recent image pushed into the queue and also remove it

### Screencast:
https://youtu.be/Yxtm8gDbJy0