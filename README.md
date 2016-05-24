# vendor-copy

A utility to copy client-side dependencies into a folder. It looks for a
`vendorCopy` field in your `package.json`, which contains an array of objects, 
each with a `to` and `from` field, which are paths relative to the 
`package.json` file. 
