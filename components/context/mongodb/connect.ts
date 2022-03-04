// import mongoose from 'mongoose'
// import { configuration } from '@hectare/platform.components.configuration'

// let connection = null

// export const connect = (): Promise<mongoose.Connection> => {
//   return new Promise((resolve, reject) => {
//     mongoose.connection
//       // interceptors
//       .on('error', error => {
//         return reject(error)
//       })
//       .once('open', () => {
//         return resolve(connection)
//       })

//     if (connection) {
//       return resolve(connection)
//     }

//     connection = mongoose.connect(configuration.mongo.host, {
//       dbName: configuration.mongo.name,
//       user: configuration.mongo.username,
//       pass: configuration.mongo.password,
//       autoIndex: configuration.mongo.auto_index
//     })
//   })
// }
