#setup
Add your database name to the following files (replace `example`): 

* maintanance/export.sh
* maintanance/seed.js

Setup your env.json file (see below)

Run:
* npm install 
* mongo < maintanance/seed.js
* nodemon server.js



#Environment
Rename you `example_env.json` to `env.json` and add your correct settings. You can also add other environment settings if you like, e.g. `app_name` or `api_description`. You can use environmental specific settings just like the database schema for mongodb does:

**env.json**
```
{
    "database": {
        "mysql": {
            "username": "myUSer",
            "password": "myPass",
            "url": "localhost",
            "db_name": "myDB"
        },
        "mongo": {
            "db_name": "example"
        }
    }
}
```


**schema.js**
```
var env = require('../v1/helpers/environment').getEnvironment();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Now we can use the settings
mongoose.connect('mongodb://localhost/' + env.database.mongo.db_name); 
```

