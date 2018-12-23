

See the example directory.

Run:

```bash 
$ node example/server.js

```

then POST data to the server:

``` bash
$ curl -i -X POST -H 'Content-Type: application/json' -d '["one","two","three","four"]' http://localhost:6969
```

This is an elaborate way to read a JSON array, send all the items of the array to a child
process. The child process receives all of the items in the array, and processes them
and then sends them back to the parent, which which then writes the data to the response stream.
