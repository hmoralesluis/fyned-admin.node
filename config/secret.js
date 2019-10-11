module.exports = {

 // database: process.env.DATABASE || 'mongodb://root:webmaster123@fyned-test-shard-00-00-kzw6z.mongodb.net:27017,fyned-test-shard-00-01-kzw6z.mongodb.net:27017,fyned-test-shard-00-02-kzw6z.mongodb.net:27017/test?ssl=true&replicaSet=fyned-test-shard-0&authSource=admin&retryWrites=true',
//database: process.env.DATABASE || 'mongodb://root:webmaster123@fyned-test-shard-00-00-kzw6z.mongodb.net:27017,fyned-test-shard-00-01-kzw6z.mongodb.net:27018,fyned-test-shard-00-02-kzw6z.mongodb.net:27017/test?ssl=true&replicaSet=fyned-test-shard-0&authSource=admin&retryWrites=true',
// database: process.env.DATABASE || 'mongodb://localhost/fyned_admin_dev_db',
database: process.env.DATABASE || 'mongodb://localhost/fyned_admin_dev_db_1',
  port: process.env.PORT || 3003,
  secret: process.env.SECRET || 'fiverclone2222',
  // upload_file: "../../../Front/Fyned.10/public/images/uploads/",
  // upload_file_movil: "../../../Movil/foodionic_4/src/assets/img/uploads/",

  upload_file: "../../../fyneddelivery.com/html/public/images/uploads/",
  // upload_file_movil: "../../../mobile.fyneddelivery.com/html/src/assets/img/uploads/",


}
