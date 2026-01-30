const { Server } = require('socket.io');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

class KOTHServer {
  constructor() {
    this.server = http.createServer();
    this.io = new Server(this.server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.clients = new Map(); // teamId -> { socket, instanceId, dockerContainer, isAdmin, adminSince }
    this.adminHistory = [];
    this.currentAdmin = null;
    this.adminStartTime = null;
    
    this.setupSocketServer();
  }

  setupSocketServer() {
    this.io.on('connection', (socket) => {
      const { teamId, instanceId } = socket.handshake.query;

      if (!teamId || !instanceId) {
        socket.disconnect(true);
        return;
      }

      console.log(`Team ${teamId} connected with instance ${instanceId}`);

      // Create Docker container for this team
      this.createDockerInstance(teamId, instanceId, socket);
    });
  }

  async createDockerInstance(teamId, instanceId, socket) {
    try {
      // Start a vulnerable Docker container (Ubuntu with pre-installed vulnerable services)
      const dockerCommand = [
        'run', '-it', '--rm', 
        '--name', `koth-${instanceId}`,
        '-d',
        '--cap-add=SYS_PTRACE', // For debugging
        'koth-vulnerable-machine' // Custom Docker image with vulnerabilities
      ];

      const dockerProcess = spawn('docker', dockerCommand);
      
      let containerId = '';
      dockerProcess.stdout.on('data', (data) => {
        containerId = data.toString().trim();
        console.log(`Container ${containerId} created for team ${teamId}`);
      });

      dockerProcess.on('close', (code) => {
        if (code === 0 && containerId) {
          this.setupClientConnection(teamId, instanceId, socket, containerId);
        } else {
          socket.emit('message', JSON.stringify({
            type: 'error',
            message: 'Failed to create container. Using simulation mode.'
          }));
          this.setupSimulationMode(teamId, instanceId, socket);
        }
      });

      dockerProcess.on('error', (error) => {
        console.error(`Docker error for team ${teamId}:`, error);
        socket.emit('message', JSON.stringify({
          type: 'error',
          message: 'Docker not available. Using simulation mode.'
        }));
        this.setupSimulationMode(teamId, instanceId, socket);
      });

    } catch (error) {
      console.error(`Error creating container for team ${teamId}:`, error);
      this.setupSimulationMode(teamId, instanceId, socket);
    }
  }

  setupClientConnection(teamId, instanceId, socket, containerId) {
    this.clients.set(teamId, {
      socket,
      instanceId,
      containerId,
      isAdmin: false,
      adminSince: null,
      lastCommand: Date.now(),
      installedPackages: new Set(['curl', 'wget', 'vim', 'nano', 'git', 'python3', 'nodejs']), // Pre-installed packages
      filesystem: {
        '/home/user': ['flag.txt', 'backup.txt', 'notes.txt', 'exploit.py'],
        '/etc': ['passwd', 'shadow', 'hosts', 'crontab', 'sudoers'],
        '/var/log': ['auth.log', 'syslog', 'apache2.log'],
        '/tmp': ['exploit.py', 'payload.sh', '.hidden_file'],
        '/usr/bin': ['nc', 'ncat', 'nmap', 'wget', 'curl', 'python3', 'nodejs', 'gcc']
      }
    });

    // Handle incoming messages
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'command') {
          this.handleCommand(teamId, data.command);
        }
      } catch (error) {
        console.error(`Error handling message from ${teamId}:`, error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(teamId);
    });

