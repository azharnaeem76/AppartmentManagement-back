const path = require('path')
const dotEnv = require('dotenv')

// Set the path to the environment file based on NODE_ENV
const envFilePath = path.resolve(
  __dirname,
  '..',
  `.env.${process.env.NODE_ENV}`
)

// Load environment variables from the specified file
const envConfig = dotEnv.config({ path: envFilePath })
// Create an object to return the PORT value from the loaded environment variables
const config = {
  PORT: envConfig.parsed.PORT,
  NODE_ENV: envConfig.parsed.NODE_ENV,
  db: {
    dialect:envConfig.parsed.dialect,
    db_host: envConfig.parsed.db_host,
    db_port: envConfig.parsed.db_port,
    database: envConfig.parsed.database,
    db_username: envConfig.parsed.db_username,
    db_password: envConfig.parsed.db_password,
  },
  pool:{
    max: envConfig.parsed.pool_max,
    min: envConfig.parsed.pool_min,
    acquire: envConfig.parsed.acquire,
    idle: envConfig.parsed.idle
  },
  JWT: {
    SECRET: envConfig.parsed.JWT_SECRET,
    SECRET_ACCESS_TOKEN: envConfig.parsed.SECRET_ACCESS_TOKEN,
  },
  EMAIL_USER: envConfig.parsed.EMAIL_USER,
  EMAIL_PASSWORD: envConfig.parsed.EMAIL_PASSWORD,
//   Twillio: {
//     TWILIO_ACCOUNT_SID: envConfig.parsed.TWILIO_ACCOUNT_SID,
//     TWILIO_AUTH_TOKEN: envConfig.parsed.TWILIO_AUTH_TOKEN,
//   },
//   AWS: {
//     AWS_ACCESS_KEY_ID: envConfig.parsed.AWS_ACCESS_KEY_ID,
//     AWS_SECRET_ACCESS_KEY: envConfig.parsed.AWS_SECRET_ACCESS_KEY,
//     AWS_BUCKET_NAME: envConfig.parsed.AWS_BUCKET_NAME,
//   },
//   Contract: {
//     CONTRACT_PRIVATE_KEY: envConfig.parsed.CONTRACT_PRIVATE_KEY,
//     CONTRACT_ADDRESS: envConfig.parsed.CONTRACT_ADDRESS,
//   },
//   firebase:{
//     type: envConfig.parsed.firebase_type,
//     project_id: envConfig.parsed.firebase_project_id,
//     private_key_id: envConfig.parsed.firebase_private_key_id,
//     private_key: envConfig.parsed.firebase_private_key,
//     client_email: envConfig.parsed.firebase_client_email,
//     client_id: envConfig.parsed.firebase_client_id,
//     auth_uri: envConfig.parsed.firebase_auth_uri,
//     token_uri: envConfig.parsed.firebase_token_uri,
//     auth_provider_x509_cert_url: envConfig.parsed.firebase_auth_provider_x509_cert_url,
//     client_x509_cert_url: envConfig.parsed.firebase_client_x509_cert_url,
//     universe_domain: envConfig.parsed.firebase_universe_domain,
//     databaseURL:envConfig.parsed.firebase_databaseURL
//   },

}


module.exports = config
