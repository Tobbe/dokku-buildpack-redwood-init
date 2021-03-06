var pm2 = require('pm2')
var fs = require('fs')

pm2.start(
  {
    name: 'minimal-api',
    node_args: '-r dotenv/config',
    script: './node_modules/@redwoodjs/api-server/dist/index.js',
    args: `-f api/dist/functions --socket /tmp/nginx.socket`,
    env: {
      NODE_ENV: 'production',
    },
  },
  function (err) {
    if (err)
      return console.error(
        'Error while launching applications',
        err.stack || err
      )

    console.log('PM2 and application has been succesfully started')

    if (process.env.DYNO) {
      console.log(`Signaling to Nginx buildpack that we're ready to go`)
      fs.openSync('/tmp/app-initialized', 'w')
    }

    // Display logs in standard output
    pm2.launchBus(function (err, bus) {
      console.log('[PM2] Log streaming started')

      bus.on('log:out', function (packet) {
        console.log('[App:%s] %s', packet.process.name, packet.data)
      })

      bus.on('log:err', function (packet) {
        console.error('[App:%s][Err] %s', packet.process.name, packet.data)
      })
    })
  }
)