/**
 * PM2 Ecosystem Configuration
 * Configurazione per gestire entrambi gli ambienti (staging e produzione)
 */

module.exports = {
  apps: [
    // ===== STAGING/TEST - adsgmdr.it =====
    {
      name: 'sdarmitalia-server',
      script: './server.js',
      cwd: '/var/www/adsgmdr/sdarmitalia-server',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      error_file: '/var/log/pm2/sdarmitalia-server-error.log',
      out_file: '/var/log/pm2/sdarmitalia-server.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    
    // ===== PRODUCTION - movimentodiriforma.it =====
    {
      name: 'sdarmitalia-prod',
      script: './server.js',
      cwd: '/var/www/movimentodiriforma/sdarmitalia-server',
      instances: 2, // Cluster mode per produzione
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: '/var/log/pm2/sdarmitalia-prod-error.log',
      out_file: '/var/log/pm2/sdarmitalia-prod.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Restart cron per evitare memory leak (opzionale)
      cron_restart: '0 3 * * *' // Restart ogni giorno alle 3:00 AM
    }
  ]
};