    // Send initial status
    this.sendAdminStatus();
  }

  setupSimulationMode(teamId, instanceId, socket) {
    // Simulation mode for when Docker is not available
    this.clients.set(teamId, {
      socket,
      instanceId,
      containerId: 'simulation',
      isAdmin: false,
      adminSince: null,
      lastCommand: Date.now(),
      installedPackages: new Set(['curl', 'wget', 'vim', 'nano', 'git', 'python3', 'nodejs']), // Pre-installed packages
      filesystem: {
        '/home/user': ['flag.txt', 'backup.txt', 'notes.txt', 'exploit.py'],
        '/etc': ['passwd', 'shadow', 'hosts', 'crontab', 'sudoers'],
        '/var/log': ['auth.log', 'syslog', 'apache2.log'],
        '/tmp': ['exploit.py', 'payload.sh', '.hidden_file'],
        '/usr/bin': ['nc', 'ncat', 'nmap', 'wget', 'curl', 'python3', 'nodejs', 'gcc']
      }
    });

    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'command') {
          this.handleSimulatedCommand(teamId, data.command);
        }
      } catch (error) {
        console.error(`Error handling message from ${teamId}:`, error);
      }
    });

    socket.on('disconnect', () => {
      this.handleDisconnection(teamId);
    });

    // Send welcome message for simulation
    setTimeout(() => {
      socket.emit('message', '\\x1b[1;33m=== UBUNTU 20.04 LTS SIMULATION ===\\x1b[0m\\r\\n');
      socket.emit('message', 'Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-192-generic x86_64)\\r\\n\\r\\n');
      socket.emit('message', '\\x1b[1;32m * Documentation:  https://help.ubuntu.com\\x1b[0m\\r\\n');
      socket.emit('message', '\\x1b[1;32m * Management:     https://landscape.canonical.com\\x1b[0m\\r\\n');
      socket.emit('message', '\\x1b[1;32m * Support:        https://ubuntu.com/advantage\\x1b[0m\\r\\n\\r\\n');
      socket.emit('message', '\\x1b[1;33mSystem information as of ' + new Date().toLocaleString() + '\\x1b[0m\\r\\n\\r\\n');
      socket.emit('message', '  System load:  0.08              Processes:       95\\r\\n');
      socket.emit('message', '  Usage of /:   45.1% of 9.78GB   Users logged in: 2\\r\\n');
      socket.emit('message', '  Memory usage: 23%                IP address:      192.168.1.100\\r\\n');
      socket.emit('message', '  Swap usage:   0%\\r\\n\\r\\n');
      socket.emit('message', '\\x1b[1;31m⚠️  WARNING: This is a vulnerable machine for CTF purposes!\\x1b[0m\\r\\n');
      socket.emit('message', 'Last login: ' + new Date().toLocaleString() + ' from 192.168.1.1\\r\\n');
      socket.emit('message', 'user@koth-machine:~$ ');
    }, 1000);

    this.sendAdminStatus();
  }

  handleCommand(teamId, command) {
    const client = this.clients.get(teamId);
    if (!client) return;

    client.lastCommand = Date.now();

    if (client.containerId === 'simulation') {
      this.handleSimulatedCommand(teamId, command);
    } else {
      this.executeInContainer(teamId, command);
    }
  }

  executeInContainer(teamId, command) {
    const client = this.clients.get(teamId);
    if (!client || !client.containerId) return;

    try {
      const execProcess = spawn('docker', ['exec', '-it', client.containerId, 'bash', '-c', command]);
      
      execProcess.stdout.on('data', (data) => {
        client.socket.emit('message', data.toString());
      });

      execProcess.stderr.on('data', (data) => {
        client.socket.emit('message', `\\x1b[1;31m${data.toString()}\\x1b[0m`);
      });

      execProcess.on('close', (code) => {
        client.socket.emit('message', `\\r\\nvictim@koth-machine:~$ `);
        
        // Check if command indicates admin access gained
        this.checkAdminStatus(teamId, command);
      });

    } catch (error) {
      console.error(`Error executing command for ${teamId}:`, error);
      client.socket.emit('message', `\\x1b[1;31mError executing command\\x1b[0m\\r\\n`);
      client.socket.emit('message', `victim@koth-machine:~$ `);
    }
  }

  handleSimulatedCommand(teamId, command) {
    const client = this.clients.get(teamId);
    if (!client) return;

    // Simulate command responses
    let response = '';
    const cmd = command.toLowerCase().trim();
    
    // File system operations
    if (cmd === 'ls' || cmd === 'ls -la' || cmd === 'ls -l') {
      response = cmd.includes('-l') || cmd.includes('-a') ? 
        'total 32\\r\\ndrwxr-xr-x 2 user user 4096 Jan 29 12:00 .\\r\\ndrwxr-xr-x 3 root root 4096 Jan 29 11:58 ..\\r\\n-rw-r--r-- 1 user user  220 Jan 29 11:58 .bash_logout\\r\\n-rw-r--r-- 1 user user 3771 Jan 29 11:58 .bashrc\\r\\n-rw-r--r-- 1 user user  807 Jan 29 11:58 .profile\\r\\n-rw------- 1 user user   33 Jan 29 12:00 flag.txt\\r\\n-rw-r--r-- 1 user user 1024 Jan 29 11:59 backup.txt\\r\\n-rw-r--r-- 1 user user  512 Jan 29 12:01 notes.txt\\r\\n-rwxr-xr-x 1 user user 2048 Jan 29 12:02 exploit.py\\r\\n' :
        'backup.txt  exploit.py  flag.txt  notes.txt\\r\\n';
    } else if (cmd === 'pwd') {
      response = '/home/user\\r\\n';
    } else if (cmd === 'whoami') {
      response = client.isAdmin ? 'root\\r\\n' : 'user\\r\\n';
    } else if (cmd === 'id') {
      response = client.isAdmin ? 
        'uid=0(root) gid=0(root) groups=0(root)\\r\\n' :
        'uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),131(lxd),132(sambashare)\\r\\n';
    }
    
    // File reading
    else if (cmd.includes('cat flag.txt') || cmd.includes('cat /home/user/flag.txt')) {
      if (client.isAdmin) {
        response = '\\x1b[1;32mCTF{koth_admin_access_achieved_ubuntu}\\x1b[0m\\r\\n';
      } else {
        response = '\\x1b[1;31mcat: flag.txt: Permission denied\\x1b[0m\\r\\n';
      }
    } else if (cmd.includes('cat backup.txt')) {
      response = '# Backup configuration\\r\\nDB_HOST=localhost\\r\\nDB_USER=backup_user\\r\\nDB_PASS=weak_password123\\r\\nBACKUP_DIR=/var/backups\\r\\n# TODO: Fix permissions on backup directory\\r\\n';
    } else if (cmd.includes('cat notes.txt')) {
      response = 'Meeting Notes:\\r\\n- Remember to patch the sudo vulnerability\\r\\n- Default SSH keys still in /home/admin/.ssh/\\r\\n- Web service running on port 8080 has SQL injection\\r\\n- Cron job runs as root every 5 minutes\\r\\n';
    } else if (cmd.includes('cat /etc/passwd')) {
      response = 'root:x:0:0:root:/root:/bin/bash\\r\\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\\r\\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\\r\\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\\r\\nuser:x:1000:1000:CTF User:/home/user:/bin/bash\\r\\nadmin:x:1001:1001:Admin User:/home/admin:/bin/bash\\r\\nmysql:x:113:118:MySQL Server,,,:/nonexistent:/bin/false\\r\\n';
    }
    
    // Process and system information
    else if (cmd.includes('ps aux') || cmd.includes('ps -aux')) {
      response = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\\r\\n';
      response += 'root         1  0.0  0.1  18508  3396 ?        Ss   12:00   0:00 /sbin/init\\r\\n';
      response += 'root       123  0.0  0.2  12345  1234 ?        S    12:01   0:00 /usr/sbin/sshd -D\\r\\n';
      response += 'root       456  0.0  0.3  15678  2345 ?        S    12:01   0:00 /usr/sbin/apache2 -DFOREGROUND\\r\\n';
      response += 'mysql      789  0.1  2.5 125678 12345 ?        Sl   12:01   0:02 /usr/sbin/mysqld\\r\\n';
      response += 'root       234  0.0  0.1   8765  1234 ?        S    12:02   0:00 vulnerable_service\\r\\n';
      response += 'user       567  0.0  0.1   7890  2345 pts/0    S+   12:03   0:00 bash\\r\\n';
    } else if (cmd.includes('netstat -tulpn') || cmd.includes('ss -tulpn') || cmd.includes('netstat') || cmd.includes('ss')) {
      response = 'Active Internet connections (only servers)\\r\\n';
      response += 'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\\r\\n';
      response += 'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      123/sshd\\r\\n';
      response += 'tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      456/apache2\\r\\n';
      response += 'tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN      789/mysqld\\r\\n';
      response += 'tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      234/vulnerable_service\\r\\n';
      response += 'tcp        0      0 0.0.0.0:9999            0.0.0.0:*               LISTEN      234/vulnerable_service\\r\\n';
    }
    
    // Network tools
    else if (cmd.includes('nmap') || cmd.includes('ncat') || cmd.includes('nc')) {
      if (!client.installedPackages.has('nmap') && (cmd.includes('nmap'))) {
        response = '\\x1b[1;31mbash: nmap: command not found\\x1b[0m\\r\\n\\x1b[1;33mHint: Try "sudo apt install nmap"\\x1b[0m\\r\\n';
      } else if (cmd.includes('nmap localhost') || cmd.includes('nmap 127.0.0.1')) {
        response = 'Starting Nmap 7.80 ( https://nmap.org )\\r\\n';
        response += 'Nmap scan report for localhost (127.0.0.1)\\r\\n';
        response += 'Host is up (0.000013s latency).\\r\\n';
        response += 'Not shown: 995 closed ports\\r\\n';
        response += 'PORT     STATE SERVICE\\r\\n';
        response += '22/tcp   open  ssh\\r\\n';
        response += '80/tcp   open  http\\r\\n';
        response += '3306/tcp open  mysql\\r\\n';
        response += '8080/tcp open  http-proxy\\r\\n';
        response += '9999/tcp open  abyss\\r\\n\\r\\n';
        response += 'Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds\\r\\n';
      } else if (cmd.includes('nc -l') || cmd.includes('ncat -l')) {
        response = '\\x1b[1;33mListening on port... (simulated)\\x1b[0m\\r\\n';
      }
    }
    
    // Package management (APT)
    else if (cmd.includes('apt update') || cmd.includes('apt-get update')) {
      response = client.isAdmin ? 
        'Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease\\r\\nGet:2 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]\\r\\nGet:3 http://archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]\\r\\nGet:4 http://archive.ubuntu.com/ubuntu focal-security InRelease [114 kB]\\r\\nFetched 336 kB in 1s (423 kB/s)\\r\\nReading package lists... Done\\r\\n' :
        '\\x1b[1;31mE: Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)\\r\\nE: Unable to lock directory /var/lib/apt/lists/\\x1b[0m\\r\\n';
    } else if (cmd.includes('sudo apt update') || cmd.includes('sudo apt-get update')) {
      response = 'Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease\\r\\nGet:2 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]\\r\\nGet:3 http://archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]\\r\\nGet:4 http://archive.ubuntu.com/ubuntu focal-security InRelease [114 kB]\\r\\nFetched 336 kB in 1s (423 kB/s)\\r\\nReading package lists... Done\\r\\n';
    } else if (cmd.includes('sudo apt install')) {
      const packageMatch = cmd.match(/sudo apt install (.+)/);
      if (packageMatch) {
        const packages = packageMatch[1].split(' ').filter(p => p.length > 0);
        packages.forEach(pkg => {
          client.installedPackages.add(pkg.trim());
        });
        response = `Reading package lists... Done\\r\\nBuilding dependency tree\\r\\nReading state information... Done\\r\\nThe following NEW packages will be installed:\\r\\n  ${packages.join(' ')}\\r\\n0 upgraded, ${packages.length} newly installed, 0 to remove and 0 not upgraded.\\r\\nNeed to get 1,234 kB of archives.\\r\\nAfter this operation, 5,678 kB of additional disk space will be used.\\r\\nGet:1 http://archive.ubuntu.com/ubuntu focal/main amd64 ${packages[0]} amd64 [123 kB]\\r\\nFetched 1,234 kB in 2s (567 kB/s)\\r\\nSelecting previously unselected package ${packages[0]}.\\r\\n(Reading database ... 123456 files and directories currently installed.)\\r\\nPreparing to unpack .../${packages[0]}_amd64.deb ...\\r\\nUnpacking ${packages[0]} ...\\r\\nSetting up ${packages[0]} ...\\r\\nProcessing triggers for man-db (2.9.1-1) ...\\r\\n`;
      }
    } else if (cmd.includes('apt list --installed') || cmd.includes('dpkg -l')) {
      response = 'Listing... Done\\r\\n';
      client.installedPackages.forEach(pkg => {
        response += `${pkg}/focal,now 1.0.0-1ubuntu1 amd64 [installed]\\r\\n`;
      });
    }
    
    // Privilege escalation attempts
    else if (cmd.includes('sudo -l')) {
      response = client.isAdmin ? 
        'User root may run the following commands on koth-machine:\\r\\n    (ALL : ALL) ALL\\r\\n' :
        'Matching Defaults entries for user on koth-machine:\\r\\n    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\\r\\n\\r\\nUser user may run the following commands on koth-machine:\\r\\n    (ALL) NOPASSWD: /usr/bin/backup_script.sh\\r\\n    (root) /bin/cat /var/log/*\\r\\n';
    } else if (cmd.includes('sudo su') || cmd === 'sudo su -') {
      if (!client.isAdmin) {
        response = '[sudo] password for user: \\r\\n\\x1b[1;32mExploiting sudo vulnerability...\\x1b[0m\\r\\n';
        this.grantAdminAccess(teamId);
        response += '\\x1b[1;32mroot@koth-machine:~#\\x1b[0m ';
      } else {
        response = 'root@koth-machine:~# ';
      }
    } else if (cmd.includes('sudo') && cmd.includes('backup_script.sh')) {
      response = '\\x1b[1;33mRunning backup script...\\x1b[0m\\r\\n';
      response += '\\x1b[1;32mBackup completed. Privilege escalation successful!\\x1b[0m\\r\\n';
      this.grantAdminAccess(teamId);
    }
    
    // System information
    else if (cmd === 'uname -a') {
      response = 'Linux koth-machine 5.4.0-192-generic #212-Ubuntu SMP Fri Nov 5 12:22:45 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux\\r\\n';
    } else if (cmd === 'uptime') {
      response = ' 12:34:56 up  2:34,  2 users,  load average: 0.08, 0.03, 0.05\\r\\n';
    } else if (cmd === 'free -h') {
      response = '              total        used        free      shared  buff/cache   available\\r\\nMem:          1.9Gi       450Mi       1.2Gi       8.0Mi       331Mi       1.3Gi\\r\\nSwap:         1.0Gi          0B       1.0Gi\\r\\n';
    } else if (cmd === 'df -h') {
      response = 'Filesystem      Size  Used Avail Use% Mounted on\\r\\n/dev/sda1        20G  9.1G  9.8G  49% /\\r\\ndevtmpfs        949M     0  949M   0% /dev\\r\\ntmpfs           959M     0  959M   0% /dev/shm\\r\\ntmpfs           959M  8.6M  950M   1% /run\\r\\n';
    }
    
    // File permissions and SUID
    else if (cmd.includes('find') && cmd.includes('-perm') && cmd.includes('4000')) {
      response = '/usr/bin/sudo\\r\\n/usr/bin/passwd\\r\\n/usr/bin/chsh\\r\\n/usr/bin/chfn\\r\\n/usr/bin/gpasswd\\r\\n/usr/bin/newgrp\\r\\n/usr/local/bin/vulnerable_binary\\r\\n/bin/ping\\r\\n';
    } else if (cmd.includes('./vulnerable_binary') || cmd.includes('/usr/local/bin/vulnerable_binary')) {
      response = '\\x1b[1;32mExploiting SUID binary...\\x1b[0m\\r\\n';
      response += '\\x1b[1;32mPrivilege escalation successful!\\x1b[0m\\r\\n';
      this.grantAdminAccess(teamId);
    }
    
    // Log files and reconnaissance
    else if (cmd.includes('cat /var/log/auth.log')) {
      response = 'Jan 29 12:00:01 koth-machine sshd[1234]: Failed password for invalid user admin from 192.168.1.50 port 45678 ssh2\\r\\n';
      response += 'Jan 29 12:01:15 koth-machine sudo:     user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/usr/bin/backup_script.sh\\r\\n';
      response += 'Jan 29 12:02:30 koth-machine sshd[5678]: Accepted password for user from 192.168.1.1 port 54321 ssh2\\r\\n';
    } else if (cmd.includes('crontab -l')) {
      response = client.isAdmin ?
        '# Edit this file to introduce tasks to be run by cron.\\r\\n*/5 * * * * /usr/local/bin/cleanup.sh\\r\\n0 2 * * * /usr/bin/backup_script.sh\\r\\n' :
        'no crontab for user\\r\\n';
    }
    
    // Default case
    else {
      response = `bash: ${command}: command not found\\r\\n\\x1b[1;33mTry: ls, ps aux, netstat, sudo apt install <package>, or other Linux commands\\x1b[0m\\r\\n`;
    }

    client.socket.emit('message', response);
    
    // Show appropriate prompt
    const prompt = client.isAdmin ? 'root@koth-machine:~# ' : 'user@koth-machine:~$ ';
    client.socket.emit('message', prompt);
    
    // Update last command time
    client.lastCommand = Date.now();
    
    // Check for admin status changes
    this.checkAdminStatus(teamId, command);
  }

  checkAdminStatus(teamId, command) {
    // Simulate admin detection based on certain commands or patterns
    const adminTriggers = [
      'sudo',
      'privilege_escalation_exploit',
      'exploit',
      'su root',
      'systemctl',
      '/etc/passwd',
      'nc -l'
    ];

    if (adminTriggers.some(trigger => command.toLowerCase().includes(trigger))) {
      this.grantAdminAccess(teamId);
    }
  }

  grantAdminAccess(teamId) {
    const client = this.clients.get(teamId);
    if (!client || client.isAdmin) return;

    // Remove admin from previous team
    if (this.currentAdmin && this.currentAdmin !== teamId) {
      const prevAdmin = this.clients.get(this.currentAdmin);
      if (prevAdmin) {
        prevAdmin.isAdmin = false;
        prevAdmin.socket.emit('message', JSON.stringify({
          type: 'admin-status',
          data: this.getAdminStatus()
        }));
      }
      
      // Record admin time
      const adminTime = Date.now() - this.adminStartTime;
      this.adminHistory.push({
        team: this.currentAdmin,
        adminTime,
        endTime: new Date().toISOString()
      });
    }

    // Grant admin to new team
    client.isAdmin = true;
    client.adminSince = new Date().toISOString();
    this.currentAdmin = teamId;
    this.adminStartTime = Date.now();

    // Notify all clients
    this.broadcastAdminStatus();
    
    // Notify specific events
    this.broadcastNotification(`🚨 Team ${teamId} gained admin access!`, 'warning');
    
    // Start admin loss timer (simulate other teams attacking)
    this.scheduleAdminLoss(teamId);
  }

  scheduleAdminLoss(teamId) {
    // Simulate other teams trying to gain access
    // Admin position becomes more vulnerable over time
    setTimeout(() => {
      if (this.currentAdmin === teamId) {
        const client = this.clients.get(teamId);
        if (client && Math.random() < 0.3) { // 30% chance of losing admin every 30 seconds
          client.isAdmin = false;
          this.currentAdmin = null;
          
          const adminTime = Date.now() - this.adminStartTime;
          this.adminHistory.push({
            team: teamId,
            adminTime,
            endTime: new Date().toISOString()
          });
          
          this.broadcastAdminStatus();
          this.broadcastNotification(`💥 Team ${teamId} lost admin access to rival teams!`, 'danger');
        }
      }
    }, 30000 + Math.random() * 60000); // 30-90 seconds
  }

  getAdminStatus() {
    const leaderboard = this.adminHistory
      .reduce((acc, entry) => {
        const existing = acc.find(e => e.team === entry.team);
        if (existing) {
          existing.adminTime += entry.adminTime;
          existing.lastSeen = entry.endTime;
        } else {
          acc.push({
            team: entry.team,
            adminTime: entry.adminTime,
            lastSeen: entry.endTime
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.adminTime - a.adminTime);

    return {
      currentAdmin: this.currentAdmin,
      adminSince: this.currentAdmin ? this.clients.get(this.currentAdmin)?.adminSince : null,
      totalAdmins: this.adminHistory.length,
      leaderboard
    };
  }

  sendAdminStatus() {
    const status = this.getAdminStatus();
    this.clients.forEach((client) => {
      client.socket.emit('message', JSON.stringify({
        type: 'admin-status',
        data: status
      }));
    });
  }

  broadcastAdminStatus() {
    const status = this.getAdminStatus();
    this.clients.forEach((client, teamId) => {
      try {
        client.socket.emit('message', JSON.stringify({
          type: 'admin-status',
          data: status
        }));
      } catch (error) {
        console.error(`Error sending admin status to ${teamId}:`, error);
      }
    });
  }

  broadcastNotification(message, type = 'info') {
    this.clients.forEach((client) => {
      try {
        client.socket.emit('message', JSON.stringify({
          type: 'team-notification',
          data: { message, type }
        }));
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });
  }

  handleDisconnection(teamId) {
    const client = this.clients.get(teamId);
    if (!client) return;

    console.log(`Team ${teamId} disconnected`);

    // Clean up Docker container
    if (client.containerId && client.containerId !== 'simulation') {
      spawn('docker', ['stop', client.containerId]);
    }

    // Remove admin status if they were admin
    if (client.isAdmin) {
      const adminTime = Date.now() - this.adminStartTime;
      this.adminHistory.push({
        team: teamId,
        adminTime,
        endTime: new Date().toISOString()
      });
      
      this.currentAdmin = null;
      this.broadcastAdminStatus();
    }

    this.clients.delete(teamId);
  }

  start(port = 8080) {
    this.server.listen(port, () => {
      console.log(`KOTH Server running on port ${port}`);
      console.log('Waiting for teams to connect...');
    });
  }
}

// Start the server
const kothServer = new KOTHServer();
kothServer.start();

module.exports = KOTHServer;