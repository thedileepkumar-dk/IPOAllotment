module.exports = {
    apps: [
        {
            name: 'ipo-allotment',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3000',
            exec_mode: 'fork', // One process only
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '300M', // Stricter memory limit for Hostinger
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
