module.exports = {

 // database: process.env.DATABASE || 'mongodb://root:webmaster123@fyned-test-shard-00-00-kzw6z.mongodb.net:27017,fyned-test-shard-00-01-kzw6z.mongodb.net:27017,fyned-test-shard-00-02-kzw6z.mongodb.net:27017/test?ssl=true&replicaSet=fyned-test-shard-0&authSource=admin&retryWrites=true',
//database: process.env.DATABASE || 'mongodb://root:webmaster123@fyned-test-shard-00-00-kzw6z.mongodb.net:27017,fyned-test-shard-00-01-kzw6z.mongodb.net:27018,fyned-test-shard-00-02-kzw6z.mongodb.net:27017/test?ssl=true&replicaSet=fyned-test-shard-0&authSource=admin&retryWrites=true',
database: process.env.DATABASE || 'mongodb://localhost/fyned_db',
  port: process.env.PORT || 3007,
  secret: process.env.SECRET || 'fiverclone2222',

}
